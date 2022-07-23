import tinykeys, { KeyBindingMap } from 'tinykeys';
import { KeyboardShortcut, Scope } from './KeyboardShortcut';
import { KeyboardShortcutDialog } from './vcf-keyboard-shortcut-dialog';
import { querySelectorDeep } from 'query-selector-shadow-dom';
import { render, TemplateResult } from 'lit';
import { DialogRenderer } from '@vaadin/dialog';
import { KeyboardShortcutUtils } from './KeyboardShortcutUtils';
import { Key as KeyEnum } from 'ts-key-enum';
import './vcf-keyboard-shortcut-dialog';

const Key = { ...KeyEnum, of: (k: string) => k as KeyEnum } as Key;

class KeyboardShortcutManager {
  static LIB_MODIFIER = '$mod';
  shortcuts: ParsedKeyboardShortcut[] = [];
  helpDialog?: KeyboardShortcutDialog;

  private keyBindingMaps: Map<TargetElement, KeyBindingMap> = new Map();
  private unsubcribeHanlders: (() => void)[] = [];

  constructor(options?: KeyboardShortcutManagerOptions) {
    if (options) {
      if (options.shortcuts) {
        this.shortcuts = this.parseShortcuts(options.shortcuts);
        this.createKeyBindingMaps(this.shortcuts);
      }
      if (options.helpDialog) {
        this.helpDialog = document.createElement(KeyboardShortcutDialog.is) as KeyboardShortcutDialog;
        this.helpDialog.shortcuts = this.shortcuts;
        document.body.appendChild(this.helpDialog);
      }
    }
  }

  get helpDialogContent() {
    return ((this.helpDialog?.overlay as any).$.content as HTMLElement | undefined) ?? null;
  }

