// Application entry — mounts the root React tree and global providers.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { registerPwa } from './sw/index.js';

registerPwa();

// iOS Safari ignores `user-scalable=no` for multi-finger gestures; block its
// proprietary gesture events plus double-tap-to-zoom so only the Map page's
// own pinch handler can zoom (anywhere else the page stays at 1:1).
['gesturestart', 'gesturechange', 'gestureend'].forEach((type) => {
  document.addEventListener(type, (e) => e.preventDefault(), { passive: false });
});
document.addEventListener('dblclick', (e) => e.preventDefault(), {
  passive: false,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
