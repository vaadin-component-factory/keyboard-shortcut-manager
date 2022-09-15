import { KeyBinding } from './KeyboardShortcutManager';

export interface KeyboardShortcut {
  /**
   * Target element for which this keyboard shortcut can be used when focused.
   * If a string is passed this should be a CSS selector targetting the desired element. The default scope is `Window`.
   */
  scope?: Scope;
  /**
   * Key binding code sequence. Can be either a string containing the whole shortcut definition
   * or an array of Keys/Symbols that represent all keys to be pressed (at the same time) for this shortcut.
   *
   * FYI: Keys in the array version are concatenated with the `+` symbol to form a string definition.
   * - [Keys and codes](https://github.com/jamiebuilds/tinykeys#commonly-used-keys-and-codes)
   * - [Key binding syntax](https://github.com/jamiebuilds/tinykeys#keybinding-syntax)
   */
  keyBinding: KeyBinding | KeyBinding[];
  /**
   * Keyboard event handler.
   *
   * - Use a **string** to fire a `CustomEvent` (from the scope target element), with the event name being the string provided.
   * The custom event approach offers more flexibility, as you can then implement separate event listeners which could even possibly trigger server-side effects for instance.
   * - Use a **function** to bind directly to the keyboard event.
   */
  handler: string | EventListener;
  /**
   * Detail object for the custom event fired by the `handler` if you provide a **string**.
   */
  eventDetail?: CustomEventInit;
  /**
   * Description of keyboard shortcut.
   */
  description?: string;
  /**
   * If `true` the handler will automatically prevent default key behavior (default is `true`).
   */
  preventDefault?: boolean;
}

export type Scope = Window | HTMLElement | string;
