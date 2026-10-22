// 

import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useVoiceGuide, GuidedField } from '../../context/VoiceGuideContext';

interface VoiceGuidedFieldProps {
  id: string;
  label: string;
  type: 'text' | 'dropdown' | 'button';
  isMandatory: boolean;
  order: number;
  getValue: () => string;
  onFocus?: () => void;
  screenName?: string;
  children: React.ReactNode;
}

export function VoiceGuidedField({
  id,
  label,
  type,
  isMandatory,
  order,
  getValue,
  onFocus,
  screenName,
  children,
}: VoiceGuidedFieldProps) {
  const { registerField, unregisterField, resetIdleTimer } = useVoiceGuide();

  // Keep the latest callbacks in refs so inline arrow functions passed by the
  // screen don't re-trigger registration on every render.
  const getValueRef = useRef(getValue);
  const onFocusRef = useRef(onFocus);
  getValueRef.current = getValue;
  onFocusRef.current = onFocus;

  useEffect(() => {
    const field: GuidedField = {
      id,
      label,
      type,
      isMandatory,
      order,
      getValue: () => getValueRef.current(),
      onFocus: () => onFocusRef.current?.(),
      screenName,
    };

    registerField(field);

    return () => {
      unregisterField(id);
    };
  }, [id, label, type, isMandatory, order, screenName, registerField, unregisterField]);

  // Any touch inside the field resets the idle timer. Touch events bubble up
  // from children, so no cloning of TextInput/Touchable/dropdown is needed.
  return <View onTouchStart={resetIdleTimer}>{children}</View>;
}