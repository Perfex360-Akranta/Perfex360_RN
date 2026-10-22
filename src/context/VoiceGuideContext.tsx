// // import React, {
// //   createContext,
// //   useCallback,
// //   useContext,
// //   useEffect,
// //   useMemo,
// //   useRef,
// //   useState,
// // } from 'react';
// // import { speak, stopSpeaking } from '../services/assist/voiceGuide';

// // export type GuidedField = {
// //   id: string;
// //   label: string;
// //   type: 'text' | 'dropdown' | 'button';
// //   isMandatory: boolean;
// //   order: number;
// //   getValue: () => string;
// //   onFocus?: () => void;
// //   screenName?: string;
// // };

// // export type VoiceGuideContextValue = {
// //   isActive: boolean;
// //   currentFieldIndex: number;
// //   fields: GuidedField[];
// //   isSpeaking: boolean;
// //   startGuidance: (screenName: string) => void;
// //   stopGuidance: () => void;
// //   registerField: (field: GuidedField) => void;
// //   unregisterField: (id: string) => void;
// //   moveToNextField: () => void;
// //   moveToPreviousField: () => void;
// //   announceSuccess: (entityName: string) => void;
// //   announceFailure: (errorMessage: string) => void;
// //   announceSaveButton: () => void;
// //   resetIdleTimer: () => void;
// // };

// // const VoiceGuideContext = createContext<VoiceGuideContextValue | null>(null);

// // const IDLE_TIMEOUT = 5000; // 5 seconds
// // const MANDATORY_DELAY = 2000; // 2 seconds gap after mandatory field

// // export function VoiceGuideProvider({ children }: { children: React.ReactNode }) {
// //   const [isActive, setIsActive] = useState(false);
// //   const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
// //   const [fields, setFields] = useState<GuidedField[]>([]);
// //   const [isSpeaking, setIsSpeaking] = useState(false);
// //   const [screenName, setScreenName] = useState<string>('');

// //   const idleTimerRef = useRef<any>(null);
// //   const currentScreenRef = useRef<string>('');
// //   const guidanceActiveRef = useRef(false);

// //   // Stop speaking when component unmounts
// //   useEffect(() => {
// //     return () => {
// //       if (idleTimerRef.current) {
// //         clearTimeout(idleTimerRef.current);
// //       }
// //       stopSpeaking();
// //     };
// //   }, []);

// //   // Register a field for voice guidance
// //   const registerField = useCallback((field: GuidedField) => {
// //     setFields(prev => {
// //       const existing = prev.find(f => f.id === field.id);
// //       if (existing) {
// //         return prev.map(f => (f.id === field.id ? field : f));
// //       }
// //       return [...prev, field];
// //     });
// //   }, []);

// //   // Unregister a field
// //   const unregisterField = useCallback((id: string) => {
// //     setFields(prev => prev.filter(f => f.id !== id));
// //   }, []);

// //   // Reset idle timer
// //   const resetIdleTimer = useCallback(() => {
// //     if (idleTimerRef.current) {
// //       clearTimeout(idleTimerRef.current);
// //     }
// //     if (isActive && guidanceActiveRef.current) {
// //       idleTimerRef.current = setTimeout(() => {
// //         // Trigger guidance without calling provideGuidance to avoid circular dependency
// //         if (fields.length > 0) {
// //           const sortedFields = [...fields].sort((a, b) => a.order - b.order);
// //           const currentField = sortedFields[currentFieldIndex];
// //           if (currentField) {
// //             setIsSpeaking(true);
// //             if (currentField.type === 'button') {
// //               speak(currentField.label).then(() => setIsSpeaking(false)).catch(() => setIsSpeaking(false));
// //             } else if (currentField.isMandatory) {
// //               const message = `Please select or enter the ${currentField.label}`;
// //               speak(message).then(() => setIsSpeaking(false)).catch(() => setIsSpeaking(false));
// //             } else {
// //               const message = `You can ${currentField.label} if you like`;
// //               speak(message).then(() => setIsSpeaking(false)).catch(() => setIsSpeaking(false));
// //             }
// //           }
// //         }
// //       }, IDLE_TIMEOUT);
// //     }
// //   }, [isActive, fields, currentFieldIndex]);

