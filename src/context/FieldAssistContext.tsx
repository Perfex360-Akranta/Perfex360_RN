import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { pickImage, readTextFromImage, ImageSource } from '../services/assist/imageText';
import { startSpeechSession, SpeechSession } from '../services/assist/speechToText';

export type DropdownOption = {
  label?: string;
  value?: any;
  [key: string]: any;
};

export type ActiveField = {
  id: string;
  label?: string;
  getValue: () => string;
  setText: (text: string) => void;
  multiline?: boolean;
  maxLength?: number;
  type?: 'text' | 'dropdown';
  getOptions?: () => DropdownOption[];
  onSelectOption?: (value: any, label?: string) => void;
};

export type FieldAssistContextValue = {
  activeField: ActiveField | null;
  hasField: boolean;
  isOpen: boolean;
  listening: boolean;
  preview: string;
  busy: ImageSource | null;
  hostedCount: number;
  openMenuFieldId: string | null;
  successFieldId: string | null;
  retainHost: () => void;
  releaseHost: () => void;
  registerField: (field: ActiveField) => void;
  unregisterField: (id: string) => void;
  openAssist: (field?: ActiveField) => void;
  closeAssist: () => void;
  toggleListening: () => void;
  stopListening: () => Promise<void>;
  captureImage: (source: ImageSource) => void;
  openFieldMenu: (fieldId: string) => void;
  closeFieldMenu: () => void;
  toggleFieldMenu: (fieldId: string) => void;
  startListeningForField: (field: ActiveField) => Promise<void>;
  captureImageForField: (field: ActiveField, source: ImageSource) => Promise<void>;
};

const FieldAssistContext = createContext<FieldAssistContextValue | null>(null);

function fitLength(text: string, maxLength?: number) {
  if (maxLength != null && text.length > maxLength) {
    return text.slice(0, maxLength);
  }
  return text;
}

function mergeSpeech(base: string, spoken: string, multiline: boolean) {
  const cleaned = multiline
    ? spoken.replace(/\s+$/g, '')
    : spoken.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return base;
  }
  if (!base) {
    return cleaned;
  }
  const joiner = /[\s\n]$/.test(base) ? '' : ' ';
  return `${base}${joiner}${cleaned}`;
}

