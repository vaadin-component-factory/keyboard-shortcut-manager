import tinykeys, { KeyBindingMap } from 'tinykeys';
import { KeyboardShortcut, Scope } from './KeyboardShortcut';
import { KeyboardShortcutDialog } from './vcf-keyboard-shortcut-dialog';
import { querySelectorDeep } from 'query-selector-shadow-dom';
import { render, TemplateResult } from 'lit';
import { DialogRenderer } from '@vaadin/dialog';
import { Key } from 'ts-key-enum';
import { Symbol } from './Symbol.enum';
import { KeyboardShortcutUtils } from './KeyboardShortcutUtils';
import './vcf-keyboard-shortcut-dialog';

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
        scopeElement = querySelectorDeep(scope) as HTMLElement | null;
        if (!scopeElement) {
          console.warn(`Element with selector "${scope}" not found. Default window scope used.`);
          scopeElement = window;
        }
      } else {
        scopeElement = scope;
      }
      // Make sure scope element is focusable
      if (scopeElement instanceof HTMLElement) {
        KeyboardShortcutUtils.setFocusable(scopeElement);
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

  private parseKeyBinding(keyBinding: KeyBinding | KeyBinding[]) {
    let parsedKeyBinding: string | string[] = '';
    if (Array.isArray(keyBinding)) {
      const first = keyBinding[0];
      if (Array.isArray(first)) {
        const kbs = keyBinding as KeyOrSymbol[][];
        parsedKeyBinding = kbs.map((kb) => kb.join('+'));
      } else if (this.isKey(first)) {
        const kb = keyBinding as KeyOrSymbol[];
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
    return Object.values(KeyOrSymbol).includes(key) || (key as string).length === 1;
  }

  private parsePIModifier(keyBinding: string | string[]) {
    const { LIB_MODIFIER } = KeyboardShortcutManager;
    const { MOD } = KeyOrSymbol;
    let parsedKeyBinding: string | string[];
    if (Array.isArray(keyBinding)) {
      parsedKeyBinding = keyBinding.map((binding) => binding.replace(MOD, LIB_MODIFIER));
    } else {
      parsedKeyBinding = keyBinding.replace(MOD, LIB_MODIFIER);
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
    const scopeElement = this.parseScope(shortcut.scope);
    return (e: KeyboardEvent) => {
      if (shortcut.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (typeof shortcut.handler === 'function') shortcut.handler(e);
      else if (typeof shortcut.handler === 'string') {
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

const KeyOrSymbol = {
  /**
   * Platform Independent Modifier.
   * - Mac = `Meta` (**⌘**)
   * - Windows/Linux = `Control` (**^**)
   * @see https://github.com/jamiebuilds/tinykeys#keybinding-syntax
   */
  MOD: 'MOD' as Key,
  ...Key,
  ...Symbol
};

type KeyOrSymbol = Key | Symbol;

type KeyBinding = string | KeyOrSymbol | KeyOrSymbol[];

type TargetElement = Window | HTMLElement;

type DialogContent = TemplateResult | HTMLElement | string;

type ParsedKeyboardShortcut = KeyboardShortcut & { readonly parsedKeyBinding: string | string[] };

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

export {
  KeyOrSymbol as Key,
  KeyboardShortcutManager,
  KeyboardShortcutManager as KSM,
  KeyboardShortcutManagerOptions,
  ParsedKeyboardShortcut,
  KeyBinding,
  TargetElement,
  DialogContent
};
