import './styles.css';
import { BadAppleMode, BadAppleOptions } from './types';
import { ensureStylesInjected } from './core/styles';
import { ToastManager } from './core/toast';
import { BadAppleRenderer } from './core/renderer';

export * from './types';
export * from './core/bitmask';
export * from './core/dom-extractor';
export * from './core/vortex';
export * from './core/toast';
export * from './core/renderer';
export * from './core/styles';

export class BadAppleController {
  private options: BadAppleOptions;
  private renderer: BadAppleRenderer | null = null;
  private toast: ToastManager | null = null;
  private clickCounts = new Map<HTMLElement | string, number>();
  private clickTimers = new Map<HTMLElement | string, any>();
  private isDestroyed = false;

  constructor(options: BadAppleOptions = {}) {
    this.options = {
      clicks: 5,
      clickTimeout: 2200,
      mode: 'matrix',
      volume: 0.8,
      showToast: true,
      keyboardControls: true,
      clickToExit: true,
      ...options,
    };

    if (typeof document !== 'undefined') {
      ensureStylesInjected();
      this.renderer = new BadAppleRenderer(this.options);
      if (this.options.showToast !== false) {
        this.toast = new ToastManager();
      }
      this.bindTriggers();
      this.bindKeyboard();
    }
  }

  public getRenderer(): BadAppleRenderer | null {
    return this.renderer;
  }

  public getToast(): ToastManager | null {
    return this.toast;
  }

  public start(mode?: BadAppleMode) {
    if (this.isDestroyed || !this.renderer) return;
    this.renderer.start(mode || this.options.mode);
  }

  public stop() {
    if (this.isDestroyed || !this.renderer) return;
    this.renderer.stop();
  }

  public toggle() {
    if (this.isDestroyed || !this.renderer) return;
    this.renderer.togglePlay();
  }

  public warmUp() {
    if (this.isDestroyed || !this.renderer) return;
    this.renderer.warmUp();
  }

  public isPlaying(): boolean {
    return this.renderer ? this.renderer.getIsPlaying() : false;
  }

  private bindKeyboard() {
    if (this.options.keyboardControls === false || typeof document === 'undefined') return;

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!this.renderer || !this.renderer.getIsPlaying()) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        this.stop();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  private handleTriggerClick(
    key: HTMLElement | string,
    mode: BadAppleMode,
    targetEl?: HTMLElement
  ) {
    const requiredClicks = this.options.clicks || 5;
    const current = (this.clickCounts.get(key) || 0) + 1;
    this.clickCounts.set(key, current);

    const prevTimer = this.clickTimers.get(key);
    if (prevTimer) clearTimeout(prevTimer);

    const timer = setTimeout(() => {
      this.clickCounts.set(key, 0);
    }, this.options.clickTimeout || 2200);
    this.clickTimers.set(key, timer);

    // Subtle wobble animation for element
    if (targetEl) {
      targetEl.style.transition = 'transform 0.15s ease';
      targetEl.style.transform = `scale(0.92) rotate(${current % 2 === 0 ? '5deg' : '-5deg'})`;
      setTimeout(() => {
        targetEl.style.transform = '';
      }, 150);
    }

    if (current >= requiredClicks) {
      this.clickCounts.set(key, 0);
      if (this.options.showToast !== false && this.toast) {
        const msg =
          this.options.toastMessages?.activated ||
          (mode === 'matrix'
            ? '🌀 文字脱离页面！博文汉字正在汇聚成 Bad Apple 开场人物...'
            : '💥 全息透明投影 Bad Apple 降临 (按 ESC 退出)');
        this.toast.show(msg, 2400);
      }
      this.start(mode);
    } else if (current === 3) {
      this.warmUp();
      if (this.options.showToast !== false && this.toast) {
        const msg =
          this.options.toastMessages?.charging3 ||
          (mode === 'matrix'
            ? '🍎 阴阳逆转充能中... (3/5)'
            : '🍎 侦测到神秘高能信号... (3/5)');
        this.toast.show(msg, 1200);
      }
    } else if (current === 4) {
      this.warmUp();
      if (this.options.showToast !== false && this.toast) {
        const msg =
          this.options.toastMessages?.charging4 ||
          (mode === 'matrix'
            ? '⚡ 空间引力波紊乱！万千汉字即将脱离页面！(4/5)'
            : '⚡ 核心过载！再按 1 次唤醒幻想乡！(4/5)');
        this.toast.show(msg, 1400);
      }
    }
  }