export function findBestDropdownMatch(
  options: DropdownOption[],
  rawText: string,
): DropdownOption | null {
  if (!rawText || !options || options.length === 0) {
    return null;
  }

  const clean = (str: any) =>
    String(str ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const query = clean(rawText);
  if (!query) return null;

  // 1. Exact match on label or value
  for (const opt of options) {
    const lClean = clean(opt.label);
    const vClean = clean(opt.value);
    if (lClean === query || vClean === query) {
      return opt;
    }
  }

  // 2. Query contains full label or label contains full query
  for (const opt of options) {
    const lClean = clean(opt.label);
    if (lClean && (query.includes(lClean) || lClean.includes(query))) {
      return opt;
    }
  }

  // 3. Query contains value or value contains query
  for (const opt of options) {
    const vClean = clean(opt.value);
    if (vClean && (query.includes(vClean) || vClean.includes(query))) {
      return opt;
    }
  }

  // 4. Token / word similarity
  const queryTokens = query.split(' ').filter(w => w.length > 1);
  let bestScore = 0;
  let bestOpt: DropdownOption | null = null;

  for (const opt of options) {
    const lClean = clean(opt.label);
    const optTokens = lClean.split(' ').filter(w => w.length > 1);
    let score = 0;
    for (const qt of queryTokens) {
      if (optTokens.some(ot => ot === qt || ot.includes(qt) || qt.includes(ot))) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestOpt = opt;
    }
  }

  if (bestScore > 0 && bestOpt) {
    return bestOpt;
  }

  return null;
}

export function FieldAssistProvider({ children }: { children: React.ReactNode }) {
  const activeRef = useRef<ActiveField | null>(null);
  const speechBaseRef = useRef('');
  const sessionRef = useRef<SpeechSession | null>(null);
  const startingRef = useRef(false);
  const busyRef = useRef<ImageSource | null>(null);
  const successTimerRef = useRef<any>(null);

  const [activeField, setActiveField] = useState<ActiveField | null>(null);
  const [hasField, setHasField] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState<ImageSource | null>(null);
  const [hostedCount, setHostedCount] = useState(0);
  const [openMenuFieldId, setOpenMenuFieldId] = useState<string | null>(null);
  const [successFieldId, setSuccessFieldId] = useState<string | null>(null);

  const markSuccess = useCallback((fieldId: string) => {
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }
    setSuccessFieldId(fieldId);
    successTimerRef.current = setTimeout(() => {
      setSuccessFieldId(prev => (prev === fieldId ? null : prev));
    }, 1400);
  }, []);

  const openFieldMenu = useCallback((fieldId: string) => {
    setOpenMenuFieldId(fieldId);
  }, []);

  const closeFieldMenu = useCallback(() => {
    setOpenMenuFieldId(null);
  }, []);

  const toggleFieldMenu = useCallback((fieldId: string) => {
    setOpenMenuFieldId(prev => (prev === fieldId ? null : fieldId));
  }, []);

  const registerField = useCallback((field: ActiveField) => {
    activeRef.current = field;
    setActiveField(field);
    setHasField(true);
    setPreview('');
  }, []);

  const unregisterField = useCallback((id: string) => {
    if (activeRef.current?.id === id) {
      activeRef.current = null;
      setActiveField(null);
      setHasField(false);
      setPreview('');
    }
    setOpenMenuFieldId(prev => (prev === id ? null : prev));
    setSuccessFieldId(prev => (prev === id ? null : prev));
  }, []);

  const openAssist = useCallback((field?: ActiveField) => {
    if (field) {
      activeRef.current = field;
      setActiveField(field);
      setHasField(true);
    }
    setIsOpen(true);
  }, []);

  const stopListening = useCallback(async () => {
    const session = sessionRef.current;
    sessionRef.current = null;
    setListening(false);
    if (!session) {
      return;
    }
    try {
      await session.stop();
    } catch {
      // Stopping can race with the recognizer ending on its own.
    }
  }, []);

  const closeAssist = useCallback(async () => {
    if (sessionRef.current) {
      await stopListening();
    }
    setIsOpen(false);
    activeRef.current = null;
    setActiveField(null);
    setHasField(false);
    setPreview('');
    setOpenMenuFieldId(null);
  }, [stopListening]);

  const retainHost = useCallback(() => {
    setHostedCount(count => count + 1);
  }, []);

  const releaseHost = useCallback(() => {
    setHostedCount(count => Math.max(0, count - 1));
  }, []);

  const requireField = useCallback(() => {
    if (!activeRef.current) {
      Alert.alert(
        'Select a field',
        'Tap the field or dropdown you want to fill. Spoken and scanned input is applied to that field.',
      );
      return null;
    }
    return activeRef.current;
  }, []);

  const startListeningForField = useCallback(
    async (field: ActiveField) => {
      setOpenMenuFieldId(null);

      // If already listening to this field, toggle off
      if (sessionRef.current || startingRef.current) {
        const isSame = activeRef.current?.id === field.id;
        await stopListening();
        if (isSame) {
          return;
        }
      }

      activeRef.current = field;
      setActiveField(field);
      setHasField(true);
      speechBaseRef.current = field.getValue() ?? '';
      setPreview('');
      setListening(true);
      startingRef.current = true;

      try {
        const session = await startSpeechSession({
          onTranscript: spoken => {
            const current = activeRef.current;
            if (!current) {
              return;
            }

            if (current.type === 'dropdown') {
              const options = current.getOptions ? current.getOptions() : [];
              const matched = findBestDropdownMatch(options, spoken);
              if (matched) {
                if (current.onSelectOption) {
                  current.onSelectOption(matched.value, matched.label);
                } else {
                  current.setText(String(matched.value));
                }
                setPreview(`✓ Matched: ${matched.label || matched.value}`);
              } else {
                setPreview(`Listening: "${spoken}"`);
              }
            } else {
              const next = fitLength(
                mergeSpeech(speechBaseRef.current, spoken, !!current.multiline),
                current.maxLength,
              );
              current.setText(next);
              setPreview(spoken);
            }
          },
          onEnd: () => {
            sessionRef.current = null;
            startingRef.current = false;
            setListening(false);
            const current = activeRef.current;
            if (current?.id) {
              markSuccess(current.id);
            }
          },
          onError: message => {
            sessionRef.current = null;
            startingRef.current = false;
            setListening(false);
            if (message) {
              Alert.alert('Voice input', message);
            }
          },
        });
        if (!startingRef.current) {
          await session.stop();
          return;
        }
        sessionRef.current = session;
      } catch (error: any) {
        sessionRef.current = null;
        startingRef.current = false;
        setListening(false);
        Alert.alert(
          'Voice input',
          error?.message || 'Could not start speech recognition.',
        );
      }
    },
    [stopListening, markSuccess],
  );

  const toggleListening = useCallback(async () => {
    if (sessionRef.current || startingRef.current) {
      startingRef.current = false;
      await stopListening();
      return;
    }

    const field = requireField();
    if (!field || busyRef.current) {
      return;
    }
    await startListeningForField(field);
  }, [requireField, stopListening, startListeningForField]);

  const captureImageForField = useCallback(
    async (field: ActiveField, source: ImageSource) => {
      setOpenMenuFieldId(null);
      if (sessionRef.current) {
        await stopListening();
      }

      activeRef.current = field;
      setActiveField(field);
      setHasField(true);
      busyRef.current = source;
      setBusy(source);

      try {
        const uri = await pickImage(source);
        if (!uri) {
          busyRef.current = null;
          setBusy(null);
          return;
        }
        const recognized = await readTextFromImage(uri);
        if (!recognized) {
          Alert.alert(
            'No text found',
            'That image did not contain readable text.',
          );
          busyRef.current = null;
          setBusy(null);
          return;
        }

        const current = activeRef.current ?? field;
        let matchedSuccess = false;
        if (current.type === 'dropdown') {
          const options = current.getOptions ? current.getOptions() : [];
          const matched = findBestDropdownMatch(options, recognized);
          if (matched) {
            if (current.onSelectOption) {
              current.onSelectOption(matched.value, matched.label);
            } else {
              current.setText(String(matched.value));
            }
            setPreview(`✓ Matched: ${matched.label || matched.value}`);
            matchedSuccess = true;
          } else {
            setPreview(`No match: "${recognized.trim()}"`);
            Alert.alert(
              'No match found',
              `Scanned: "${recognized.trim()}". No matching dropdown option found.`,
            );
          }
        } else {
          const next = current.multiline
            ? recognized.replace(/\r/g, '').trim()
            : recognized.replace(/\s+/g, ' ').trim();
          current.setText(fitLength(next, current.maxLength));
          setPreview(next);
          matchedSuccess = true;
        }

        if (matchedSuccess) {
          markSuccess(field.id);
        }
      } catch (error: any) {
        Alert.alert(
          source === 'camera' ? 'Scan text' : 'Upload image',
          error?.message || 'Could not read text from that image.',
        );
      } finally {
        busyRef.current = null;
        setBusy(null);
      }
    },
    [stopListening, markSuccess],
  );

  const captureImage = useCallback(
    async (source: ImageSource) => {
      const field = requireField();
      if (!field || busyRef.current || sessionRef.current) {
        return;
      }
      await captureImageForField(field, source);
    },
    [requireField, captureImageForField],
  );

  const value = useMemo(
    () => ({
      activeField,
      hasField,
      isOpen,
      listening,
      preview,
      busy,
      hostedCount,
      openMenuFieldId,
      successFieldId,
      retainHost,
      releaseHost,
      registerField,
      unregisterField,
      openAssist,
      closeAssist,
      toggleListening,
      stopListening,
      captureImage,
      openFieldMenu,
      closeFieldMenu,
      toggleFieldMenu,
      startListeningForField,
      captureImageForField,
    }),
    [
      activeField,
      hasField,
      isOpen,
      listening,
      preview,
      busy,
      hostedCount,
      openMenuFieldId,
      successFieldId,
      retainHost,
      releaseHost,
      registerField,
      unregisterField,
      openAssist,
      closeAssist,
      toggleListening,
      stopListening,
      captureImage,
      openFieldMenu,
      closeFieldMenu,
      toggleFieldMenu,
      startListeningForField,
      captureImageForField,
    ],
  );

  return (
    <FieldAssistContext.Provider value={value}>{children}</FieldAssistContext.Provider>
  );
}

export function useFieldAssist() {
  const context = useContext(FieldAssistContext);
  if (!context) {
    throw new Error('useFieldAssist must be used within FieldAssistProvider');
  }
  return context;
}