// //   // Provide voice guidance for current field
// //   const provideGuidance = useCallback(async () => {
// //     if (!isActive || fields.length === 0) {
// //       return;
// //     }

// //     const sortedFields = [...fields].sort((a, b) => a.order - b.order);
// //     const currentField = sortedFields[currentFieldIndex];

// //     if (!currentField) {
// //       return;
// //     }

// //     setIsSpeaking(true);

// //     try {
// //       if (currentField.type === 'button') {
// //         await speak(currentField.label);
// //       } else if (currentField.isMandatory) {
// //         const message = `Please select or enter the ${currentField.label}`;
// //         await speak(message);
// //       } else {
// //         const message = `You can ${currentField.label} if you like`;
// //         await speak(message);
// //       }
// //     } catch (error) {
// //       console.error('Voice guidance error:', error);
// //     } finally {
// //       setIsSpeaking(false);
// //     }
// //   }, [isActive, fields, currentFieldIndex]);

// //   // Move to next field
// //   const moveToNextField = useCallback(async () => {
// //     const sortedFields = [...fields].sort((a, b) => a.order - b.order);
// //     const currentField = sortedFields[currentFieldIndex];

// //     // If current field is mandatory and not filled, don't move
// //     if (currentField?.isMandatory && !currentField.getValue()) {
// //       await speak('Please fill this field first');
// //       return;
// //     }

// //     // If current field is mandatory and filled, wait 2 seconds then move
// //     if (currentField?.isMandatory && currentField.getValue()) {
// //       await new Promise(resolve => setTimeout(resolve, MANDATORY_DELAY));
// //     }

// //     const nextIndex = currentFieldIndex + 1;
// //     if (nextIndex < sortedFields.length) {
// //       setCurrentFieldIndex(nextIndex);
// //       // Reset idle timer directly to avoid circular dependency
// //       if (idleTimerRef.current) {
// //         clearTimeout(idleTimerRef.current);
// //       }
// //       if (isActive && guidanceActiveRef.current) {
// //         idleTimerRef.current = setTimeout(() => {
// //           provideGuidance();
// //         }, IDLE_TIMEOUT);
// //       }
// //     }
// //   }, [fields, currentFieldIndex, isActive, provideGuidance]);

// //   // Move to previous field
// //   const moveToPreviousField = useCallback(() => {
// //     if (currentFieldIndex > 0) {
// //       setCurrentFieldIndex(currentFieldIndex - 1);
// //       // Reset idle timer directly to avoid circular dependency
// //       if (idleTimerRef.current) {
// //         clearTimeout(idleTimerRef.current);
// //       }
// //       if (isActive && guidanceActiveRef.current) {
// //         idleTimerRef.current = setTimeout(() => {
// //           provideGuidance();
// //         }, IDLE_TIMEOUT);
// //       }
// //     }
// //   }, [currentFieldIndex, isActive, provideGuidance]);

// //   // Start voice guidance for a screen
// //   const startGuidance = useCallback((screen: string) => {
// //     setScreenName(screen);
// //     currentScreenRef.current = screen;
// //     setIsActive(true);
// //     setCurrentFieldIndex(0);
// //     guidanceActiveRef.current = true;
// //     // Reset idle timer directly
// //     if (idleTimerRef.current) {
// //       clearTimeout(idleTimerRef.current);
// //     }
// //     idleTimerRef.current = setTimeout(() => {
// //       provideGuidance();
// //     }, IDLE_TIMEOUT);
// //   }, [provideGuidance]);

