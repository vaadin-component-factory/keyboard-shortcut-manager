import { html, css, render } from 'lit';
import { Dialog, DialogOverlay } from '@vaadin/dialog';
import { registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles';
import { KeyboardShortcut, Scope } from './KeyboardShortcut';
import { Key, KeyboardShortcutManager, ParsedKeyboardShortcut } from './KeyboardShortcutManager';
import { Grid } from '@vaadin/grid';
import '@vaadin/grid';

export class KeyboardShortcutDialog extends Dialog {
  shortcuts: ParsedKeyboardShortcut[] = [];

  private static HEADER_ID = 'header';
  private static GRID_ID = 'shortcuts';
  private headerText = 'Keyboard Shortcuts';

  static get properties() {
    return {
      ...(Dialog as PrivateDialog).properties,
      headerText: String
    };
  }

  constructor() {
    super();
    this.setGlobalStyles();
    this.draggable = true;
    this.resizable = true;
    this.renderer = this.overlayRenderer;
    this.headerRenderer = this.overlayHeaderRenderer;
    this.addEventListener('opened-changed', () => {
      (this as any).$.overlay.id = 'vcf-keyboard-shortcut-dialog-overlay';
    });
  }

  static get is() {
    return 'vcf-keyboard-shortcut-dialog';
  }

  get overlay() {
    return ((this as any)?.$?.overlay as DialogOverlay | undefined) ?? null;
  }

  get header() {
    let header = null;
    if (this.overlay) {
      header = this.overlay.querySelector(`#${KeyboardShortcutDialog.HEADER_ID}`) as HTMLHeadingElement | null;
    }
    return header;
  }

  open() {
    this.opened = true;
  }

  close() {
    this.opened = false;
  }

  get grid() {
    let grid = null;
    if (this.overlay) {
      grid = this.overlay.querySelector(`#${KeyboardShortcutDialog.GRID_ID}`) as Grid<KeyboardShortcut> | null;
    }
    return grid;
  }

  private overlayRenderer = (root: any) => {
    root.removeAttribute('with-backdrop');
    render(
      html`
        <vaadin-grid id="shortcuts" .items="${this.items}" all-rows-visible>
          <vaadin-grid-column auto-width path="command"></vaadin-grid-column>
          <vaadin-grid-column auto-width path="keys"></vaadin-grid-column>
          <vaadin-grid-column auto-width path="scope"></vaadin-grid-column>
        </vaadin-grid>
      `,
      root
    );
    this.setPIModifierInfo(root);
  };

  private setPIModifierInfo(root: HTMLElement) {
    requestAnimationFrame(() => {
      const { LIB_MODIFIER } = KeyboardShortcutManager;
      const content = root.querySelectorAll('vaadin-grid-cell-content');
      const mods = Array.from(content).filter((i) => i.textContent?.includes(LIB_MODIFIER)) as HTMLElement[];
      mods.forEach((mod) => {
        mod.innerText = mod.innerText.replace(LIB_MODIFIER, 'Command/Control');
      });
    });
  }

  private trim(str: string) {
    return str.trim().replace(/(  )+/g, '');
  }

  private overlayHeaderRenderer = (root: any) => {
    render(html`<h3 id="header">${this.headerText}</h3>`, root);
  };

  private get items() {
    if (!this.shortcuts.length) {
      throw new Error('No shortcuts defined.');
    }
    return this.shortcuts.map((s) => {
      const item = {
        command: s.description,
        keys: s.parsedKeyBinding,
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

  private setGlobalStyles() {
    const styles = css`
      #vcf-keyboard-shortcut-dialog-overlay #header {
        margin: 0;
      }
    `;
    const styleElement = document.createElement('style');
    styleElement.id = 'vcf-keyboard-shortcut-dialog-styles';
    styleElement.innerHTML = styles.toString();
    document.head.appendChild(styleElement);
  }
}

customElements.define(KeyboardShortcutDialog.is, KeyboardShortcutDialog);

/* OVERLAY STYLES */

registerStyles(
  'vaadin-dialog-overlay',
  css`
    :host(#vcf-keyboard-shortcut-dialog-overlay) [part='overlay'] {
      position: absolute;
      top: var(--lumo-space-m);
      right: var(--lumo-space-m);
      bottom: unset;
      left: unset;
      min-width: 500px;
    }

    :host(#vcf-keyboard-shortcut-dialog-overlay) [part='header'] {
      padding: var(--lumo-space-l);
    }
  `
);

registerStyles(
  'vaadin-grid',
  css`
    :host(#shortcuts) ::slotted(vaadin-grid-cell-content) {
      font-size: var(--lumo-font-size-s);
    }

    :host(#shortcuts) [part~='header-cell'] ::slotted(vaadin-grid-cell-content) {
      font-weight: bold;
    }
  `
);

export { DialogOverlay as KeyboardShortcutOverlay };

/* PRIVATE TYPES */

type PrivateDialog = typeof Dialog & { readonly properties: any };
