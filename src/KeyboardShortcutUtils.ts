import { querySelectorAllDeep, querySelectorDeep } from 'query-selector-shadow-dom';

/**
 * Predefined shortcuts and utilities.
 */
export class KeyboardShortcutUtils {
  /**
   * Finds first matching elements on the page that may be in a shadow root.
   */
  static querySelectorDeep = querySelectorDeep;

  /**
   * Finds first matching elements on the page that may be in a shadow root.
   */
  static querySelectorAllDeep = querySelectorAllDeep;

  /**
   * Selector that returns input field elements.
   */
  static InputFields = 'input,select,textarea';

  /**
   * Selector that returns focusable elements.
   */
  static FocusableElements = `${KeyboardShortcutUtils.InputFields},a,button,area`;

  /**
   * Selector that returns vaadin input elements.
   */
  static VaadinInputFields = `
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
   * Returns all input fields on the page or within the `scope` element (even if nested in shadow dom).
   * @param scope The root element in which we do the search.
   */
  static getInputFields(scope: Document | HTMLElement = document) {
    return querySelectorAllDeep(KeyboardShortcutUtils.InputFields, scope);
  }

  /**
   * Returns all focusable elements on the page or within the `scope` element (even if nested in shadow dom).
   * @param scope The root element in which we do the search.
   */
  static getFocusableElements(scope: Document | HTMLElement = document) {
    return querySelectorAllDeep(KeyboardShortcutUtils.FocusableElements, scope);
  }

  /**
   * Returns all Vaadin input fields on the page or within the `scope` element (even if nested in shadow dom).
   * @param scope The root element in which we do the search.
   */
  static getVaadinInputFields(scope: Document | HTMLElement = document) {
    return querySelectorAllDeep(KeyboardShortcutUtils.VaadinInputFields, scope);
  }

  /**
   * Get active element on the page or within the `scope` element (even if nested in shadow dom).
   * @param scope The root element in which we do the search.
   */
  static getActiveElement(): Element | null {
    return KeyboardShortcutUtils.getActiveElementDeep();
  }

  /**
   * Focus next invalid field on the page or within the `scope` element (even if nested in shadow dom).
   * @param scope The root element in which we do the search.
   */
  static focusNextInvalidField(scope: Document | HTMLElement = document) {
    KeyboardShortcutUtils.focusInvalidField(scope);
  }

  /**
   * Focus previous invalid field on the page or within the `scope` element (even if nested in shadow dom).
   * @param scope The root element in which we do the search.
   */
  static focusPreviousInvalidField(scope: Document | HTMLElement = document) {
    KeyboardShortcutUtils.focusInvalidField(scope, true);
  }

  /***********
   * HELPERS *
   ***********/

  private static validateField(field: HTMLElement): boolean {
    return field.getAttribute('invalid') !== null;
  }

  private static getActiveElementDeep(root: Document | ShadowRoot = document): Element | null {
    const activeEl = root.activeElement;
    if (!activeEl) {
      return null;
    }
    if (activeEl.shadowRoot) {
      return KeyboardShortcutUtils.getActiveElementDeep(activeEl.shadowRoot);
    } else {
      return activeEl;
    }
  }

  private static focusInvalidField(scope: Document | HTMLElement = document, reverse = false) {
    const activeElement = KeyboardShortcutUtils.getActiveElement();
    let focusField: HTMLElement | null = null;
    let elements = KeyboardShortcutUtils.getInputFields(scope);
    elements = elements.filter((el: any) => el.checkValidity && KeyboardShortcutUtils.validateField(el));

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
}
