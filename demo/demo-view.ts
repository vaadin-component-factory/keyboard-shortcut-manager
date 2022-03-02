import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { KeyboardShortcutManager, KeyboardShortcutUtils } from '../src';
import { FormLayoutResponsiveStep } from '@vaadin/vaadin-form-layout';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-form-layout/vaadin-form-item';
import '@vaadin/vaadin-form-layout';
import '@vaadin/vaadin-lumo-styles';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-icons';
import '@polymer/iron-icon';

@customElement('demo-view')
export class DemoView extends LitElement {
  @property({ type: String }) helpCommand = 'Control+Shift+?';
  @property({ type: String }) incrementCommand = 'ArrowUp';
  @property({ type: String }) decrementCommand = 'ArrowDown';
  @property({ type: String }) clearCommand = 'Control+K';
  @property({ type: Number }) counter = 0;
  @query('#code-sample') codeSample?: HTMLElement;

  static styles = [
    css`
      :host {
        display: block;
      }

      #counter {
        text-align: center;
        font-family: 'Fira Code', monospace;
        margin-bottom: calc(var(--lumo-space-l) * 3);
        background-color: var(--lumo-shade-10pct);
        padding: var(--lumo-space-m) 0;
        font-size: var(--lumo-font-size-xl);
        border: 1px solid transparent;
        border-width: 1px 0;
        cursor: pointer;
      }

      #counter:focus {
        border-color: var(--lumo-primary-color-50pct);
      }

      #container {
        margin: auto;
        width: calc(var(--lumo-size-xl) * 8);
      }

      #help {
        top: var(--lumo-space-m);
        right: var(--lumo-space-m);
      }

      #docs {
        top: var(--lumo-space-m);
        left: var(--lumo-space-m);
      }

      vaadin-form-item::part(label) {
        width: calc(var(--lumo-size-xl) * 3);
      }

      vaadin-text-field {
        width: calc(var(--lumo-size-xl) * 5);
      }

      vaadin-form-layout {
        margin: auto;
      }

      vaadin-button {
        position: fixed;
        cursor: pointer;
        background: var(--lumo-tint-50pct);
        border-radius: var(--lumo-border-radius-m);
        padding: var(--lumo-space-s);
      }

      h2,
      h3,
      h4 {
        font-family: 'Fira Code', monospace;
      }

      h2,
      h4 {
        text-align: center;
      }

      h4 {
        margin-bottom: calc(var(--lumo-space-l) * 3);
        font-size: var(--lumo-font-size-xs);
      }

      #code-sample {
        font-size: var(--lumo-font-size-s);
        margin: var(--lumo-space-xl) auto;
        width: 100%;
        max-width: calc(var(--lumo-size-xl) * 12);
        padding: 0 var(--lumo-space-m);
        border: 1px dashed;
        overflow: auto;
        border-radius: var(--lumo-border-radius-m);
      }
    `
  ];

  private ksm?: KeyboardShortcutManager;
  private timeout?: number;
  private steps: FormLayoutResponsiveStep[] = [{ minWidth: 0, columns: 1 }];