// //   // Stop voice guidance
// //   const stopGuidance = useCallback(() => {
// //     setIsActive(false);
// //     guidanceActiveRef.current = false;
// //     if (idleTimerRef.current) {
// //       clearTimeout(idleTimerRef.current);
// //     }
// //     stopSpeaking();
// //   }, []);

// //   // Announce success
// //   const announceSuccess = useCallback(async (entityName: string) => {
// //     await stopSpeaking();
// //     await speak(`${entityName} saved successfully`);
// //   }, []);

// //   // Announce failure
// //   const announceFailure = useCallback(async (errorMessage: string) => {
// //     await stopSpeaking();
// //     await speak(`Save failed. ${errorMessage}`);
// //   }, []);

// //   // Announce save button
// //   const announceSaveButton = useCallback(async () => {
// //     await stopSpeaking();
// //     await speak('Tap the save button to save your records');
// //   }, []);

// //   // Auto-move to next field for non-mandatory fields
// //   useEffect(() => {
// //     if (!isActive) return;

// //     const sortedFields = [...fields].sort((a, b) => a.order - b.order);
// //     const currentField = sortedFields[currentFieldIndex];

// //     // If current field is not mandatory, auto-move after 2 seconds
// //     if (currentField && !currentField.isMandatory) {
// //       const timer = setTimeout(() => {
// //         const nextIndex = currentFieldIndex + 1;
// //         if (nextIndex < sortedFields.length) {
// //           setCurrentFieldIndex(nextIndex);
// //           // Reset idle timer directly
// //           if (idleTimerRef.current) {
// //             clearTimeout(idleTimerRef.current);
// //           }
// //           if (isActive && guidanceActiveRef.current) {
// //             idleTimerRef.current = setTimeout(() => {
// //               provideGuidance();
// //             }, IDLE_TIMEOUT);
// //           }
// //         }
// //       }, MANDATORY_DELAY);
// //       return () => clearTimeout(timer);
// //     }
// //   }, [isActive, fields, currentFieldIndex, provideGuidance]);

// //   const value = useMemo(
// //     () => ({
// //       isActive,
// //       currentFieldIndex,
// //       fields,
// //       isSpeaking,
// //       startGuidance,
// //       stopGuidance,
// //       registerField,
// //       unregisterField,
// //       moveToNextField,
// //       moveToPreviousField,
// //       announceSuccess,
// //       announceFailure,
// //       announceSaveButton,
// //       resetIdleTimer,
// //     }),
// //     [
// //       isActive,
// //       currentFieldIndex,
// //       fields,
// //       isSpeaking,
// //       startGuidance,
// //       stopGuidance,
// //       registerField,
// //       unregisterField,
// //       moveToNextField,
// //       moveToPreviousField,
// //       announceSuccess,
// //       announceFailure,
// //       announceSaveButton,
// //       resetIdleTimer,
// //     ],
// //   );

// //   return (
// //     <VoiceGuideContext.Provider value={value}>{children}</VoiceGuideContext.Provider>
// //   );
// // }

// // export function useVoiceGuide() {
// //   const context = useContext(VoiceGuideContext);
// //   if (!context) {
// //     throw new Error('useVoiceGuide must be used within VoiceGuideProvider');
// //   }
// //   return context;
// // }


// import React, {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from 'react';
// import { speak, stopSpeaking } from '../services/assist/voiceGuide';

// export type GuidedField = {
//   id: string;
//   label: string;
//   type: 'text' | 'dropdown' | 'button';
//   isMandatory: boolean;
//   order: number;
//   getValue: () => string;
//   onFocus?: () => void;
//   screenName?: string;
// };

// export type VoiceGuideContextValue = {
//   isActive: boolean;
//   currentFieldIndex: number;
//   fields: GuidedField[];
//   isSpeaking: boolean;
//   startGuidance: (screenName: string) => void;
//   stopGuidance: () => void;
//   registerField: (field: GuidedField) => void;
//   unregisterField: (id: string) => void;
//   moveToNextField: () => void;
//   moveToPreviousField: () => void;
//   announceSuccess: (entityName: string) => void;
//   announceFailure: (errorMessage: string) => void;
//   announceSaveButton: () => void;
//   resetIdleTimer: () => void;
// };

