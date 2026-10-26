import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { AppState, PermissionsAndroid, Platform } from 'react-native';
// NOTE: use the same import style as your AssistTextInput uses for this package
import Voice from '@dev-amirzubair/react-native-voice';
import { speak, onSpeechLifecycle } from '../services/assist/voiceGuide';
import { useVoiceGuide } from './VoiceGuideContext';
import {
    Option,
    capitalizeFirst,
    normalize,
    parseCommand,
    rank,
    fieldScore,
    similarity,
    speakable,
} from '../services/assist/Voicecommands';

/** What a dropdown / picker component must expose through its ref */
export type VoiceDropdownHandle = {
    open: () => void;
    close: () => void;
    getOptions: () => Option[];
    select: (value: string) => void;
};

export type VoiceControlDef = {
    id: string;
    label: string; // how the app speaks it: "functional location"
    aliases: string[]; // how the user may say it
    keywords?: string[];
    kind: 'dropdown' | 'text' | 'checkbox' | 'custom' | 'panel';
    // dropdown / panel
    open?: () => void;
    close?: () => void | string; // a panel can return a sentence to speak
    cancel?: () => void;
    confirm?: () => void | string; // "ok" applies the panel's selection
    getOptions?: () => Option[];
    select?: (value: string) => void;
    // text
    getText?: () => string;
    setText?: (text: string) => void;
    // checkbox
    setChecked?: (checked: boolean) => void;
    // custom (for example a date): return the sentence to speak, or null if not understood
    handleValue?: (spoken: string) => string | null;
    prompt?: string;
};

type ControlRef = React.MutableRefObject<VoiceControlDef>;
type ActionRef = React.MutableRefObject<() => void | Promise<void>>;

type Mode =
    | { type: 'command' }
    | { type: 'value'; id: string }
    | { type: 'dictate'; id: string };

export type VoiceControlContextValue = {
    listening: boolean;
    lastHeard: string;
    startListening: () => Promise<void>;
    stopListening: (silent?: boolean) => Promise<void>;
    registerControl: (id: string, ref: ControlRef) => void;
    unregisterControl: (id: string) => void;
    registerAction: (name: string, ref: ActionRef) => void;
    unregisterAction: (name: string) => void;
};

const VoiceControlContext = createContext<VoiceControlContextValue | null>(null);

const WATCHDOG_MS = 15000;

const HELP =
    'You can say: open or enter a field name, then say its value. ' +
    'Say close to close a list. Say ok to apply a selection, or cancel to dismiss it. ' +
    'Say done when you finish typing. ' +
    'Say save, or save and send to leader. Say stop listening to turn voice control off.';

async function ensureMicPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
        return true;
    }
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    return result === PermissionsAndroid.RESULTS.GRANTED;
}

function pickCandidate(heard: string, candidates: Option[]): Option | null {
    const t = normalize(heard);
    const idx = /^(first|1|1st)$/.test(t)
        ? 0
        : /^(second|2|2nd)$/.test(t)
            ? 1
            : /^(third|3|3rd)$/.test(t)
                ? 2
                : -1;
    if (idx >= 0 && candidates[idx]) {
        return candidates[idx];
    }
    const top = rank(heard, candidates)[0];
    return top && top.score >= 0.85 ? top.option : null;
}