  render() {
    return html`
      <h2>VCF Keyboard Shortcut Manager</h2>
      <h4>
        A modern library allowing you to manage keyboard shortcuts in a <a href="https://www.vaadin.com">Vaadin</a> application (or any framework).
      </h4>
      <div id="counter" tabindex="-1"><b>Counter:</b> ${this.counter}</div>
      <div id="container">
        <h3>Key Bindings</h3>
        <vaadin-form-layout .responsiveSteps="${this.steps}">
          <vaadin-form-item>
            <label slot="label">Help Dialog</label>
            <vaadin-text-field value="${this.helpCommand}" required @value-changed="${this.onInput(Command.help)}"></vaadin-text-field>
          </vaadin-form-item>
          <vaadin-form-item>
            <label slot="label">Clear Editable Fields</label>
            <vaadin-text-field value="${this.clearCommand}" required @value-changed="${this.onInput(Command.clear)}"></vaadin-text-field>
          </vaadin-form-item>
          <vaadin-form-item>
            <label slot="label">Increment Counter</label>
            <vaadin-text-field value="${this.incrementCommand}" required @value-changed="${this.onInput(Command.increment)}"></vaadin-text-field>
          </vaadin-form-item>
          <vaadin-form-item>
            <label slot="label">Decrement Counter</label>
            <vaadin-text-field value="${this.decrementCommand}" required @value-changed="${this.onInput(Command.decrement)}"></vaadin-text-field>
          </vaadin-form-item>
          <vaadin-form-item>
            <label slot="label">Next Invalid Field</label>
            <vaadin-text-field value="Alt+F8" disabled></vaadin-text-field>
          </vaadin-form-item>
          <vaadin-form-item>
            <label slot="label">Previous Invalid Field</label>
            <vaadin-text-field value="Alt+Shift+F8" disabled></vaadin-text-field>
          </vaadin-form-item>
        </vaadin-form-layout>
        <vaadin-button id="docs" theme="icon tertiary" @click="${this.onDocs}">
          <iron-icon icon="vaadin:code"></iron-icon>
        </vaadin-button>
        <vaadin-button id="help" theme="icon tertiary" @click="${this.onHelp}">
          <iron-icon icon="vaadin:question-circle"></iron-icon>
        </vaadin-button>
      </div>
      <!-- CODE SAMPLE -->
      <link href="https://fonts.googleapis.com/css2?family=Fira+Code&display=swap" rel="stylesheet" />
      <pre id="code-sample">
        <code>
          import {
            KeyboardShortcutManager,
            KeyboardShortcutUtils,
            KeyboardShortcut
          } from '@vaadin-component-factory/keyboard-shortcut-manager';

          window.addEventListener('help-dialog', () => ksm.toggleHelpDialog());

          const shortcuts: KeyboardShortcut = [
            {
              keyBinding: ${this.helpCommand},
              handler: 'help-dialog',
              description: 'Opens the help dialog.'
            },
            {
              keyBinding: ${this.clearCommand},
              handler: () => {
                this.shadowRoot.querySelectorAll('vaadin-text-field:not([disabled])').forEach((el: any) => {
                  el.value = '';
                  el.validate();
                });
              },
              description: 'Clear editable text fields.'
            },
            {
              scope: '#counter',
              keyBinding: ${this.incrementCommand},
              handler: () => this.counter++,
              description: 'Increment the counter.'
            },
            {
              scope: '#counter',
              keyBinding: ${this.decrementCommand},
              handler: () => this.counter--,
              description: 'Decrement the counter.'
            },
            {
              keyBinding: 'Alt+F8',
              handler: () => KeyboardShortcutUtils.focusNextInvalidField(this.shadowRoot),
              description: 'Next invalid field.'
            },
            {
              keyBinding: 'Alt+Shift+F8',
              handler: () => KeyboardShortcutUtils.focusPreviousInvalidField(this.shadowRoot),
              description: 'Previous invalid field.'
            }
          ];

          const ksm = new KeyboardShortcutManager({ shortcuts, root: this.shadowRoot, helpDialog: true });

          ksm.subscribe();
        </code>
      </pre>
    `;
  }

  firstUpdated() {
    window.addEventListener('help-dialog', () => this.ksm.toggleHelpDialog());
  }

  setShortcuts() {
    if (this.ksm) this.ksm.unsubscribe();
    this.ksm = new KeyboardShortcutManager({ root: this.shadowRoot, helpDialog: true });
    this.ksm.add([
      {
        keyBinding: this.helpCommand,
        handler: 'help-dialog',
        description: 'Opens the help dialog.'
      },
      {
        scope: '#counter',
        keyBinding: this.incrementCommand,
        handler: () => this.counter++,
        description: 'Increment the counter.'
      },
      {
        scope: '#counter',
        keyBinding: this.decrementCommand,
        handler: () => this.counter--,
        description: 'Decrement the counter.'
      },
      {
        keyBinding: this.clearCommand,
        handler: () => {
          this.shadowRoot.querySelectorAll('vaadin-text-field:not([disabled])').forEach((el: any) => {
            el.value = '';
            el.validate();
          });
        },
        description: 'Clear editable text fields.'
      },
      {
        keyBinding: 'Alt+F8',
        handler: () => KeyboardShortcutUtils.focusNextInvalidField(this.shadowRoot),
        description: 'Next invalid field.'
      },
      {
        keyBinding: 'Alt+Shift+F8',
        handler: () => KeyboardShortcutUtils.focusPreviousInvalidField(this.shadowRoot),
        description: 'Previous invalid field.'
      }
    ]);
    this.ksm.subscribe();
  }

  private onHelp = () => this.ksm.toggleHelpDialog();

  private onDocs = () => (location.href = '/');

  private onInput = (command: Command) => {
    return (e: Event) => {
      const demo = this as MappedDemoView;
      const field = e.target as TextFieldElement;
      demo[command] = field.value;
      this.requestUpdate(command);
      /* Reset Shortcuts */
      window.clearTimeout(this.timeout);
      this.timeout = window.setTimeout(() => this.setShortcuts(), 300);
    };
  };
}

type MappedDemoView = { [key in Command]: string };

enum Command {
  help = 'helpCommand',
  clear = 'clearCommand',
  increment = 'incrementCommand',
  decrement = 'decrementCommand'
}
