import React, {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
} from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { ActiveField, useFieldAssist } from '../../context/FieldAssistContext';
import FieldAssistAction from '../assist/FieldAssistAction';

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
  const { registerField, unregisterField } = useFieldAssist();
  const id = useId();
  const valueRef = useRef(props.value);
  const onChangeRef = useRef(props.onChangeText);

  valueRef.current = props.value;
  onChangeRef.current = props.onChangeText;

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
    }),
    [id, props.placeholder, props.multiline, props.maxLength],
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
        style={[
          inputStyle,
          styles.inputBase,
          isMultiline ? styles.multilinePadding : styles.singlelinePadding,
        ]}
      />
      <View
        style={[
          styles.actionSlot,
          isMultiline ? styles.actionSlotMultiline : styles.actionSlotSingle,
        ]}>
        <FieldAssistAction field={field} />
      </View>
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
  },
  singlelinePadding: {
    paddingRight: 36,
  },
  multilinePadding: {
    paddingRight: 36,
  },
  actionSlot: {
    position: 'absolute',
    right: 6,
    zIndex: 10,
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