export function VoiceControlProvider({ children }: { children: React.ReactNode }) {
    const { stopGuidance } = useVoiceGuide();

    const [listening, setListening] = useState(false);
    const [lastHeard, setLastHeard] = useState('');

    const controlsRef = useRef(new Map<string, ControlRef>());
    const actionsRef = useRef(new Map<string, ActionRef>());
    const modeRef = useRef<Mode>({ type: 'command' });
    const activeIdRef = useRef<string | null>(null);
    const pendingRef = useRef<Option[] | null>(null);

    const sessionRef = useRef(false); // voice control switched on
    const busyRef = useRef(false); // processing a command
    const speakingRef = useRef(false); // text-to-speech is talking
    const startingRef = useRef(false);

    const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const utteranceRef = useRef<(heard: string) => void>(() => { });
    const startRef = useRef<() => void>(() => { });

    // ---------- registry ----------
    const registerControl = useCallback((id: string, ref: ControlRef) => {
        controlsRef.current.set(id, ref);
    }, []);
    const unregisterControl = useCallback((id: string) => {
        controlsRef.current.delete(id);
    }, []);
    const registerAction = useCallback((name: string, ref: ActionRef) => {
        actionsRef.current.set(name, ref);
    }, []);
    const unregisterAction = useCallback((name: string) => {
        actionsRef.current.delete(name);
    }, []);

    // ---------- timers ----------
    const clearWatchdog = () => {
        if (watchdogRef.current) {
            clearTimeout(watchdogRef.current);
            watchdogRef.current = null;
        }
    };
    const clearRestart = () => {
        if (restartTimerRef.current) {
            clearTimeout(restartTimerRef.current);
            restartTimerRef.current = null;
        }
    };

    const scheduleRestart = useCallback((delay = 400) => {
        if (!sessionRef.current) {
            return;
        }
        clearRestart();
        restartTimerRef.current = setTimeout(() => startRef.current(), delay);
    }, []);

    // ---------- recognizer ----------
    const startRecognizer = useCallback(async () => {
        if (
            !sessionRef.current ||
            speakingRef.current ||
            busyRef.current ||
            startingRef.current
        ) {
            return;
        }
        startingRef.current = true;
        try {
            // bind every time, so this still works if another component (e.g. AssistTextInput) rebinds Voice
            Voice.onSpeechResults = (e: any) => {
                clearWatchdog();
                const heard = e?.value?.[0];
                if (!sessionRef.current || speakingRef.current || busyRef.current || !heard) {
                    return;
                }
                utteranceRef.current(String(heard));
            };
            Voice.onSpeechError = (e: any) => {
                clearWatchdog();
                const code = String(e?.error?.code ?? e?.error?.message ?? '');
                console.log('[VoiceControl] speech error:', code);
                if (!sessionRef.current) {
                    return;
                }
                if (/(^|\D)9(\D|$)|permission/i.test(code)) {
                    sessionRef.current = false;
                    setListening(false);
                    speak('Microphone permission is needed for voice control');
                    return;
                }
                // no speech / no match / busy: just listen again
                if (!busyRef.current && !speakingRef.current) {
                    scheduleRestart(600);
                }
                console.log('[VoiceControl] partial:', e?.value?.[0]);
            };
            

            try {
                await Voice.cancel();
            } catch { }
            await Voice.start('en-IN');

            clearWatchdog();
            watchdogRef.current = setTimeout(() => {
                if (sessionRef.current && !busyRef.current && !speakingRef.current) {
                    scheduleRestart(100);
                }
            }, WATCHDOG_MS);
        } catch (error) {
            console.warn('[VoiceControl] start failed:', error);
            scheduleRestart(1500);
        } finally {
            startingRef.current = false;
        }
    }, [scheduleRestart]);
    startRef.current = startRecognizer;

    // Pause the mic while the app is talking, resume afterwards
    useEffect(() => {
        return onSpeechLifecycle({
            start: () => {
                speakingRef.current = true;
                clearWatchdog();
                clearRestart();
                try {
                    const p: any = Voice.cancel();
                    p?.catch?.(() => { });
                } catch { }
            },
            end: () => {
                speakingRef.current = false;
                scheduleRestart(500);
            },
        });
    }, [scheduleRestart]);

    // ---------- session ----------
    const stopListening = useCallback(async (silent?: boolean) => {
        const wasOn = sessionRef.current;
        sessionRef.current = false;
        clearRestart();
        clearWatchdog();
        modeRef.current = { type: 'command' };
        pendingRef.current = null;
        activeIdRef.current = null;
        setListening(false);
        try {
            await Voice.cancel();
        } catch { }
        if (wasOn && !silent) {
            await speak('Voice control is off');
        }
    }, []);

    const startListening = useCallback(async () => {
        if (sessionRef.current) {
            return;
        }
        if (!(await ensureMicPermission())) {
            speak('Microphone permission is required for voice control');
            return;
        }
        stopGuidance(); // the automatic field guide and voice control must not talk over each other
        sessionRef.current = true;
        modeRef.current = { type: 'command' };
        pendingRef.current = null;
        activeIdRef.current = null;
        busyRef.current = false;
        setListening(true);
        await speak('Voice control is on');
        scheduleRestart(300);
    }, [stopGuidance, scheduleRestart]);

    // Turn off when the app goes to the background; clean up on unmount
    useEffect(() => {
        const sub = AppState.addEventListener('change', state => {
            if (state !== 'active') {
                stopListening(true);
            }
        });
        return () => {
            sub.remove();
            sessionRef.current = false;
            clearRestart();
            clearWatchdog();
            try {
                const p: any = Voice.destroy();
                p?.then?.(() => Voice.removeAllListeners?.()).catch?.(() => { });
            } catch { }
        };
    }, [stopListening]);

    // ---------- command processing ----------
    const say = (text: string) => speak(speakable(text));

    const getCtl = (id: string | null): VoiceControlDef | null =>
        (id && controlsRef.current.get(id)?.current) || null;

    const findPanel = (): VoiceControlDef | null =>
        Array.from(controlsRef.current.values())
            .map(r => r.current)
            .find(c => c.kind === 'panel') ?? null;

    const resolveControl = (target: string, minScore = 0.75): VoiceControlDef | null => {
        const t = normalize(target).replace(/^(the|my) /, '');
        if (!t) {
            return null;
        }
        let best: VoiceControlDef | null = null;
        let bestScore = 0;
        for (const ref of Array.from(controlsRef.current.values())) {
            const ctl = ref.current;
            const names = [ctl.label, ...ctl.aliases, ...(ctl.keywords ?? [])];
            let s = fieldScore(t, ctl.label, names);
            for (const n of names) {
                s = Math.max(s, similarity(t, n, false));
            }
            if (s > bestScore) {
                bestScore = s;
                best = ctl;
            }
        }
        console.log('[VoiceControl] resolve', t, '->', best?.id, bestScore.toFixed(2));
        return bestScore >= minScore ? best : null;
    };

    const closeActive = () => {
        const prev = getCtl(activeIdRef.current);
        if (prev && prev.kind === 'dropdown') {
            prev.close?.();
        }
        activeIdRef.current = null;
    };

    const activate = (ctl: VoiceControlDef): string => {
        closeActive();
        pendingRef.current = null;
        activeIdRef.current = ctl.id;
        switch (ctl.kind) {
            case 'dropdown':
                ctl.open?.();
                modeRef.current = { type: 'value', id: ctl.id };
                return `Opening ${ctl.label}`;
            case 'text':
                modeRef.current = { type: 'dictate', id: ctl.id };
                return `Entering ${ctl.label}. Say done when finished`;
            case 'custom':
                modeRef.current = { type: 'value', id: ctl.id };
                return ctl.prompt ?? `Say the ${ctl.label}`;
            case 'panel':
                ctl.open?.();
                modeRef.current = { type: 'command' };
                activeIdRef.current = null;
                return `Opening ${ctl.label}`;
            default:
                modeRef.current = { type: 'command' };
                activeIdRef.current = null;
                return `Say check or uncheck ${ctl.label}`;
        }
    };

    const finishSelect = (ctl: VoiceControlDef, option: Option): string | null => {
        ctl.select?.(option.value);
        ctl.close?.();
        pendingRef.current = null;
        activeIdRef.current = null;
        modeRef.current = { type: 'command' };
        return null;
        //return `${option.label} is selected`;
    };

    const process = async (heard: string): Promise<string | null> => {
        const mode = modeRef.current;
        const cmd = parseCommand(heard);

        if (cmd.type === 'stopListening') {
            await stopListening();
            return null;
        }

        // ---- typing into a text field ----
        if (mode.type === 'dictate') {
            const ctl = getCtl(mode.id);
            if (!ctl) {
                modeRef.current = { type: 'command' };
            } else {
                if (cmd.type === 'stopDictation') {
                    modeRef.current = { type: 'command' };
                    activeIdRef.current = null;
                    return null;
                    //return `${ctl.label} entered`;
                }
                if (/^clear( text)?$/.test(normalize(heard))) {
                    ctl.setText?.('');
                    return `${ctl.label} cleared`;
                }
                // only clear navigation commands leave dictation; everything else is text
                const isNav =
                    cmd.type === 'save' ||
                    (cmd.type === 'close' && (!cmd.target || !!resolveControl(cmd.target, 0.75))) ||
                    (cmd.type === 'open' && !!resolveControl(cmd.target, 0.75));
                if (!isNav) {
                    const text = capitalizeFirst(heard.trim());
                    const current = ctl.getText?.() ?? '';
                    ctl.setText?.(current ? `${current} ${text}` : text);
                    return null; // stay quiet between phrases
                }
                modeRef.current = { type: 'command' };
                activeIdRef.current = null;
            }
        }

        // ---- choosing a value ----
        if (mode.type === 'value') {
            const ctl = getCtl(mode.id);
            if (!ctl) {
                modeRef.current = { type: 'command' };
            } else if (ctl.kind === 'custom') {
                if (cmd.type === 'unknown') {
                    const reply = ctl.handleValue?.(heard) ?? null;
                    if (reply) {
                        modeRef.current = { type: 'command' };
                        activeIdRef.current = null;
                        return reply;
                    }
                    return `I did not understand. ${ctl.prompt ?? ''}`;
                }
            } else if (ctl.kind === 'dropdown') {
                const options = ctl.getOptions?.() ?? [];

                // "enter jh c" / "select jh c" should match the option "JH-C", not open a field
                const spokenValue = heard.replace(/^(enter|select|choose|set)\s+/i, '');

                // answer to "Did you mean ...?"
                if (pendingRef.current) {
                    const pick = pickCandidate(spokenValue, pendingRef.current);
                    if (pick) {
                        return finishSelect(ctl, pick);
                    }
                    pendingRef.current = null;
                }

                const ranked = rank(spokenValue, options);
                if (ranked[0] && ranked[0].score >= 0.9) {
                    return finishSelect(ctl, ranked[0].option);
                }

                // a plain value, or "enter xyz" where xyz is not a known field
                const isValueUtterance =
                    cmd.type === 'unknown' ||
                    (cmd.type === 'open' && !resolveControl(cmd.target, 0.9));

                if (isValueUtterance) {
                    if (!options.length) {
                        return `The ${ctl.label} list is still loading. Please say it again`;
                    }
                    const top = ranked[0];
                    if (!top || top.score < 0.6) {
                        return `I did not find ${spokenValue} in ${ctl.label}. Please try again`;
                    }
                    const close = ranked.filter(r => r.score >= top.score - 0.08).slice(0, 3);
                    if (close.length > 1) {
                        pendingRef.current = close.map(c => c.option);
                        return `Did you mean ${close.map(c => c.option.label).join(' or ')}?`;
                    }
                    return finishSelect(ctl, top.option);
                }
                // otherwise it was a real command (close, open another field, save...): handled below
            }
        }

        // ---- commands ----
        switch (cmd.type) {
            case 'open': {
                const ctl = resolveControl(cmd.target);
                return ctl ? activate(ctl) : `I could not find ${cmd.target}`;
            }
            case 'close': {
                const ctl = cmd.target
                    ? resolveControl(cmd.target, 0.7)
                    : getCtl(activeIdRef.current) ?? findPanel();
                if (!ctl) {
                    return cmd.target ? `I could not find ${cmd.target}` : 'Nothing is open';
                }
                const message = ctl.close?.();
                if (activeIdRef.current === ctl.id) {
                    activeIdRef.current = null;
                }
                modeRef.current = { type: 'command' };
                pendingRef.current = null;
                return typeof message === 'string' ? message : `Closed ${ctl.label}`;
            }
            case 'clear': {
                const ctl = resolveControl(cmd.target);
                if (ctl?.kind === 'text') {
                    ctl.setText?.('');
                    return `${ctl.label} cleared`;
                }
                return ctl ? `I can not clear ${ctl.label}` : `I could not find ${cmd.target}`;
            }
            case 'check': {
                const ctl = resolveControl(cmd.target);
                if (ctl?.kind === 'checkbox') {
                    ctl.setChecked?.(cmd.on);
                    return `${ctl.label} ${cmd.on ? 'checked' : 'unchecked'}`;
                }
                return ctl ? `${ctl.label} is not a checkbox` : `I could not find ${cmd.target}`;
            }
            case 'save': {
                const action = actionsRef.current.get(cmd.send ? 'saveAndSend' : 'save');
                if (!action) {
                    return 'Save is not available on this screen';
                }
                closeActive();
                modeRef.current = { type: 'command' };
                pendingRef.current = null;
                await say(cmd.send ? 'Saving and sending to leader' : 'Saving the given suggestion');
                await action.current(); // the screen speaks the success or failure message itself
                return null;
            }
            case 'confirm': {
                const panel = findPanel();
                if (!panel) {
                    return 'Nothing to confirm';
                }
                closeActive();
                const message = panel.confirm ? panel.confirm() : panel.close?.();
                modeRef.current = { type: 'command' };
                pendingRef.current = null;
                activeIdRef.current = null;
                return typeof message === 'string' ? message : `Closed ${panel.label}`;
            }
            case 'cancel': {
                let ctl = cmd.target ? resolveControl(cmd.target, 0.7) : getCtl(activeIdRef.current);
                if (!ctl && !cmd.target) {
                    ctl = findPanel();
                }
                if (!ctl) {
                    return 'Nothing to cancel';
                }
                if (ctl.kind === 'panel') {
                    ctl.cancel?.();
                } else {
                    ctl.close?.();
                }
                activeIdRef.current = null;
                modeRef.current = { type: 'command' };
                pendingRef.current = null;
                return ctl.kind === 'panel' ? `${ctl.label} cancelled` : `Closed ${ctl.label}`;
            }
            case 'help':
                return HELP;
            case 'stopDictation':
                return null;
            default:
                return 'Sorry, say that again';
        }
    };

    const handleUtterance = async (heard: string) => {
        busyRef.current = true;
        clearWatchdog();
        setLastHeard(heard);
        console.log('[VoiceControl] heard:', heard, 'mode:', modeRef.current.type);
        try {
            const reply = await process(heard);
            if (reply) {
                await say(reply);
            }
        } catch (error) {
            console.warn('[VoiceControl] command failed:', error);
            await say('Sorry, something went wrong');
        } finally {
            busyRef.current = false;
            scheduleRestart(300);
        }
    };
    utteranceRef.current = handleUtterance;

    const value = useMemo(
        () => ({
            listening,
            lastHeard,
            startListening,
            stopListening,
            registerControl,
            unregisterControl,
            registerAction,
            unregisterAction,
        }),
        [
            listening,
            lastHeard,
            startListening,
            stopListening,
            registerControl,
            unregisterControl,
            registerAction,
            unregisterAction,
        ],
    );

    return <VoiceControlContext.Provider value={value}>{children}</VoiceControlContext.Provider>;
}

export function useVoiceControl() {
    const ctx = useContext(VoiceControlContext);
    if (!ctx) {
        throw new Error('useVoiceControl must be used within VoiceControlProvider');
    }
    return ctx;
}

/**
 * Register a field. Pass a fresh object every render; the latest one is always used.
 * Pass enabled=false to keep it unregistered (e.g. a modal field while the modal is closed).
 */
export function useRegisterVoiceControl(def: VoiceControlDef, enabled = true) {
    const { registerControl, unregisterControl } = useVoiceControl();
    const ref = useRef(def);
    ref.current = def;
    useEffect(() => {
        if (!enabled) {
            return;
        }
        registerControl(def.id, ref);
        return () => unregisterControl(def.id);
    }, [def.id, enabled, registerControl, unregisterControl]);
}

/** Register a screen action such as 'save' or 'saveAndSend'. */
export function useRegisterVoiceAction(name: string, handler: () => void | Promise<void>) {
    const { registerAction, unregisterAction } = useVoiceControl();
    const ref = useRef(handler);
    ref.current = handler;
    useEffect(() => {
        registerAction(name, ref);
        return () => unregisterAction(name);
    }, [name, registerAction, unregisterAction]);
}