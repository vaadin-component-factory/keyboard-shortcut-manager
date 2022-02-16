# VCF Keyboard Shortcut Manager

[![npm version](https://badgen.net/npm/v/@vaadin-component-factory/keyboard-shortcut-manager)](https://www.npmjs.com/package/@vaadin-component-factory/keyboard-shortcut-manager) [![Published on Vaadin Directory](https://img.shields.io/badge/Vaadin%20Directory-published-00b4f0.svg)](https://vaadin.com/directory/component/vaadin-component-factorykeyboard-shortcut-manager)

A modern library for managing keyboard shortcuts in a [Vaadin](https://vaadin.com) application (or any framework).

- Dispatch custom events from keyboard shortcuts.
- Bind multiple keyboard commands to a single event listener.
- Easily create simple keyboard shortcut help dialog/popup.
- Compatible with web components and [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM).
- Implemented in [TypeScript](https://www.typescriptlang.org/).

This is a wrapper for the [Tinykeys](https://github.com/jamiebuilds/tinykeys) library.

## Install

```sh
npm i @vaadin-component-factory/vcf-keyboard-chortcut-manager
```

## Usage

Create an array of `KeyboardShortcut` definitions:

```ts
const shortcuts: KeyboardShortcut = [
  {
    keyBinding: 'Control+Shift+?',
    handler: 'help-dialog',
    description: 'Opens the help dialog.'
  }
];
```

Then create a `KeyboardShortcutManager` instance and `subscribe` your shortcuts to activate them:

```ts
const ksm = new KeyboardShortcutManager({ shortcuts, helpDialog: true });

ksm.subscribe();
```

## Keybinding Syntax

Refer to the following links for more information on the keybinding syntax:

- [Keys and Codes](https://github.com/jamiebuilds/tinykeys#commonly-used-keys-and-codes)

- [Keybinding Syntax](https://github.com/jamiebuilds/tinykeys#keybinding-syntax)
