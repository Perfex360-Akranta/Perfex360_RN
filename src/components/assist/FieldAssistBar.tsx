import React from 'react';

/**
 * FieldAssistBar was previously a floating card at the bottom-right of the screen.
 * It has now been replaced with inline WhatsApp-style '+' action controls directly
 * inside fields and dropdowns for a seamless, non-intrusive UI/UX.
 *
 * This component returns null to preserve backwards compatibility with screens
 * that include `<FieldAssistBar />` or `<FieldAssistBar hosted />`.
 */
function FieldAssistBar(_props?: { hosted?: boolean }) {
  return null;
}

export default FieldAssistBar;
