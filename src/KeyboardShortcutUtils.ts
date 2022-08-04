import { querySelectorAllDeep, querySelectorDeep } from 'query-selector-shadow-dom';
import { Key } from 'ts-key-enum';

/**
 * Predefined shortcuts and utilities.
 */
export class KeyboardShortcutUtils {
  /**
   * Platform Independent Modifier.
   * - Mac = `Meta` (⌘)
   * - Windows/Linux = `Control`
   * @see https://github.com/jamiebuilds/tinykeys#keybinding-syntax
   */
  static PI_MOD = 'MOD';

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

enum SymbolKey {
  Zero = '0',
  ClosedParen = Zero,
  One = '1',
  ExclamationMark = One,
  Two = '2',
  AtSign = Two,
  Three = '3',
  PoundSign = Three,
  Hash = PoundSign,
  Four = '4',
  DollarSign = Four,
  Five = '5',
  PercentSign = Five,
  Six = '6',
  Caret = Six,
  Hat = Caret,
  Seven = '7',
  Ampersand = Seven,
  Eight = '8',
  Star = Eight,
  Asterik = Star,
  Nine = '9',
  OpenParen = Nine,
  A = 'a',
  B = 'b',
  C = 'c',
  D = 'd',
  E = 'e',
  F = 'f',
  G = 'g',
  H = 'h',
  I = 'i',
  J = 'j',
  K = 'k',
  L = 'l',
  M = 'm',
  N = 'n',
  O = 'o',
  P = 'p',
  Q = 'q',
  R = 'r',
  S = 's',
  T = 't',
  U = 'u',
  V = 'v',
  W = 'w',
  X = 'x',
  Y = 'y',
  Z = 'z',
  Numpad0 = 'Numpad0',
  Numpad1 = 'Numpad1',
  Numpad2 = 'Numpad2',
  Numpad3 = 'Numpad3',
  Numpad4 = 'Numpad4',
  Numpad5 = 'Numpad5',
  Numpad6 = 'Numpad6',
  Numpad7 = 'Numpad7',
  Numpad8 = 'Numpad8',
  Numpad9 = 'Numpad9',
  Multiply = 'NumpadMultiply',
  Add = 'NumpadAdd',
  Subtract = 'NumpadSubtract',
  DecimalPoint = 'NumpadDecimal',
  Divide = 'NumpadDivide',
  SemiColon = ';',
  Equals = '=',
  Comma = ',',
  Dash = '-',
  Period = '.',
  UnderScore = Dash,
  PlusSign = Equals,
  ForwardSlash = '/',
  QuestionMark = ForwardSlash,
  GraveAccent = '`',
  Tilde = GraveAccent,
  OpenBracket = '[',
  ClosedBracket = ']',
  Quote = "'"
}
