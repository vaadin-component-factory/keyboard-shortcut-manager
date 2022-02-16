import { KeyboardShortcutUtils } from './index';

it('gets the active element in shadowroot', () => {
  const field = document.createElement('vaadin-text-field');
  document.body.innerHTML = '<vaadin-text-field></vaadin-text-field>';

  field.focus();
  const activeElement = KeyboardShortcutUtils.getActiveElement();
  expect(activeElement?.tagName).toBe('input');
});
