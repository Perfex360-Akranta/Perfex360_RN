# Voice Guidance System Documentation

## Overview

The Voice Guidance System provides automated voice callouts to guide users through form fields in your React Native application. It uses text-to-speech (TTS) to announce field instructions, mandatory field requirements, and success/failure messages.

## Features

- **Idle Detection**: Starts voice guidance after 5 seconds of inactivity
- **Sequential Field Guidance**: Guides users through fields in order
- **Mandatory Field Enforcement**: Waits for mandatory fields to be filled before proceeding
- **Automatic Field Navigation**: Automatically moves to next field for non-mandatory fields
- **Success/Failure Announcements**: Announces save results with entity names
- **Configurable Timings**: 2-second gap after mandatory fields

## Installation

The system uses `react-native-tts` which has already been installed:

```bash
npm install react-native-tts
```

### Native Setup

For iOS:
```bash
cd ios && pod install
```

For Android: No additional setup required.

## Architecture

### Components

1. **voiceGuide.ts** - TTS service wrapper
2. **VoiceGuideContext.tsx** - Context provider for voice guidance state
3. **VoiceGuidedField.tsx** - Wrapper component for form fields
4. **VoiceGuidedFormExample.tsx** - Example implementation

### Key Concepts

#### GuidedField Type

```typescript
type GuidedField = {
  id: string;              // Unique field identifier
  label: string;           // Field label for voice announcement
  type: 'text' | 'dropdown' | 'button';
  isMandatory: boolean;     // Whether field is required
  order: number;           // Display order (0, 1, 2, ...)
  getValue: () => string;  // Function to get current value
  onFocus?: () => void;    // Optional focus handler
  screenName?: string;     // Screen name for context
};
```

## Usage

### 1. Wrap Your App with VoiceGuideProvider

The provider is already added in `App.tsx`:

```tsx
import { VoiceGuideProvider } from './src/context/VoiceGuideContext';

function App() {
  return (
    <SafeAreaProvider>
      <GridProvider>
        <FieldAssistProvider>
          <VoiceGuideProvider>
            {/* Your app content */}
          </VoiceGuideProvider>
        </FieldAssistProvider>
      </GridProvider>
    </SafeAreaProvider>
  );
}
```

### 2. Start Voice Guidance on Screen Mount

```tsx
import { useVoiceGuide } from '../context/VoiceGuideContext';

function MyScreen() {
  const { startGuidance, stopGuidance } = useVoiceGuide();

  useEffect(() => {
    startGuidance('My Screen Name');

    return () => {
      stopGuidance();
    };
  }, [startGuidance, stopGuidance]);

  // ... rest of component
}
```

### 3. Wrap Form Fields with VoiceGuidedField

```tsx
import { VoiceGuidedField } from '../components/assist/VoiceGuidedField';

<VoiceGuidedField
  id="dropdownA"
  label="dropdown A"
  type="dropdown"
  isMandatory={true}
  order={1}
  getValue={() => dropdownAValue}
  screenName="My Screen"
>
  <AppDropdown
    value={dropdownAValue}
    onChange={setValue}
    data={options}
    // ... other props
  />
</VoiceGuidedField>
```

### 4. Handle Save Operations

```tsx
const handleSave = async () => {
  // Validate mandatory fields
  if (!mandatoryField) {
    await announceFailure('Please fill the required field');
    return;
  }

  try {
    await saveData();
    await announceSuccess('Entity Name'); // e.g., "Suggestion saved successfully"
  } catch (error) {
    await announceFailure('Save failed');
  }
};
```

## Behavior Flow

### Idle State
- Screen loads → 5-second timer starts
- If no user interaction → Voice guidance begins for first field

### Mandatory Field Flow
1. Voice: "Please select or enter the [field label]"
2. User fills field
3. 2-second gap
4. Voice: "Please select or enter the [next field label]"
5. Repeat until all mandatory fields filled

### Non-Mandatory Field Flow
1. Voice: "You can [field label] if you like"
2. 2-second gap (automatic, regardless of input)
3. Move to next field automatically

### Save Button
- After all fields: "Tap the save button to save your records"

### Success/Failure
- Success: "[Entity Name] saved successfully"
- Failure: "Save failed. [Error message]"

## Configuration

### Timings

You can adjust these constants in `VoiceGuideContext.tsx`:

```typescript
const IDLE_TIMEOUT = 5000; // 5 seconds idle before guidance starts
const MANDATORY_DELAY = 2000; // 2 seconds gap after mandatory field
```

### Voice Settings

In `voiceGuide.ts`, you can configure:

```typescript
await Tts.setDefaultLanguage('en-IN'); // Language
await Tts.setDefaultRate(0.5);         // Speed (0.1 to 1.0)
await Tts.setDefaultPitch(1.0);        // Pitch (0.5 to 2.0)
```

## Example Implementation

See `src/screens/example/VoiceGuidedFormExample.tsx` for a complete example with:
- Mandatory dropdown (A)
- Optional text area (B)
- Mandatory dropdown (C)
- Mandatory text area (D)
- Save button

## Integration with Existing FieldAssist

The Voice Guidance System works alongside your existing FieldAssistContext for speech-to-text. They are separate but complementary:

- **FieldAssistContext**: Handles speech-to-text (user speaks → text appears)
- **VoiceGuideContext**: Handles text-to-speech (app speaks → user hears guidance)

## API Reference

### useVoiceGuide Hook

```typescript
const {
  isActive,              // Whether guidance is active
  currentFieldIndex,      // Current field index
  fields,                 // All registered fields
  isSpeaking,             // Whether TTS is currently speaking
  startGuidance,          // (screenName: string) => void
  stopGuidance,           // () => void
  registerField,          // (field: GuidedField) => void
  unregisterField,        // (id: string) => void
  moveToNextField,        // () => void
  moveToPreviousField,    // () => void
  announceSuccess,        // (entityName: string) => Promise<void>
  announceFailure,        // (errorMessage: string) => Promise<void>
  announceSaveButton,     // () => Promise<void>
  resetIdleTimer,         // () => void
} = useVoiceGuide();
```

## Troubleshooting

### Voice Not Playing
- Ensure device has sound enabled
- Check TTS is supported on device
- Verify `react-native-tts` is properly linked

### Guidance Not Starting
- Ensure `startGuidance()` is called on screen mount
- Check that fields are wrapped with `VoiceGuidedField`
- Verify field `order` values are sequential

### Fields Not Auto-Advancing
- Check mandatory field has value before next guidance
- Verify 2-second delay has passed
- Ensure `getValue()` returns correct value

## Best Practices

1. **Always call stopGuidance() on unmount** to prevent memory leaks
2. **Use sequential order numbers** (0, 1, 2, 3...) for fields
3. **Keep labels concise** for better voice experience
4. **Test on actual devices** - TTS behavior varies by platform
5. **Handle TTS errors gracefully** - the service has built-in error handling

## Future Enhancements

Potential improvements:
- Configurable voice profiles
- Multi-language support
- Custom voice messages per field
- Voice command recognition for navigation
- Adjustable idle timeout per screen