// const VoiceGuideContext = createContext<VoiceGuideContextValue | null>(null);

// const IDLE_TIMEOUT = 5000; // 5 seconds
// const MANDATORY_DELAY = 2000; // 2 seconds gap before moving on
// const ANNOUNCE_DEBOUNCE = 300; // wait for fields to register before speaking

// const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// export function VoiceGuideProvider({ children }: { children: React.ReactNode }) {
//   const [isActive, setIsActive] = useState(false);
//   const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
//   const [fields, setFields] = useState<GuidedField[]>([]);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [, setScreenName] = useState<string>('');

//   const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const currentScreenRef = useRef<string>('');
//   const guidanceActiveRef = useRef(false);
//   const advancingRef = useRef(false);

//   // Always-current copies of state, so callbacks can stay stable
//   const fieldsRef = useRef<GuidedField[]>([]);
//   const indexRef = useRef(0);
//   fieldsRef.current = fields;
//   indexRef.current = currentFieldIndex;

//   const getSortedFields = () => [...fieldsRef.current].sort((a, b) => a.order - b.order);

//   const clearIdleTimer = () => {
//     if (idleTimerRef.current) {
//       clearTimeout(idleTimerRef.current);
//       idleTimerRef.current = null;
//     }
//   };

//   // Stop timers and speech when the provider unmounts
//   useEffect(() => {
//     return () => {
//       clearIdleTimer();
//       stopSpeaking();
//     };
//   }, []);

//   // Register a field for voice guidance
//   const registerField = useCallback((field: GuidedField) => {
//     setFields(prev => {
//       const existing = prev.find(f => f.id === field.id);
//       if (existing) {
//         return prev.map(f => (f.id === field.id ? field : f));
//       }
//       return [...prev, field];
//     });
//   }, []);

//   // Unregister a field
//   const unregisterField = useCallback((id: string) => {
//     setFields(prev => prev.filter(f => f.id !== id));
//   }, []);

//   // Speak the prompt for the current field (stable: reads refs only)
//   const provideGuidance = useCallback(async () => {
//     if (!guidanceActiveRef.current) {
//       return;
//     }

//     const currentField = getSortedFields()[indexRef.current];
//     if (!currentField) {
//       return;
//     }

//     setIsSpeaking(true);
//     try {
//       if (currentField.type === 'button') {
//         await speak(currentField.label);
//       } else if (currentField.isMandatory) {
//         await speak(`Please select or enter the ${currentField.label}`);
//       } else {
//         await speak(`You can ${currentField.label} if you like`);
//       }
//     } catch (error) {
//       console.error('Voice guidance error:', error);
//     } finally {
//       setIsSpeaking(false);
//     }
//   }, []);

//   // Restart the idle timer; when it fires, the current field is repeated
//   const resetIdleTimer = useCallback(() => {
//     clearIdleTimer();
//     if (guidanceActiveRef.current) {
//       idleTimerRef.current = setTimeout(() => {
//         provideGuidance();
//       }, IDLE_TIMEOUT);
//     }
//   }, [provideGuidance]);

//   // Move to next field
//   const moveToNextField = useCallback(async () => {
//     if (advancingRef.current) {
//       return;
//     }

//     const sortedFields = getSortedFields();
//     const startIndex = indexRef.current;
//     const currentField = sortedFields[startIndex];

//     // Mandatory and still empty: don't move
//     if (currentField?.isMandatory && !currentField.getValue()) {
//       await speak('Please fill this field first');
//       return;
//     }

//     advancingRef.current = true;
//     try {
//       // Mandatory and filled: short pause before moving on
//       if (currentField?.isMandatory) {
//         await sleep(MANDATORY_DELAY);
//       }

//       // Guidance stopped or index changed while waiting
//       if (!guidanceActiveRef.current || indexRef.current !== startIndex) {
//         return;
//       }

