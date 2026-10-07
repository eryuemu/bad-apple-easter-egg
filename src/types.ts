export type BadAppleMode = 'matrix' | 'silhouette';

export interface BadAppleOptions {
  /**
   * Selector or HTMLElement to attach the multi-click trigger to.
   * e.g., '#theme-toggle', '.avatar', or document.querySelector(...)
   */
  trigger?: string | HTMLElement;

  /**
   * Number of consecutive clicks required to activate the Easter Egg.
   * Default: 5
   */
  clicks?: number;

  /**
   * Time window in milliseconds for consecutive clicks.
   * Default: 2200
   */
  clickTimeout?: number;

  /**
   * Playback mode:
   * - 'matrix': Live webpage text detaches and swirls into Reimu Hakurei, igniting into a 60 FPS Hanzi matrix video.
   * - 'silhouette': 32-bit chroma-keyed holographic silhouette dancing directly over the readable live webpage.
   * Default: 'matrix'
   */
  mode?: BadAppleMode;

  /**
   * Primary video source URL.
   * Best if local and trimmed for 0-latency start.
   */
  videoUrl?: string;

  /**
   * Fallback CDN video source URL if primary URL fails.
   */
  fallbackVideoUrl?: string;

  /**
   * Selector for DOM elements from which to extract live webpage text.
   * Default: 'main, article, .site-header, h1, h2, h3, p, a, code'
   */
  textSelector?: string;

  /**
   * Default fallback text corpus when page text is sparse.
   */
  defaultTextCorpus?: string;

  /**
   * Audio volume (0.0 to 1.0).
   * Default: 0.8
   */
  volume?: number;

  /**
   * Show charging and activation toasts.
   * Default: true
   */
  showToast?: boolean;

  /**
   * Custom toast message formatter.
   */
  toastMessages?: {
    charging3?: string;
    charging4?: string;
    activated?: string;
  };

  /**
   * Enable keyboard shortcuts (ESC to exit, Space to toggle pause).
   * Default: true
   */
  keyboardControls?: boolean;

  /**
   * Exit when clicking anywhere on screen during playback.
   * Default: true
   */
  clickToExit?: boolean;

  /**
   * Callback fired when Easter Egg starts.
   */
  onStart?: (mode: BadAppleMode) => void;

  /**
   * Callback fired when Easter Egg stops.
   */
  onEnd?: () => void;

  /**
   * Callback fired when playback fails (e.g. autoplay blocked or CORS error).
   */
  onPlayError?: (error: any) => void;
}

export interface Particle {
  char: string;
  startX: number;
  startY: number;
  midX: number;
  midY: number;
  targetX: number;
  targetY: number;
  cp1X: number;
  cp1Y: number;
  cp2X: number;
  cp2Y: number;
  pullDist: number;
  baseAngle: number;
  swirlOffset: number;
  delay: number;
}
