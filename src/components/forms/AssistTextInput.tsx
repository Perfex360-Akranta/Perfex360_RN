import React, {
  forwardRef,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { ActiveField, useFieldAssist } from '../../context/FieldAssistContext';
import FieldAssistAction from '../assist/FieldAssistAction';
import { NavigationContext } from '@react-navigation/native';
import { useAppTheme } from '../../theme/ThemeContext';
import { useFeatureToggles } from '../../context/FeatureToggleContext';

const LAYOUT_KEYS = [
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginVertical',
  'marginHorizontal',
  'width',
  'minWidth',
  'maxWidth',
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'alignSelf',
];

function splitStyles(style: any) {
  const flat = StyleSheet.flatten(style) || {};
  const wrapperStyle: any = {};
  const inputStyle: any = { ...flat };

  LAYOUT_KEYS.forEach(key => {
    if (flat[key] !== undefined) {
      wrapperStyle[key] = flat[key];
      delete inputStyle[key];
    }
  });

  return { wrapperStyle, inputStyle };
}

const AssistTextInput = forwardRef<TextInput, TextInputProps>((props, ref) => {

  const { colors } = useAppTheme();
  const { isFeatureEnabled } = useFeatureToggles();

  const [isFocused, setIsFocused] = useState(false);
  const [showAssistActions, setShowAssistActions] = useState(false);
  const [isPressingAssistAction, setIsPressingAssistAction] =useState(false);
  const { registerField, unregisterField, activeField, busy, successFieldId } =
    useFieldAssist();
  const id = useId();
  // Keep the action visible (as spinner / green tick) while this field is
  // processing a scan, even though the camera blurred the input.
  const isProcessing = activeField?.id === id && busy !== null;
  const isDone = successFieldId === id;
  const showStatus = isProcessing || isDone;
  const valueRef = useRef(props.value);
  const onChangeRef = useRef(props.onChangeText);

  valueRef.current = props.value;
  onChangeRef.current = props.onChangeText;
  // Full-form scan: only include fields on the currently focused screen.
  const navigation = useContext(NavigationContext);
  const navRef = useRef(navigation);
  navRef.current = navigation;
  const isSecure = !!props.secureTextEntry;

  const canAssist =
    props.editable !== false &&
    props.readOnly !== true &&
    typeof props.onChangeText === 'function';

  const field: ActiveField = useMemo(
    () => ({
      id,
      label: props.placeholder || (props as any)['aria-label'] || 'Text Field',
      getValue: () => (valueRef.current == null ? '' : String(valueRef.current)),
      setText: text => onChangeRef.current?.(text),
      multiline: !!props.multiline,
      maxLength: props.maxLength,
      type: 'text',
      isInScope: () => navRef.current?.isFocused?.() ?? true,
      excludeFromFormScan: isSecure,
    }),
    [id, props.placeholder, props.multiline, props.maxLength, isSecure],
  );

  useEffect(() => {
    if (canAssist) {
      registerField(field);
    }
    return () => unregisterField(id);
  }, [canAssist, field, id, registerField, unregisterField]);

  if (!canAssist) {
    return <TextInput {...props} ref={ref} />;
  }

  const { wrapperStyle, inputStyle } = splitStyles(props.style);
  const isMultiline = !!props.multiline;

  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      <TextInput
        {...props}
        ref={ref}
         onFocus={event => {
          setIsFocused(true);
          setShowAssistActions(true);
          props.onFocus?.(event);
         }}
         onBlur={event => {
         requestAnimationFrame(() => {
    if (!isPressingAssistAction) {
      setIsFocused(false);
      setShowAssistActions(false);
    }
  });
          props.onBlur?.(event);
         }}
        style={[
          inputStyle,
          styles.inputBase,
          {color:colors.text,borderColor:colors.border,backgroundColor:colors.surface},
          isMultiline ? styles.multilinePadding : styles.singlelinePadding,
        ]}
      />
      {isFeatureEnabled('fieldAssist') && ((showAssistActions && isFocused) || showStatus) && (
      <Pressable
    style={styles.actionSlot}
    onPressIn={() => setIsPressingAssistAction(true)}
    onPressOut={() => {
      // Allow the icon's onPress handler to execute first.
      requestAnimationFrame(() => {
        setIsPressingAssistAction(false);
      });
    }}
  > 
        <FieldAssistAction field={field}
      visible={!showStatus}
      onDismiss={() => {
      setShowAssistActions(false);
      setIsPressingAssistAction(false);
    }} />
       </Pressable>
      )}
    </View>
   
  );
});

AssistTextInput.displayName = 'AssistTextInput';

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputBase: {
    width: '100%',
    // backgroundColor:'#fff',
  },
  singlelinePadding: {
    paddingRight: 36,
  },
  multilinePadding: {
    paddingRight: 36,
  },
  // actionSlot: {
  //   position: 'absolute',
  //   right: 6,
  //   zIndex: 10,
  // },
  actionSlot: {
  position: 'absolute',
  right: 6,
  top: -16,
  zIndex: 20,
  elevation: 10,
},
  actionSlotSingle: {
    top: '50%',
    transform: [{ translateY: -13 }],
  },
  actionSlotMultiline: {
    top: 8,
  },
});

export default AssistTextInput;