//       const nextIndex = startIndex + 1;
//       if (nextIndex < sortedFields.length) {
//         setCurrentFieldIndex(nextIndex);
//       }
//     } finally {
//       advancingRef.current = false;
//     }
//   }, []);

//   // Move to previous field
//   const moveToPreviousField = useCallback(() => {
//     if (indexRef.current > 0) {
//       setCurrentFieldIndex(indexRef.current - 1);
//     }
//   }, []);

//   // Start voice guidance for a screen
//   const startGuidance = useCallback((screen: string) => {
//     setScreenName(screen);
//     currentScreenRef.current = screen;
//     guidanceActiveRef.current = true;
//     indexRef.current = 0;
//     setCurrentFieldIndex(0);
//     setIsActive(true);
//   }, []);

//   // Stop voice guidance
//   const stopGuidance = useCallback(() => {
//     guidanceActiveRef.current = false;
//     advancingRef.current = false;
//     setIsActive(false);
//     setCurrentFieldIndex(0);
//     clearIdleTimer();
//     stopSpeaking();
//   }, []);

//   // Announce success
//   const announceSuccess = useCallback(async (entityName: string) => {
//     await stopSpeaking();
//     await speak(`${entityName} saved successfully`);
//   }, []);

//   // Announce failure
//   const announceFailure = useCallback(async (errorMessage: string) => {
//     await stopSpeaking();
//     await speak(`Save failed. ${errorMessage}`);
//   }, []);

//   // Announce save button
//   const announceSaveButton = useCallback(async () => {
//     await stopSpeaking();
//     await speak('Tap the save button to save your records');
//   }, []);

//   // Speak the current field whenever it changes. Non-mandatory fields
//   // advance automatically after the speech ends plus a short delay.
//   useEffect(() => {
//     if (!isActive) {
//       return;
//     }

//     let cancelled = false;

//     const timer = setTimeout(async () => {
//       const currentField = getSortedFields()[indexRef.current];
//       if (!currentField) {
//         return;
//       }

//       await provideGuidance();
//       if (cancelled) {
//         return;
//       }

//       if (currentField.isMandatory) {
//         // Repeat the prompt once if the user stays idle
//         resetIdleTimer();
//         return;
//       }

//       await sleep(MANDATORY_DELAY);
//       if (cancelled) {
//         return;
//       }
//       moveToNextField();
//     }, ANNOUNCE_DEBOUNCE);

//     return () => {
//       cancelled = true;
//       clearTimeout(timer);
//     };
//   }, [isActive, currentFieldIndex, fields.length, provideGuidance, resetIdleTimer, moveToNextField]);

//   // Mandatory field: getValue() isn't reactive, so poll until it is filled
//   useEffect(() => {
//     if (!isActive) {
//       return;
//     }

//     const currentField = [...fields].sort((a, b) => a.order - b.order)[currentFieldIndex];
//     if (!currentField || !currentField.isMandatory) {
//       return;
//     }

//     const poll = setInterval(() => {
//       if (currentField.getValue()) {
//         clearInterval(poll);
//         moveToNextField();
//       }
//     }, 500);

//     return () => clearInterval(poll);
//   }, [isActive, fields, currentFieldIndex, moveToNextField]);

//   const value = useMemo(
//     () => ({
//       isActive,
//       currentFieldIndex,
//       fields,
//       isSpeaking,
//       startGuidance,
//       stopGuidance,
//       registerField,
//       unregisterField,
//       moveToNextField,
//       moveToPreviousField,
//       announceSuccess,
//       announceFailure,
//       announceSaveButton,
//       resetIdleTimer,
//     }),
//     [
//       isActive,
//       currentFieldIndex,
//       fields,
//       isSpeaking,
//       startGuidance,
//       stopGuidance,
//       registerField,
//       unregisterField,
//       moveToNextField,
//       moveToPreviousField,
//       announceSuccess,
//       announceFailure,
//       announceSaveButton,
//       resetIdleTimer,
//     ],
//   );

