import { html, css, render } from 'lit';
import { EnhancedDialog, EnhancedDialogOverlay } from '@vaadin-component-factory/vcf-enhanced-dialog';
import { registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles';
import { KeyboardShortcut, Scope } from './KeyboardShortcut';
import '@vaadin/grid';

export class KeyboardShortcutDialog extends EnhancedDialog {
  shortcuts: KeyboardShortcut[] = [];

  constructor() {
    super();
    this.draggable = true;
    this.renderer = this.dialogRenderer;
  }

  static get is() {
    return 'vcf-keyboard-shortcut-dialog';
  }

  private dialogRenderer = (root: any) => {
    root.removeAttribute('with-backdrop');
    root.$.overlay.style.width = '500px';
    render(
      html`
        <h3 slot="header" style="margin:0;">Keyboard Shortcuts</h3>
        <vaadin-grid id="shortcuts" .items="${this.items}" all-rows-visible>
          <vaadin-grid-column auto-width path="command"></vaadin-grid-column>
          <vaadin-grid-column auto-width path="keys"></vaadin-grid-column>
          <vaadin-grid-column auto-width path="scope"></vaadin-grid-column>
        </vaadin-grid>
      `,
      root
    );
  };

  private get items() {
    if (!this.shortcuts.length) {
      throw new Error('No shortcuts defined.');
    }
    return this.shortcuts.map((s) => {
      const item = {
        command: s.description,
        keys: s.keyBinding,
        scope: this.getScopeName(s.scope)
      };
      return item;
    });
  }

  private getScopeName(scope?: Scope) {
    let name = 'Window';
    if (scope && scope !== window) {
      const el = scope as HTMLElement;
      if (el.id) name = `#${el.id}`;
      else name = `${el.tagName}${el.className ? `.${el.className}` : ''}`;
    }
    return name;
  }

  open() {
    this.opened = true;
  }

  close() {
    this.opened = false;
  }
}

customElements.define(KeyboardShortcutDialog.is, KeyboardShortcutDialog);

/* OVERLAY STYLES */

registerStyles(
  EnhancedDialogOverlay.is,
  css`
    [part='overlay'] {
      position: absolute;
      top: var(--lumo-space-m);
      right: var(--lumo-space-m);
      bottom: unset;
      left: unset;
    }
  `
);

registerStyles(
  'vaadin-grid',
  css`
    :host(#shortcuts) ::slotted(vaadin-grid-cell-content) {
      font-size: var(--lumo-font-size-s);
    }

    [part~='header-cell'] ::slotted(vaadin-grid-cell-content) {
      font-size: var(--lumo-font-size-m);
      font-weight: bold;
    }
  `
);

export { EnhancedDialogOverlay as KeyboardShortcutOverlay };
