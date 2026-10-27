import { useState } from 'react';

export type FocusStep = {
    id: string;
    required: boolean;
    done: boolean;
};

export type SkipResult =
    | { ok: true; id: string }
    | { ok: false; reason: 'required' | 'none'; id?: string };


export function useFocusChain(
    steps: FocusStep[],
    enabled: boolean,
    busyId: string | null = null,
) {
    const [skipped, setSkipped] = useState<string[]>([]);

    const isDone = (s: FocusStep) => s.done || (!s.required && skipped.includes(s.id));

    let activeId: string | null = null;
    if (enabled) {
        if (busyId && steps.some(s => s.id === busyId)) {
            activeId = busyId;
        } else {
            activeId = steps.find(s => !isDone(s))?.id ?? null;
        }
    }

    const index = activeId ? steps.findIndex(s => s.id === activeId) : -1;

    const skip = (): SkipResult => {
        const current = steps.find(s => s.id === activeId);
        if (!current) {
            return { ok: false, reason: 'none' };
        }
        if (current.required) {
            return { ok: false, reason: 'required', id: current.id };
        }
        setSkipped(prev => (prev.includes(current.id) ? prev : [...prev, current.id]));
        return { ok: true, id: current.id };
    };

    const reset = () => setSkipped([]);

    return {
        activeId,
        index,
        total: steps.length,
        isActive: (id: string) => id === activeId,
        skip,
        reset,
    };
}