//   return (
//     <VoiceGuideContext.Provider value={value}>{children}</VoiceGuideContext.Provider>
//   );
// }

// export function useVoiceGuide() {
//   const context = useContext(VoiceGuideContext);
//   if (!context) {
//     throw new Error('useVoiceGuide must be used within VoiceGuideProvider');
//   }
//   return context;
// }



import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { speak, stopSpeaking } from '../services/assist/voiceGuide';

export type GuidedField = {
  id: string;
  label: string;
  type: 'text' | 'dropdown' | 'button';
  isMandatory: boolean;
  order: number;
  getValue: () => string;
  onFocus?: () => void;
  screenName?: string;
};

export type VoiceGuideContextValue = {
  isActive: boolean;
  currentFieldIndex: number;
  fields: GuidedField[];
  isSpeaking: boolean;
  startGuidance: (screenName: string) => void;
  stopGuidance: () => void;
  registerField: (field: GuidedField) => void;
  unregisterField: (id: string) => void;
  moveToNextField: () => void;
  moveToPreviousField: () => void;
  announceSuccess: (entityName: string) => void;
  announceFailure: (errorMessage: string) => void;
  announceSaveButton: () => void;
  resetIdleTimer: () => void;
};

const VoiceGuideContext = createContext<VoiceGuideContextValue | null>(null);

