# vcf-keyboard-shortcut-manager

[![npm version](https://badgen.net/npm/v/@vaadin-component-factory/vcf-element)](https://www.npmjs.com/package/@vaadin-component-factory/vcf-element) [![Published on Vaadin Directory](https://img.shields.io/badge/Vaadin%20Directory-published-00b4f0.svg)](https://vaadin.com/directory/component/vaadin-component-factoryvcf-element)

A modern library implemented in TypeScript allowing you to manage keyboard shortcuts in a Vaadin (or any framework) web application.

- Dispatch custom events from keyboard shortcuts.
- Bind multiple keyboard commands to a single event listener.
- Easily create simple keyboard shortcut help dialog/popup.

Internally this project uses the [Tinykeys](https://github.com/jamiebuilds/tinykeys) library.

## Usage

Create an array of `KeyboardShortcut` definitions:

```ts
const shortcuts: KeyboardShortcut = [
  {
    keyBinding: this.helpCommand,
    handler: 'help-dialog',
    description: 'Opens the help dialog.'
  }
];
```

Then create a `KeyboardShortcutManager` instance and `subscribe` your shortcuts to activate them:

```ts
const ksm = new KeyboardShortcutManager({ shortcuts, root: this.shadowRoot, helpDialog: true });

this.ksm.add();

ksm.subscribe();
```

[Keys and Codes](https://github.com/jamiebuilds/tinykeys#commonly-used-keys-and-codes)

## Install

**NPM**

```
npm i @vaadin-component-factory/vcf-keyboard-chortcut-manager
```

**Yarn**

```
yarn add @vaadin-component-factory/vcf-keyboard-chortcut-manager
```
