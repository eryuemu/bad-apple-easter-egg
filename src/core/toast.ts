export class ToastManager {
  private el: HTMLElement | null = null;
  private textEl: HTMLElement | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.ensureElements();
  }

  private ensureElements() {
    if (typeof document === 'undefined') return;

    let existing = document.getElementById('ba-toast');
    if (!existing) {
      const toast = document.createElement('div');
      toast.id = 'ba-toast';
      toast.className = 'ba-toast';
      toast.setAttribute('aria-live', 'polite');

      const icon = document.createElement('span');
      icon.className = 'ba-toast-icon';
      icon.textContent = '🍎';

      const text = document.createElement('span');
      text.id = 'ba-toast-text';
      text.className = 'ba-toast-text';

      toast.appendChild(icon);
      toast.appendChild(text);
      document.body.appendChild(toast);
      existing = toast;
    }

    this.el = existing;
    this.textEl = existing.querySelector('#ba-toast-text');
  }

  public show(message: string, duration = 1800) {
    this.ensureElements();
    if (!this.el || !this.textEl) return;

    this.textEl.textContent = message;
    this.el.classList.add('show');

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.el?.classList.remove('show');
      this.timer = null;
    }, duration);
  }

  public hide() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.el?.classList.remove('show');
  }

  public destroy() {
    this.hide();
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.el = null;
    this.textEl = null;
  }
}
