// import Tts from 'react-native-tts';

// let initialized = false;

// export async function initVoiceGuide() {
//   if (initialized) {
//     return;
//   }

//   try {
//     // Set default language
//     await Tts.setDefaultLanguage('en-IN');
//     // Set default rate (speed)
//     await Tts.setDefaultRate(0.5);
//     // Set default pitch
//     await Tts.setDefaultPitch(1.0);
//     initialized = true;
//   } catch (error) {
//     console.error('Failed to initialize TTS:', error);
//   }
// }

// export async function speak(text: string): Promise<void> {
//   try {
//     await initVoiceGuide();
//     await Tts.speak(text);
//   } catch (error) {
//     console.error('Failed to speak:', error);
//   }
// }

// export async function stopSpeaking(): Promise<void> {
//   try {
//     await Tts.stop();
//   } catch (error) {
//     console.error('Failed to stop speaking:', error);
//   }
// }

// export async function setSpeakingRate(rate: number): Promise<void> {
//   try {
//     await Tts.setDefaultRate(rate);
//   } catch (error) {
//     console.error('Failed to set speaking rate:', error);
//   }
// }

// export async function setLanguage(language: string): Promise<void> {
//   try {
//     await Tts.setDefaultLanguage(language);
//   } catch (error) {
//     console.error('Failed to set language:', error);
//   }
// }

// export function destroyVoiceGuide() {
//   try {
//     Tts.stop();
//     initialized = false;
//   } catch (error) {
//     console.error('Failed to destroy voice guide:', error);
//   }
// }


import Tts from 'react-native-tts';

let initialized = false;


type Lifecycle = { start?: () => void; end?: () => void };
const lifecycleListeners = new Set<Lifecycle>();
let activeSpeaks = 0;

export function onSpeechLifecycle(handlers: Lifecycle): () => void {
  lifecycleListeners.add(handlers);
  return () => {
    lifecycleListeners.delete(handlers);
  };
}

const notify = (which: 'start' | 'end') => lifecycleListeners.forEach(l => l[which]?.());

// Safety net: if no finish/cancel event ever arrives, don't hang forever
const SPEAK_TIMEOUT = 20000;

export async function initVoiceGuide() {
  if (initialized) {
    return;
  }

  try {
    await Tts.setDefaultLanguage('en-IN');
    await Tts.setDefaultRate(0.5);
    await Tts.setDefaultPitch(1.0);
    initialized = true;
  } catch (error) {
    console.error('Failed to initialize TTS:', error);
  }
}

/**
 * Speaks the text and resolves only when the speech has finished
 * (or been cancelled by stopSpeaking / a newer speak call).
 */
export async function speak(text: string): Promise<void> {
  await initVoiceGuide();

   if (activeSpeaks === 0) {
    notify('start');
  }
  activeSpeaks++;

  return new Promise<void>(resolve => {
    let finished = false;
    let idKnown = false;
    let utteranceId: any;
    let timer: any;
    const pending: any[] = [];
    const handlers: Array<[string, (e: any) => void]> = [];
    const subs: any[] = [];

    const done = () => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timer);
       activeSpeaks = Math.max(0, activeSpeaks - 1);
      if (activeSpeaks === 0) {
        notify('end');
      }
      handlers.forEach(([evt, handler], i) => {
        const sub = subs[i];
        if (sub && typeof sub.remove === 'function') {
          sub.remove(); // react-native-tts >= 4.1
        } else {
          Tts.removeEventListener(evt as any, handler as any); // older versions
        }
      });
      resolve();
    };

    // Ignore events that belong to a different (older) utterance
    const matches = (e: any) =>
      utteranceId == null || e?.utteranceId == null || e.utteranceId === utteranceId;

    const onEvent = (e: any) => {
      if (!idKnown) {
        pending.push(e); // event arrived before Tts.speak returned its id
        return;
      }
      if (matches(e)) {
        done();
      }
    };

    ['tts-finish', 'tts-cancel'].forEach(evt => {
      handlers.push([evt, onEvent]);
      subs.push(Tts.addEventListener(evt as any, onEvent));
    });

    timer = setTimeout(done, SPEAK_TIMEOUT);

    Promise.resolve()
      .then(() => Tts.speak(text))
      .then((id: any) => {
        utteranceId = id;
        idKnown = true;
        if (pending.some(matches)) {
          done();
        }
      })
      .catch(error => {
        console.error('Failed to speak:', error);
        done();
      });
  });
}

export async function stopSpeaking(): Promise<void> {
  try {
    await Tts.stop();
  } catch (error) {
    console.error('Failed to stop speaking:', error);
  }
}

export async function setSpeakingRate(rate: number): Promise<void> {
  try {
    await Tts.setDefaultRate(rate);
  } catch (error) {
    console.error('Failed to set speaking rate:', error);
  }
}

export async function setLanguage(language: string): Promise<void> {
  try {
    await Tts.setDefaultLanguage(language);
  } catch (error) {
    console.error('Failed to set language:', error);
  }
}

export function destroyVoiceGuide() {
  try {
    Tts.stop();
    initialized = false;
  } catch (error) {
    console.error('Failed to destroy voice guide:', error);
  }
}