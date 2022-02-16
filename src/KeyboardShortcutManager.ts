import { KeyBindingMap } from 'tinykeys';
import { KeyboardShortcut, Scope } from './KeyboardShortcut';
import { KeyboardShortcutDialog } from './vcf-keyboard-shortcut-dialog';
import tinykeys from 'tinykeys';
import './vcf-keyboard-shortcut-dialog';

export class KeyboardShortcutManager {
  shortcuts: KeyboardShortcut[] = [];
  helpDialog?: KeyboardShortcutDialog;

  private keyBindingMaps: Map<TargetElement, KeyBindingMap> = new Map();
  private unsubcribeHanlders: (() => void)[] = [];
  private root: Document | ShadowRoot = document;

  constructor(options?: KeyboardShortcutManagerOptions) {
    if (options) {
      if (options.shortcuts) {
        this.shortcuts = options.shortcuts;
        this.createKeyBindingMaps(options.shortcuts);
      }
      if (options.root) this.root = options.root;
      if (options.helpDialog) {
        this.helpDialog = document.createElement(KeyboardShortcutDialog.is) as KeyboardShortcutDialog;
        this.helpDialog.shortcuts = this.shortcuts;
        this.root.appendChild(this.helpDialog);
      }
    }
  }

  add(shortcuts: KeyboardShortcut[]) {
    shortcuts.forEach((shortcut) => {
      const handler = this.createEventHandler(shortcut);
      shortcut.scope = this.parseScope(shortcut.scope);
      if (Array.isArray(shortcut.keyBinding)) {
        const scope = shortcut.scope;
        shortcut.keyBinding.forEach((keyBinding) => {
          if (this.keyBindingMaps.has(scope)) {
            const keyBindingMap = this.keyBindingMaps.get(scope) as KeyBindingMap;
            keyBindingMap[keyBinding] = handler;
          } else {
            this.keyBindingMaps.set(scope, { [keyBinding]: handler });
          }
        });
      } else {
        if (this.keyBindingMaps.has(shortcut.scope)) {
          const keyBindingMap = this.keyBindingMaps.get(shortcut.scope) as KeyBindingMap;
          keyBindingMap[shortcut.keyBinding] = handler;
        } else {
          this.keyBindingMaps.set(shortcut.scope, { [shortcut.keyBinding]: handler });
        }
      }
    });
    this.shortcuts = this.shortcuts.concat(shortcuts);
    if (this.helpDialog) this.helpDialog.shortcuts = this.shortcuts;
    this.createKeyBindingMaps(this.shortcuts);
  }

  subscribe() {
    const keyBindingMaps = Array.from(this.keyBindingMaps.entries());
    this.unsubcribeHanlders = keyBindingMaps.map(([scope, keyBindingMap]) => tinykeys(scope, keyBindingMap));
  }

  unsubscribe() {
    this.unsubcribeHanlders.forEach((u) => u());
  }

  toggleHelpDialog() {
    const dialog = this.helpDialog;
    if (dialog) dialog.opened = !dialog.opened;
  }

  private parseScope(scope?: Scope): TargetElement {
    let scopeElement: TargetElement | null;
    if (typeof scope === 'string') {
      scopeElement = this.root.querySelector(scope) as HTMLElement | null;
      if (!scopeElement) {
        console.warn(`Element with selector "${scope}" not found. Default window scope used.`);
        scopeElement = window;
      }
    } else {
      scopeElement = scope ?? window;
    }
    return scopeElement;
  }

  private parseKeyBinding(keyBinding: string) {
    if (keyBinding.includes(' ')) {
      console.warn(
        `"${keyBinding}" | This keybinding contains spaces which are used for keybindings with sequential button presses.
        Refer to keybinding syntax for more information: https://github.com/jamiebuilds/tinykeys#keybinding-syntax`.trim()
      );
    }
    return keyBinding;
  }

  private parseShortcuts(shortcuts: KeyboardShortcut[]) {
    return shortcuts.map((shortcut) => {
      shortcut.scope = this.parseScope(shortcut.scope);
      if (Array.isArray(shortcut.keyBinding)) {
        shortcut.keyBinding = shortcut.keyBinding.map((k) => this.parseKeyBinding(k));
      } else {
        shortcut.keyBinding = this.parseKeyBinding(shortcut.keyBinding);
      }
      return shortcut;
    });
  }

  private createKeyBindingMaps(shortcuts: KeyboardShortcut[]) {
    const parsedShortcuts = this.parseShortcuts(shortcuts);
    const scopes = new Set<TargetElement>(parsedShortcuts.map((s) => s.scope as TargetElement));
    Array.from(scopes.values()).forEach((scope) => {
      const keyBindingMap: KeyBindingMap = {};
      parsedShortcuts
        .filter((s) => s.scope === scope)
        .forEach((s) => {
          if (Array.isArray(s.keyBinding)) {
            s.keyBinding.forEach((k) => (keyBindingMap[this.parseKeyBinding(k)] = this.createEventHandler(s)));
          } else {
            keyBindingMap[this.parseKeyBinding(s.keyBinding)] = this.createEventHandler(s);
          }
        });
      this.keyBindingMaps.set(scope, keyBindingMap);
    });
  }

  private createEventHandler(shortcut: KeyboardShortcut) {
    return (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof shortcut.handler === 'function') {
        shortcut.handler(e);
      } else if (typeof shortcut.handler === 'string') {
        const scopeElement = this.parseScope(shortcut.scope);
        const eventInit: CustomEventInit = {};
        eventInit.detail = shortcut.eventDetail ?? {};
        eventInit.detail.originalEvent = e;
        scopeElement.dispatchEvent(new CustomEvent(shortcut.handler, eventInit));
      } else {
        throw new Error('Incorrect shortcut handler format. Provide either a custom event name string or an event listener function.');
      }
    };
  }
}

export type TargetElement = Window | HTMLElement;

export type KeyboardShortcutManagerOptions = {
  /**
   * Array of `KeyboardShortcut` definitions.
   */
  shortcuts?: KeyboardShortcut[];
  /**
   * Provide the root element for your view or app if child elements are nested in the Shadow DOM. This is used when parsing the `scope` property.
   */
  root?: Document | ShadowRoot;
  /**
   * Set true to add help dialog to page.
   */
  helpDialog?: Boolean;
};
