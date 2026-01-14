import { css } from 'lit';
import { registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles';

/**
 * Register Vaadin component styles BEFORE importing any Vaadin components.
 * This prevents the warning: "The custom element definition for X was finalized 
 * before a style module was registered."
 */

registerStyles(
  'vaadin-dialog-overlay',
  css`
    :host {
      --vcf-keyboard-shortcut-dialog-overlay-top: 1rem;
      --vcf-keyboard-shortcut-dialog-overlay-right: 1rem;
      --vcf-keyboard-shortcut-dialog-overlay-header-padding: 1.5rem;
    }

    :host(#vcf-keyboard-shortcut-dialog-overlay) [part='overlay'] {
      position: absolute;
      top: var(--vcf-keyboard-shortcut-dialog-overlay-top);
      right: var(--vcf-keyboard-shortcut-dialog-overlay-right);
      bottom: unset;
      left: unset;
      min-width: 500px;
    }

    :host(#vcf-keyboard-shortcut-dialog-overlay) [part='header'] {
      padding: var(--vcf-keyboard-shortcut-dialog-overlay-header-padding);
    }
  `
);

registerStyles(
  'vaadin-grid',
  css`
    :host {
      --vcf-keyboard-shortcut-dialog-overlay-shortcuts-font-size: 0.875rem;
    }

    :host(#shortcuts) ::slotted(vaadin-grid-cell-content) {
      font-size: var(--vcf-keyboard-shortcut-dialog-overlay-shortcuts-font-size);
    }

    :host(#shortcuts) [part~='header-cell'] ::slotted(vaadin-grid-cell-content) {
      font-weight: bold;
    }
  `
);
