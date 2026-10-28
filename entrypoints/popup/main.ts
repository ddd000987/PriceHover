import { mount } from 'svelte';
import { initI18n } from '../../src/i18n';
import App from './App.svelte';

// The chosen language has to be in hand before the first `t()` renders.
initI18n().finally(() => mount(App, { target: document.getElementById('app')! }));
