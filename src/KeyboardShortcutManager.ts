import { KeyBindingMap } from 'tinykeys';
import { KeyboardShortcut, Scope } from './KeyboardShortcut';
import { KeyboardShortcutDialog } from './vcf-keyboard-shortcut-dialog';
import { querySelectorDeep } from 'query-selector-shadow-dom';
import { render, TemplateResult } from 'lit';
import { DialogRenderer } from '@vaadin/dialog';
import { KeyboardShortcutUtils } from './KeyboardShortcutUtils';
import tinykeys from 'tinykeys';
import './vcf-keyboard-shortcut-dialog';

export class KeyboardShortcutManager {
  static TINY_KEYS_MODIFIER = '$mod';
  shortcuts: KeyboardShortcut[] = [];
  helpDialog?: KeyboardShortcutDialog;

  private keyBindingMaps: Map<TargetElement, KeyBindingMap> = new Map();
  private unsubcribeHanlders: (() => void)[] = [];

  constructor(options?: KeyboardShortcutManagerOptions) {
    if (options) {
      if (options.shortcuts) {
        this.shortcuts = options.shortcuts;
        this.createKeyBindingMaps(options.shortcuts);
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
      shortcut.keyBinding = this.parsePIModifier(shortcut.keyBinding);
      shortcut.scope = this.parseScope(shortcut.scope);
      if (Array.isArray(shortcut.keyBinding)) {
        shortcut.keyBinding = shortcut.keyBinding.map((k) => this.parseKeyBinding(k));
      } else {
        shortcut.keyBinding = this.parseKeyBinding(shortcut.keyBinding);
      }
      return shortcut;
    });
  }

  private parsePIModifier(keyBinding: string | string[]) {
    const { TINY_KEYS_MODIFIER } = KeyboardShortcutManager;
    const { PI_MOD } = KeyboardShortcutUtils;
    let parsedKeyBinding: string | string[];
    if (Array.isArray(keyBinding)) {
      parsedKeyBinding = keyBinding.map((binding) => binding.replace(PI_MOD, TINY_KEYS_MODIFIER));
    } else {
      parsedKeyBinding = keyBinding.replace(PI_MOD, TINY_KEYS_MODIFIER);
    }
    return parsedKeyBinding;
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

export type DialogContent = TemplateResult | HTMLElement | string;

export type TargetElement = Window | HTMLElement;

export type KeyboardShortcutManagerOptions = {
  /**
   * Array of `KeyboardShortcut` definitions.
   */
  shortcuts?: KeyboardShortcut[];
  /**
   * Set true to add help dialog to page.
   */
  helpDialog?: Boolean;
};
