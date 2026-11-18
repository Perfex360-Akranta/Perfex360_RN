import React, { useEffect } from 'react';
import { useFieldAssist } from '../../context/FieldAssistContext';

/**
 * FieldAssistBar was previously a floating card at the bottom-right of the screen.
 * It has been replaced with inline WhatsApp-style '+' action controls directly
 * inside fields and dropdowns, and FormScanButton is now a standalone component
 * imported directly on the screens where it is needed.
 */
function FieldAssistBar({
  hosted,
}: {
  hosted?: boolean;
  hidden?: boolean;
} = {}) {
  const { retainHost, releaseHost } = useFieldAssist();

  useEffect(() => {
    if (!hosted) return;
    retainHost();
    return () => releaseHost();
  }, [hosted, retainHost, releaseHost]);

  return null;
}

export default FieldAssistBar;
