import { dispatchWindowMessageEvent } from '@test-utils/dispatchWindowMessageEvent.js';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import type { FnToSpy } from '@test-utils/types.js';

import { resetMiniAppsEventEmitter } from '@/bridge/events/event-emitter/singleton.js';
import { ThemeParams } from '@/components/ThemeParams/ThemeParams.js';

import { bindThemeParamsCSSVars } from './bindThemeParamsCSSVars.js';

let setCSSPropertySpy: FnToSpy<typeof document.documentElement.style.setProperty>;

beforeAll(() => {
  setCSSPropertySpy = vi
    .spyOn(document.documentElement.style, 'setProperty')
    .mockImplementation(() => {
    });
});

afterEach(() => {
  setCSSPropertySpy.mockClear();
  resetMiniAppsEventEmitter();
})

it('should set --tg-theme-{key} CSS vars, where key is a kebab-cased theme keys', () => {
  bindThemeParamsCSSVars(new ThemeParams({
    bgColor: '#abcdef',
    accentTextColor: '#000011',
  }));

  expect(setCSSPropertySpy).toHaveBeenCalledTimes(2);
  expect(setCSSPropertySpy).toHaveBeenCalledWith('--tg-theme-bg-color', '#abcdef');
  expect(setCSSPropertySpy).toHaveBeenCalledWith('--tg-theme-accent-text-color', '#000011');
});

it(
  'should update --tg-theme-{key} variables to the values, received in the Theme change events',
  async () => {
    const tp = new ThemeParams({
      bgColor: '#abcdef',
      accentTextColor: '#000011',
    });
    bindThemeParamsCSSVars(tp);
    setCSSPropertySpy.mockClear();

    tp.listen();

    dispatchWindowMessageEvent('theme_changed', {
      theme_params: {
        bg_color: '#111111',
        accent_text_color: '#222222',
        text_color: '#333333',
      },
    });

    expect(setCSSPropertySpy).toHaveBeenCalledTimes(3);
    expect(setCSSPropertySpy).toHaveBeenCalledWith('--tg-theme-bg-color', '#111111');
    expect(setCSSPropertySpy).toHaveBeenCalledWith('--tg-theme-accent-text-color', '#222222');
    expect(setCSSPropertySpy).toHaveBeenCalledWith('--tg-theme-text-color', '#333333');
  },
);

it('should set a CSS variable following a logic, described in the getCSSVarName argument', () => {
  bindThemeParamsCSSVars(
    new ThemeParams({ bgColor: '#abcdef', accentTextColor: '#000011' }),
    (property) => `--my-${property}`,
  );

  expect(setCSSPropertySpy).toHaveBeenCalledTimes(2);
  expect(setCSSPropertySpy).toHaveBeenCalledWith('--my-bgColor', '#abcdef');
  expect(setCSSPropertySpy).toHaveBeenCalledWith('--my-accentTextColor', '#000011');
});

it('should stop updating variables, if returned function was called', () => {
  const tp = new ThemeParams({
    bgColor: '#abcdef',
    accentTextColor: '#000011',
  });
  const cleanup = bindThemeParamsCSSVars(tp);

  expect(setCSSPropertySpy).toHaveBeenCalledTimes(2);
  tp.listen();
  dispatchWindowMessageEvent('theme_changed', {
    theme_params: {
      bg_color: '#111111',
    },
  });
  expect(setCSSPropertySpy).toHaveBeenCalledTimes(4);

  cleanup();
  dispatchWindowMessageEvent('theme_changed', {
    theme_params: {
      bg_color: '#222222',
    },
  });
  expect(setCSSPropertySpy).toHaveBeenCalledTimes(4);
});
