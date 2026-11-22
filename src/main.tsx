import { render } from 'preact';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import { setupKeyboard } from './ui/mathlive';
import { App } from './ui/app';
import './ui/styles.css';
import { loadCE } from './math/evaluate';

setupKeyboard();
render(<App />, document.getElementById('app')!);
// sprawdzarka ładuje się w tle
setTimeout(() => loadCE(), 300);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
