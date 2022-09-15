import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { KSM, KeyboardShortcutUtils, Key, KeyBinding } from '../src';
import { FormLayoutResponsiveStep } from '@vaadin/form-layout';
import { TextField } from '@vaadin/text-field';
import '@vaadin/vaadin-lumo-styles';
import '@vaadin/form-layout/vaadin-form-item';
import '@vaadin/form-layout';
import '@vaadin/text-field';
import '@vaadin/icons';
import '@vaadin/icon';

@customElement('demo-view')
export class DemoView extends LitElement {
  @property({ type: Array }) helpCommand: KeyBinding = [Key.Control, Key.Shift, Key.QuestionMark];
  @property({ type: String }) incrementCommand: KeyBinding = Key.ArrowUp;
  @property({ type: String }) decrementCommand: KeyBinding = Key.ArrowDown;
  @property({ type: String }) clearCommand: KeyBinding = [Key.MOD, Key.K];
  @property({ type: Number }) counter = 0;
  @query('#code-sample') codeSample?: HTMLElement;
  @query('#counter') counterElement?: HTMLElement;

  private ksm?: KSM;
  private timeout?: number;
  private steps: FormLayoutResponsiveStep[] = [{ minWidth: 0, columns: 1 }];

  render() {
    return html`
      <h2 id="header">VCF Keyboard Shortcut Manager</h2>
      <h4>
        A modern library allowing you to manage keyboard shortcuts in a <a href="https://www.vaadin.com">Vaadin</a> application (or any framework).
      </h4>
      <div id="counter" title="click to focus"><b>Counter:</b> ${this.counter}</div>
      <div id="container">
        <h3>Key Bindings</h3>
        <vaadin-form-layout .responsiveSteps="${this.steps}">
          <vaadin-form-item>
            <label slot="label">Help Dialog</label>
            <vaadin-text-field
              value="${this.parseCommand(this.helpCommand)}"
              required
              @value-changed="${this.onInput(Command.help)}"
            ></vaadin-text-field>
          </vaadin-form-item>
          <vaadin-form-item>
            <label slot="label">Clear Editable Fields</label>
            <vaadin-text-field
              value="${this.parseCommand(this.clearCommand)}"
              required
              @value-changed="${this.onInput(Command.clear)}"
            ></vaadin-text-field>
          </vaadin-form-item>
          <vaadin-form-item>
            <label slot="label">Increment Counter</label>
            <vaadin-text-field
              value="${this.parseCommand(this.incrementCommand)}"
              required
              @value-changed="${this.onInput(Command.increment)}"
            ></vaadin-text-field>
          </vaadin-form-item>
          <vaadin-form-item>
            <label slot="label">Decrement Counter</label>
            <vaadin-text-field
              value="${this.parseCommand(this.decrementCommand)}"
              required
              @value-changed="${this.onInput(Command.decrement)}"
            ></vaadin-text-field>
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
          <vaadin-icon icon="vaadin:code"></vaadin-icon>
        </vaadin-button>
        <vaadin-button id="help" theme="icon tertiary" @click="${this.onHelp}">
          <vaadin-icon icon="vaadin:question-circle"></vaadin-icon>
        </vaadin-button>
      </div>
      <h4>Change the text-field content to set the shortcut key bindings.</h4>
    `;
  }

  firstUpdated() {
    window.addEventListener('help-dialog', () => this.ksm?.toggleHelpDialog());
    this.counterElement?.addEventListener('increment', () => this.counter++);
    this.counterElement?.addEventListener('decrement', () => this.counter--);
  }

  setShortcuts() {
    if (this.ksm) this.ksm.unsubscribe();
    this.ksm = new KSM({ helpDialog: true });
    this.ksm.add([
      {
        keyBinding: this.helpCommand,
        handler: 'help-dialog',
        description: 'Opens the help dialog.'
      },
      {
        scope: '#counter',
        keyBinding: this.incrementCommand,
        handler: 'increment',
        description: 'Increment the counter.'
      },
      {
        scope: '#counter',
        keyBinding: this.decrementCommand,
        handler: 'decrement',
        description: 'Decrement the counter.'
      },
      {
        keyBinding: this.clearCommand,
        handler: () => {
          document.body.querySelectorAll('vaadin-text-field:not([disabled])').forEach((el: any) => {
            el.value = '';
            el.validate();
          });
        },
        description: 'Clear editable text fields.'
      },
      {
        keyBinding: [Key.Alt, Key.F8],
        handler: () => KeyboardShortcutUtils.focusNextInvalidField(),
        description: 'Next invalid field.'
      },
      {
        keyBinding: [Key.Alt, Key.Shift, Key.F8],
        handler: () => KeyboardShortcutUtils.focusPreviousInvalidField(),
        description: 'Previous invalid field.'
      }
    ]);
    this.ksm.subscribe();
  }

  private onHelp = () => this.ksm?.toggleHelpDialog();

  private onDocs = () => (location.href = 'docs/index.html');

  private onInput = (command: Command) => {
    return (e: Event) => {
      const demo = this as MappedDemoView;
      const field = e.target as TextField;
      try {
        demo[command] = JSON.parse(field.value);
      } catch (e) {
        demo[command] = field.value;
      }
      this.requestUpdate(command);
      /* Reset Shortcuts */
      window.clearTimeout(this.timeout);
      this.timeout = window.setTimeout(() => this.setShortcuts(), 300);
    };
  };

  protected createRenderRoot() {
    return this;
  }

  private parseCommand(kb: KeyBinding) {
    return Array.isArray(kb) ? JSON.stringify(kb) : kb;
  }
}

type MappedDemoView = { [key in Command]: KeyBinding | KeyBinding[] };

enum Command {
  help = 'helpCommand',
  clear = 'clearCommand',
  increment = 'incrementCommand',
  decrement = 'decrementCommand'
}
