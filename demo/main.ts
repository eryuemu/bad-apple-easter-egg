import '../src/styles.css';
import { initBadApple, startBadApple, stopBadApple } from '../src/index';

// 1. Dark/light theme switcher logic
const htmlEl = document.documentElement;
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');

let isDark = false;
themeToggleBtn?.addEventListener('click', () => {
  isDark = !isDark;
  if (isDark) {
    htmlEl.classList.add('dark');
    if (themeIcon) themeIcon.textContent = '☀️';
    if (themeText) themeText.textContent = '切换白天';
  } else {
    htmlEl.classList.remove('dark');
    if (themeIcon) themeIcon.textContent = '🌙';
    if (themeText) themeText.textContent = '切换夜间';
  }
});

// 2. Initialize Bad Apple!! Easter Egg
// Auto-hooks:
// - #theme-toggle (5 consecutive clicks) -> Matrix Mode (live text vortex convergence)
// - .avatar / .hero-avatar (5 consecutive clicks) -> Silhouette Mode (holographic overlay)
const badApple = initBadApple({
  clicks: 5,
  clickTimeout: 2200,
  videoUrl: '/media/bad-apple.mp4',
  volume: 0.8,
  showToast: true,
  onStart: (mode) => {
    console.log(`[BadApple Demo] Started playing in mode: ${mode}`);
  },
  onEnd: () => {
    console.log('[BadApple Demo] Playback ended / exited.');
  },
  onPlayError: (err) => {
    console.error('[BadApple Demo] Playback error encountered:', err);
  },
});

// 3. Programmatic Control Buttons for immediate manual testing
document.getElementById('btn-matrix')?.addEventListener('click', () => {
  startBadApple('matrix');
});

document.getElementById('btn-silhouette')?.addEventListener('click', () => {
  startBadApple('silhouette');
});

document.getElementById('btn-stop')?.addEventListener('click', () => {
  stopBadApple();
});

console.log('[BadApple Demo] Ready. Controller instance:', badApple);