const MANDATORY_DELAY = 2000; // 2 seconds gap before moving on
const ANNOUNCE_DEBOUNCE = 300; // wait for fields to register before speaking

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function VoiceGuideProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [fields, setFields] = useState<GuidedField[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [, setScreenName] = useState<string>('');

  const currentScreenRef = useRef<string>('');
  const guidanceActiveRef = useRef(false);
  const advancingRef = useRef(false);

  // Always-current copies of state, so callbacks can stay stable
  const fieldsRef = useRef<GuidedField[]>([]);
  const indexRef = useRef(0);
  fieldsRef.current = fields;
  indexRef.current = currentFieldIndex;

  const getSortedFields = () => [...fieldsRef.current].sort((a, b) => a.order - b.order);

  // Stop speech when the provider unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Register a field for voice guidance
  const registerField = useCallback((field: GuidedField) => {
    setFields(prev => {
      const existing = prev.find(f => f.id === field.id);
      if (existing) {
        return prev.map(f => (f.id === field.id ? field : f));
      }
      return [...prev, field];
    });
  }, []);

  // Unregister a field
  const unregisterField = useCallback((id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  }, []);

  // Speak the prompt for the current field (stable: reads refs only)
  const provideGuidance = useCallback(async () => {
    if (!guidanceActiveRef.current) {
      return;
    }

    const currentField = getSortedFields()[indexRef.current];
    if (!currentField) {
      return;
    }

    setIsSpeaking(true);
    try {
      if (currentField.type === 'button') {
        await speak(currentField.label);
      } else if (currentField.isMandatory) {
        await speak(`Please select or enter the ${currentField.label}`);
      } else {
        await speak(`You can ${currentField.label} if you like`);
      }
    } catch (error) {
      console.error('Voice guidance error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  // Kept for API compatibility with VoiceGuidedField (called on touch).
  // The idle reminder was removed, so there is nothing to reset.
  const resetIdleTimer = useCallback(() => { }, []);

  // Move to next field
  const moveToNextField = useCallback(async () => {
    if (advancingRef.current) {
      return;
    }

    const sortedFields = getSortedFields();
    const startIndex = indexRef.current;
    const currentField = sortedFields[startIndex];

    // Mandatory and still empty: don't move
    if (currentField?.isMandatory && !currentField.getValue()) {
      await speak('Please fill this field first');
      return;
    }

    advancingRef.current = true;
    try {
      // Mandatory and filled: short pause before moving on
      if (currentField?.isMandatory) {
        await sleep(MANDATORY_DELAY);
      }

      // Guidance stopped or index changed while waiting
      if (!guidanceActiveRef.current || indexRef.current !== startIndex) {
        return;
      }

      const nextIndex = startIndex + 1;
      if (nextIndex < sortedFields.length) {
        setCurrentFieldIndex(nextIndex);
      }
    } finally {
      advancingRef.current = false;
    }
  }, []);

  // Move to previous field
  const moveToPreviousField = useCallback(() => {
    if (indexRef.current > 0) {
      setCurrentFieldIndex(indexRef.current - 1);
    }
  }, []);

  // Start voice guidance for a screen
  const startGuidance = useCallback((screen: string) => {
    setScreenName(screen);
    currentScreenRef.current = screen;
    guidanceActiveRef.current = true;
    indexRef.current = 0;
    setCurrentFieldIndex(0);
    setIsActive(true);
  }, []);

  // Stop voice guidance
  const stopGuidance = useCallback(() => {
    guidanceActiveRef.current = false;
    advancingRef.current = false;
    setIsActive(false);
    setCurrentFieldIndex(0);
    stopSpeaking();
  }, []);

  // Announce success
  const announceSuccess = useCallback(async (entityName: string) => {
    await stopSpeaking();
    await speak(`${entityName} completed successfully`);
  }, []);

  // Announce failure
  const announceFailure = useCallback(async (errorMessage: string) => {
    await stopSpeaking();
    await speak(`Save failed. ${errorMessage}`);
  }, []);

  // Announce save button
  const announceSaveButton = useCallback(async () => {
    await stopSpeaking();
    await speak('Tap the save button to save your records');
  }, []);

  // Speak the current field whenever it changes. Each field is announced once.
  // Non-mandatory fields advance automatically after the speech ends plus a
  // short delay; mandatory fields advance when filled (see polling effect).
  useEffect(() => {
    if (!isActive) {
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      const currentField = getSortedFields()[indexRef.current];
      if (!currentField) {
        return;
      }

      await provideGuidance();
      if (cancelled) {
        return;
      }

      if (currentField.isMandatory) {
        return;
      }

      await sleep(MANDATORY_DELAY);
      if (cancelled) {
        return;
      }
      moveToNextField();
    }, ANNOUNCE_DEBOUNCE);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isActive, currentFieldIndex, fields.length, provideGuidance, moveToNextField]);

  // Mandatory field: getValue() isn't reactive, so poll until it is filled
  useEffect(() => {
    if (!isActive) {
      return;
    }

    const currentField = [...fields].sort((a, b) => a.order - b.order)[currentFieldIndex];
    if (!currentField || !currentField.isMandatory) {
      return;
    }

    const poll = setInterval(() => {
      if (currentField.getValue()) {
        clearInterval(poll);
        moveToNextField();
      }
    }, 500);

    return () => clearInterval(poll);
  }, [isActive, fields, currentFieldIndex, moveToNextField]);

  const value = useMemo(
    () => ({
      isActive,
      currentFieldIndex,
      fields,
      isSpeaking,
      startGuidance,
      stopGuidance,
      registerField,
      unregisterField,
      moveToNextField,
      moveToPreviousField,
      announceSuccess,
      announceFailure,
      announceSaveButton,
      resetIdleTimer,
    }),
    [
      isActive,
      currentFieldIndex,
      fields,
      isSpeaking,
      startGuidance,
      stopGuidance,
      registerField,
      unregisterField,
      moveToNextField,
      moveToPreviousField,
      announceSuccess,
      announceFailure,
      announceSaveButton,
      resetIdleTimer,
    ],
  );

  return (
    <VoiceGuideContext.Provider value={value}>{children}</VoiceGuideContext.Provider>
  );
}

export function useVoiceGuide() {
  const context = useContext(VoiceGuideContext);
  if (!context) {
    throw new Error('useVoiceGuide must be used within VoiceGuideProvider');
  }
  return context;
}