  private bindTriggers() {
    if (typeof document === 'undefined') return;

    // 1. Specific trigger option if provided
    if (this.options.trigger) {
      const trigger = this.options.trigger;
      if (typeof trigger === 'string') {
        document.addEventListener(
          'click',
          (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;
            const match = target.closest(trigger) as HTMLElement | null;
            if (match) {
              if (
                match.tagName.toLowerCase() === 'a' ||
                match.closest('a')
              ) {
                const count = this.clickCounts.get(trigger) || 0;
                if (count > 0) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }
              this.handleTriggerClick(trigger, this.options.mode || 'matrix', match);
            }
          },
          true
        );
      } else if (trigger instanceof HTMLElement) {
        trigger.addEventListener('click', () => {
          this.handleTriggerClick(trigger, this.options.mode || 'matrix', trigger);
        });
      }
      return;
    }

    // 2. Default blog smart delegation:
    // Theme toggle -> Matrix Mode
    // Avatar -> Silhouette Mode
    document.addEventListener(
      'click',
      (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        // Matrix entrance: theme toggle buttons
        const themeBtn = target.closest('#theme-toggle, .theme-toggle, .dark-mode-toggle') as HTMLElement | null;
        if (themeBtn) {
          this.handleTriggerClick('#theme-toggle', 'matrix', themeBtn);
          return;
        }

        // Silhouette entrance: avatar elements
        const avatarEl = target.closest(
          '.hero-avatar, .sidebar-avatar, .avatar-img, .sidebar-avatar-link, .avatar'
        ) as HTMLElement | null;
        if (avatarEl) {
          const current = this.clickCounts.get('.avatar') || 0;
          if (current > 0 && (avatarEl.tagName.toLowerCase() === 'a' || avatarEl.closest('a'))) {
            e.preventDefault();
            e.stopPropagation();
          }
          this.handleTriggerClick('.avatar', 'silhouette', avatarEl);
        }
      },
      true
    );
  }

  public destroy() {
    this.isDestroyed = true;
    this.stop();
    if (this.toast) {
      this.toast.destroy();
      this.toast = null;
    }
  }
}

let globalInstance: BadAppleController | null = null;

/**
 * Initializes the Bad Apple!! Easter Egg on the current webpage.
 */
export function initBadApple(options?: BadAppleOptions): BadAppleController {
  if (globalInstance) {
    globalInstance.destroy();
  }
  globalInstance = new BadAppleController(options);
  return globalInstance;
}

/**
 * Starts Bad Apple!! immediately in the specified mode.
 */
export function startBadApple(mode?: BadAppleMode, options?: BadAppleOptions): void {
  if (!globalInstance) {
    globalInstance = new BadAppleController(options);
  }
  globalInstance.start(mode);
}

/**
 * Stops Bad Apple!! playback and restores the original page view.
 */
export function stopBadApple(): void {
  if (globalInstance) {
    globalInstance.stop();
  }
}

/**
 * Toggles play/pause state.
 */
export function toggleBadApple(): void {
  if (globalInstance) {
    globalInstance.toggle();
  }
}

// Global browser window attachment for IIFE / script tag
if (typeof window !== 'undefined') {
  (window as any).BadAppleEasterEgg = {
    init: initBadApple,
    start: startBadApple,
    stop: stopBadApple,
    toggle: toggleBadApple,
    BadAppleController,
  };
}

export default {
  init: initBadApple,
  start: startBadApple,
  stop: stopBadApple,
  toggle: toggleBadApple,
  BadAppleController,
};