  add(shortcuts: KeyboardShortcut[]) {
    const parsedShortcuts = this.parseShortcuts(shortcuts);
    parsedShortcuts.forEach((shortcut) => {
      const parsedKeyBinding = this.parseKeyBinding(shortcut.keyBinding);
      const handler = this.createEventHandler(shortcut);
      shortcut.scope = this.parseScope(shortcut.scope);
      if (Array.isArray(parsedKeyBinding)) {
        const scope = shortcut.scope;
        parsedKeyBinding.forEach((keyBinding) => {
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
          keyBindingMap[parsedKeyBinding] = handler;
        } else {
          this.keyBindingMaps.set(shortcut.scope, { [parsedKeyBinding]: handler });
        }
      }
    });
    this.shortcuts = this.shortcuts.concat(parsedShortcuts);
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

  setHelpDialogContent(content: DialogContent = '') {
    if (this.helpDialog) this.helpDialog.renderer = this.createDialogRenderer(content);
  }

  setHelpDialogHeader(content: DialogContent = '') {
    if (this.helpDialog) this.helpDialog.headerRenderer = this.createDialogRenderer(content);
  }

  setHelpDialogFooter(content: DialogContent = '') {
    if (this.helpDialog) this.helpDialog.footerRenderer = this.createDialogRenderer(content);
  }

  private createDialogRenderer(content: DialogContent = '') {
    return ((root: HTMLElement) => {
      root.removeAttribute('with-backdrop');
      if (typeof content === 'string') root.innerText = content;
      else render(content, root);
    }) as DialogRenderer;
  }

  private parseScope(scope?: Scope): TargetElement {
    let scopeElement: TargetElement | null = window;
    if (scope) {
      if (typeof scope === 'string') {
        scopeElement = querySelectorDeep(`#${scope}`) as HTMLElement | null;
        if (!scopeElement) {
          console.warn(`Element with selector "${scope}" not found. Default window scope used.`);
          scopeElement = window;
        }
      } else {
        scopeElement = scope;
      }
      // Make sure scope element is focusable
      if (scopeElement instanceof HTMLElement && !scopeElement.getAttribute('tabindex')) {
        scopeElement.setAttribute('tabindex', '-1');
      }
    }
    return scopeElement;
  }

  private parseShortcuts(shortcuts: KeyboardShortcut[]) {
    return shortcuts.map((shortcut) => {
      const parsedShortcut: ParsedKeyboardShortcut = {
        ...shortcut,
        scope: this.parseScope(shortcut.scope),
        parsedKeyBinding: this.parseKeyBinding(shortcut.keyBinding),
        preventDefault: shortcut.preventDefault ?? true
      };
      if (parsedShortcut.parsedKeyBinding.includes(' ')) {
        console.warn(
          `"${shortcut.keyBinding}" | This keybinding contains spaces which are used for keybindings with sequential button presses.
          Refer to keybinding syntax for more information: https://github.com/jamiebuilds/tinykeys#keybinding-syntax`.trim()
        );
      }
      return parsedShortcut;
    }) as ParsedKeyboardShortcut[];
  }

  private parseKeyBinding(keyBinding: string | string[] | Key[] | Key[][]) {
    let parsedKeyBinding: string | string[] = '';
    if (Array.isArray(keyBinding)) {
      const first = keyBinding[0];
      if (Array.isArray(first)) {
        const kbs = keyBinding as Key[][];
        parsedKeyBinding = kbs.map((kb) => kb.join('+'));
      } else if (this.isKey(first)) {
        const kb = keyBinding as Key[];
        parsedKeyBinding = kb.join('+');
      } else {
        parsedKeyBinding = keyBinding as string[];
      }
    } else {
      parsedKeyBinding = keyBinding as string;
    }
    return this.parsePIModifier(parsedKeyBinding);
  }

  private isKey(key: any) {
    return Object.values(Key).includes(key);
  }

  private parsePIModifier(keyBinding: string | string[]) {
    const { LIB_MODIFIER } = KeyboardShortcutManager;
    const { PI_MOD } = KeyboardShortcutUtils;
    let parsedKeyBinding: string | string[];
    if (Array.isArray(keyBinding)) {
      parsedKeyBinding = keyBinding.map((binding) => binding.replace(PI_MOD, LIB_MODIFIER));
    } else {
      parsedKeyBinding = keyBinding.replace(PI_MOD, LIB_MODIFIER);
    }
    return parsedKeyBinding;
  }

  private createKeyBindingMaps(shortcuts: ParsedKeyboardShortcut[]) {
    const scopes = new Set<TargetElement>(shortcuts.map((s) => s.scope as TargetElement));
    Array.from(scopes.values()).forEach((scope) => {
      const keyBindingMap: KeyBindingMap = {};
      shortcuts
        .filter((s) => s.scope === scope)
        .forEach((s) => {
          if (Array.isArray(s.parsedKeyBinding)) {
            s.parsedKeyBinding.forEach((k) => (keyBindingMap[k] = this.createEventHandler(s)));
          } else {
            keyBindingMap[s.parsedKeyBinding] = this.createEventHandler(s);
          }
        });
      this.keyBindingMaps.set(scope, keyBindingMap);
    });
  }

  private createEventHandler(shortcut: KeyboardShortcut) {
    return (e: KeyboardEvent) => {
      if (shortcut.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }
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

/**
 * An enum that includes all non-printable string values one can expect from $event.key.
 * For example, this enum includes values like "CapsLock", "Backspace", and "AudioVolumeMute",
 * but does not include values like "a", "A", "#", "é", or "¿".
 * Auto generated from MDN: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values#Speech_recognition_keys
 */
type Key = typeof KeyEnum & {
  /** Return `Key` of string `str`. */
  of: (str: string) => KeyEnum;
};

type ParsedKeyboardShortcut = KeyboardShortcut & { parsedKeyBinding: string | string[] };

type KeyboardShortcutManagerOptions = {
  /**
   * Array of `KeyboardShortcut` definitions.
   */
  shortcuts?: KeyboardShortcut[];
  /**
   * Set true to add help dialog to page.
   */
  helpDialog?: Boolean;
};

type KeyBinding = string | string[] | Key[] | Key[][];

type TargetElement = Window | HTMLElement;

type DialogContent = TemplateResult | HTMLElement | string;

export { Key, KeyboardShortcutManager, KeyboardShortcutManagerOptions, ParsedKeyboardShortcut, KeyBinding, TargetElement, DialogContent };
