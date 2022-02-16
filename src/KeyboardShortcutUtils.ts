/**
 * Predefined shortcuts and utilities.
 */
export class KeyboardShortcutUtils {
  /**
   * Return whether the provided element is focusable.
   */
  static isFocusable(element: HTMLElement) {
    const current = KeyboardShortcutUtils.getActiveElement() as HTMLElement | null;
    const protectEvent = (e: Event) => e.stopImmediatePropagation();
    element.addEventListener('focus', protectEvent, true);
    element.addEventListener('blur', protectEvent, true);
    element.focus({ preventScroll: true });
    const result = KeyboardShortcutUtils.getActiveElement() === element;
    element.blur();
    if (current) {
      current.focus({ preventScroll: true });
    }
    element.removeEventListener('focus', protectEvent, true);
    element.removeEventListener('blur', protectEvent, true);
    return result;
  }

  /**
   * Selector that returns all focusable html elements and vaadin field components.
   */
  static InputFields = `
    a,
    button,
    input,
    select,
    textarea,
    vaadin-checkbox
    vaadin-combo-box,
    vaadin-date-picker,
    vaadin-date-time-picker,
    vaadin-email-field,
    vaadin-number-field,
    vaadin-password-field,
    vaadin-radio-button,
    vaadin-select,
    vaadin-text-area,
    vaadin-text-field,
    vaadin-time-picker
  `
    .trim()
    .replace(/\s+/, '');

  private static validateField(field: any): boolean {
    return field.getAttribute('invalid') !== null;
  }

  static getActiveElement(root: Document | ShadowRoot = document): Element | null {
    const activeEl = root.activeElement;
    if (!activeEl) {
      return null;
    }
    if (activeEl.shadowRoot) {
      return KeyboardShortcutUtils.getActiveElement(activeEl.shadowRoot);
    } else {
      return activeEl;
    }
  }

  static focusNextInvalidField(root: Document | ShadowRoot = document, reverse = false) {
    const activeElement = KeyboardShortcutUtils.getActiveElement(root);
    let focusField: HTMLElement | null = null;
    let elements = Array.from(root.querySelectorAll('*').values()) as HTMLElement[];

    elements = elements.filter((el: any) => el.checkValidity && !el.inputElement && KeyboardShortcutUtils.validateField(el));

    if (elements.length) {
      if (reverse) {
        elements = elements.reverse();
      }

      const currentIndex = elements.findIndex((el) => el === activeElement);
      const nextIndex = currentIndex > -1 ? currentIndex + 1 : 0;
      focusField = nextIndex < elements.length ? elements[nextIndex] : elements[0];
      focusField?.focus();
    }
  }

  static focusPreviousInvalidField(root: Document | ShadowRoot = document) {
    KeyboardShortcutUtils.focusNextInvalidField(root, true);
  }
}
