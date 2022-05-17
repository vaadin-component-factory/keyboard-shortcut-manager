export interface KeyboardShortcut {
  /**
   * Target element for which this keyboard shortcut can be used when focused.
   * If a string is passed this should be the target elements id. The default scope is `Window`.
   */
  scope?: Scope;
  /**
   * Key binding code sequence.
   * - [Keys and codes](https://github.com/jamiebuilds/tinykeys#commonly-used-keys-and-codes)
   * - [Key binding syntax](https://github.com/jamiebuilds/tinykeys#keybinding-syntax)
   */
  keyBinding: string | string[];
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
}

export type Scope = Window | HTMLElement | string;
