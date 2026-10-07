import { BadAppleMode, BadAppleOptions, Particle } from '../types';
import {
  decodeTargetPoints,
  MATRIX_COLS,
  MATRIX_ROWS,
  PROC_W,
  PROC_H,
} from './bitmask';
import {
  extractPageText,
  gatherPageTextParticles,
} from './dom-extractor';
import { quarticEaseOut } from './vortex';

export class BadAppleRenderer {
  private options: BadAppleOptions;
  private overlayEl: HTMLElement | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private projCanvas: HTMLCanvasElement | null = null;
  private projCtx: CanvasRenderingContext2D | null = null;
  private procCanvas: HTMLCanvasElement | null = null;
  private procCtx: CanvasRenderingContext2D | null = null;

  private currentMode: BadAppleMode = 'matrix';
  private isPlaying = false;
  private isMorphing = false;
  private animFrameId: number | null = null;
  private blogChars = '';
  private morphParticles: Particle[] = [];
  private morphStartTime = 0;
  private shockwaveStartTime = 0;
  private corsErrorNotified = false;

  constructor(options: BadAppleOptions) {
    this.options = options;
    this.initDOM();
  }

  public updateOptions(options: Partial<BadAppleOptions>) {
    this.options = { ...this.options, ...options };
  }

  private initDOM() {
    if (typeof document === 'undefined') return;

    let overlay = document.getElementById('bad-apple-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'bad-apple-overlay';
      overlay.className = 'bad-apple-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.style.display = 'none';

      const video = document.createElement('video');
      video.id = 'ba-source-video';
      video.playsInline = true;
      video.crossOrigin = 'anonymous';
      video.style.display = 'none';
      overlay.appendChild(video);

      const pCanvas = document.createElement('canvas');
      pCanvas.id = 'ba-projection-canvas';
      pCanvas.className = 'ba-projection-canvas';
      overlay.appendChild(pCanvas);

      const oCanvas = document.createElement('canvas');
      oCanvas.id = 'ba-proc-canvas';
      oCanvas.width = PROC_W;
      oCanvas.height = PROC_H;
      oCanvas.style.display = 'none';
      overlay.appendChild(oCanvas);

      document.body.appendChild(overlay);
    }

    this.overlayEl = overlay;
    this.videoEl = overlay.querySelector('#ba-source-video') as HTMLVideoElement;
    this.projCanvas = overlay.querySelector('#ba-projection-canvas') as HTMLCanvasElement;
    if (this.projCanvas) {
      this.projCtx = this.projCanvas.getContext('2d');
    }
    this.procCanvas = overlay.querySelector('#ba-proc-canvas') as HTMLCanvasElement;
    if (this.procCanvas) {
      this.procCtx = this.procCanvas.getContext('2d', { willReadFrequently: true });
    }

    this.bindEvents();
  }

  private bindEvents() {
    if (this.overlayEl && this.options.clickToExit !== false) {
      this.overlayEl.addEventListener('click', (e) => {
        if (e.target === this.overlayEl || e.target === this.projCanvas) {
          this.stop();
        }
      });
    }

    if (this.videoEl) {
      this.videoEl.addEventListener('ended', () => {
        this.stop();
      });
    }
  }

  public warmUp() {
    this.loadVideoSource();
  }

  private loadVideoSource() {
    if (!this.videoEl) return;
    if (this.videoEl.src && this.videoEl.src !== '') return;

    const primaryUrl =
      this.options.videoUrl ||
      'https://cdn.jsdelivr.net/gh/milkbottle0305/bad-apple-ascii@main/res/video.mp4';
    const fallbackUrl =
      this.options.fallbackVideoUrl ||
      'https://cdn.jsdelivr.net/gh/milkbottle0305/bad-apple-ascii@main/res/video.mp4';

    this.videoEl.crossOrigin = 'anonymous';
    this.videoEl.src = primaryUrl;
    this.videoEl.preload = 'auto';
    this.videoEl.volume =
      typeof this.options.volume === 'number' ? this.options.volume : 0.8;

    this.videoEl.onerror = () => {
      console.warn(
        `[BadApple] Primary video source failed (${this.videoEl?.src}), switching to fallback:`,
        fallbackUrl
      );
      if (this.videoEl && fallbackUrl && this.videoEl.src !== fallbackUrl) {
        this.videoEl.src = fallbackUrl;
        this.videoEl.load();
      }
    };

    this.videoEl.load();
  }

  public start(mode?: BadAppleMode) {
    this.initDOM();
    if (!this.overlayEl || !this.videoEl || !this.projCanvas) return;

    this.currentMode = mode || this.options.mode || 'matrix';
    this.shockwaveStartTime = 0;
    this.corsErrorNotified = false;

    // Mutually pause other media if background music manager exists
    try {
      const win = window as any;
      if (win.__music_player_manager?.audio && !win.__music_player_manager.audio.paused) {
        win.__music_player_manager.audio.pause();
      }
    } catch (e) {
      // ignore
    }

    this.blogChars = extractPageText(
      this.options.textSelector,
      this.options.defaultTextCorpus
    );

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    this.projCanvas.width = vw;
    this.projCanvas.height = vh;

    if (this.currentMode === 'matrix') {
      this.overlayEl.classList.remove('mode-silhouette', 'dark-stage');
      this.overlayEl.classList.add('mode-matrix', 'active');
      this.overlayEl.style.display = 'block';

      const targets = decodeTargetPoints(vw, vh);
      this.morphParticles = gatherPageTextParticles(
        vw,
        vh,
        targets,
        this.options.textSelector,
        this.blogChars
      );
      this.morphStartTime = 0;
      this.isMorphing = true;

      // Trigger reflow for CSS transition
      void this.overlayEl.offsetWidth;

      requestAnimationFrame(() => {
        this.overlayEl?.classList.add('dark-stage');
        document.documentElement.classList.add('ba-converge-active');
      });
    } else {
      this.overlayEl.classList.remove('mode-matrix', 'dark-stage');
      this.overlayEl.classList.add('mode-silhouette', 'active');
      this.overlayEl.style.display = 'block';
      document.documentElement.classList.add('ba-silhouette-active');
      this.isMorphing = false;
    }

    this.loadVideoSource();

    try {
      // Auto skip silent intro if remote uncut version
      if (
        this.videoEl.src.includes('milkbottle0305') ||
        (this.videoEl.src.includes('video.mp4') && !this.videoEl.src.includes('bad-apple.mp4'))
      ) {
        this.videoEl.currentTime = 1.35;
      } else {
        this.videoEl.currentTime = 0;
      }
    } catch (e) {
      // ignore
    }

    this.videoEl
      .play()
      .then(() => {
        this.isPlaying = true;
        this.options.onStart?.(this.currentMode);
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        this.animFrameId = requestAnimationFrame(this.renderLoop);
      })
      .catch((err) => {
        console.warn('[BadApple] Autoplay blocked or media error:', err);
        this.options.onPlayError?.(err);
        this.isPlaying = false;
        if (this.isMorphing) {
          if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
          this.animFrameId = requestAnimationFrame(this.renderLoop);
        }
      });
  }

  public stop() {
    if (!this.overlayEl || !this.videoEl) return;

    this.isMorphing = false;
    this.shockwaveStartTime = 0;

    document.documentElement.classList.remove(
      'ba-converge-active',
      'ba-playing-active',
      'ba-silhouette-active'
    );

    if (this.overlayEl) {
      this.overlayEl.classList.remove('dark-stage');
    }

    setTimeout(() => {
      if (this.overlayEl) {
        this.overlayEl.classList.remove('active', 'mode-matrix', 'mode-silhouette');
        this.overlayEl.style.display = 'none';
      }
    }, 400);

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.videoEl) {
      this.videoEl.pause();
      this.isPlaying = false;
    }

    if (this.projCtx && this.projCanvas) {
      this.projCtx.clearRect(0, 0, this.projCanvas.width, this.projCanvas.height);
    }

    this.options.onEnd?.();
  }

  public togglePlay() {
    if (!this.videoEl) return;
    if (this.videoEl.paused) {
      this.videoEl.play();
      this.isPlaying = true;
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      this.animFrameId = requestAnimationFrame(this.renderLoop);
    } else {
      this.videoEl.pause();
      this.isPlaying = false;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private renderLoop = (timestamp: number) => {
    if (!this.projCanvas || !this.projCtx) return;

    if (
      this.projCanvas.width !== window.innerWidth ||
      this.projCanvas.height !== window.innerHeight
    ) {
      this.projCanvas.width = window.innerWidth;
      this.projCanvas.height = window.innerHeight;
    }
    const vw = this.projCanvas.width;
    const vh = this.projCanvas.height;

    // ─── Phase A: Particle Convergence ───
    if (this.isMorphing) {
      if (!this.morphStartTime) this.morphStartTime = timestamp;

      const SUCK_TIME = 0.36; // Initial 0.36s: characters accelerate and pull strongly inward towards screen center
      const CONVERGE_DURATION = 1.30;
      const DROP_TIME = 1.35;

      let timeSeconds = 0;
      if (this.videoEl && !this.videoEl.paused && this.videoEl.currentTime > 0) {
        timeSeconds = this.videoEl.currentTime;
      } else {
        timeSeconds = (timestamp - this.morphStartTime) / 1000;
      }

      // Pre-warm offscreen canvas and GPU texture cache at t > 0.4s
      if (timeSeconds > 0.4 && this.procCtx && this.procCanvas && this.videoEl && !this.videoEl.paused) {
        try {
          this.procCtx.drawImage(this.videoEl, 0, 0, PROC_W, PROC_H);
          this.procCtx.getImageData(0, 0, PROC_W, PROC_H);
        } catch (e) {
          // ignore CORS pre-warm error
        }
      }

      const isDarkTheme = document.documentElement.classList.contains('dark');

      this.projCtx.clearRect(0, 0, vw, vh);

      const aspect = PROC_W / PROC_H;
      let dw = vw;
      let dh = vw / aspect;
      if (dh > vh) {
        dh = vh;
        dw = vh * aspect;
      }
      const cellW = dw / MATRIX_COLS;
      const cellH = dh / MATRIX_ROWS;
      const uniformFontSize = Math.floor(Math.min(cellW, cellH) * 1.2);

      this.projCtx.font = `bold ${uniformFontSize}px "JetBrains Mono", "PingFang SC", "Microsoft YaHei", monospace`;
      this.projCtx.textAlign = 'center';
      this.projCtx.textBaseline = 'middle';

      const count = this.morphParticles.length;

      if (timeSeconds <= SUCK_TIME) {
        // Stage A1 (0.0s ~ 0.36s): Text pulled inward towards center
        const sProg = timeSeconds / SUCK_TIME;
        const se = Math.pow(sProg, 2.2);

        if (isDarkTheme) {
          this.projCtx.fillStyle = '#ffffff';
        } else {
          const gray = Math.round(24 + (180 - 24) * se);
          this.projCtx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
        }

        for (let i = 0; i < count; i++) {
          const p = this.morphParticles[i];
          const curDist = p.pullDist * se;
          const curAngle = p.baseAngle + p.swirlOffset * se;
          const px = p.startX + Math.cos(curAngle) * curDist;
          const py = p.startY + Math.sin(curAngle) * curDist;
          this.projCtx.fillText(p.char, px, py);
        }
      } else {
        // Stage A2 (0.36s ~ 1.30s): Swirl from inward position into opening silhouette
        const cProg = Math.min((timeSeconds - SUCK_TIME) / (CONVERGE_DURATION - SUCK_TIME), 1);

        if (isDarkTheme) {
          this.projCtx.fillStyle = '#ffffff';
        } else {
          const gray = Math.round(180 + (255 - 180) * cProg);
          this.projCtx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
        }

        for (let i = 0; i < count; i++) {
          const p = this.morphParticles[i];
          const pProg = cProg <= p.delay ? 0 : (cProg - p.delay) / (1 - p.delay);
          const pe = pProg >= 1 ? 1 : quarticEaseOut(pProg);
          const u = 1 - pe;
          const u2 = u * u;
          const pe2 = pe * pe;

          const px =
            u2 * u * p.midX +
            3 * u2 * pe * p.cp1X +
            3 * u * pe2 * p.cp2X +
            pe2 * pe * p.targetX;
          const py =
            u2 * u * p.midY +
            3 * u2 * pe * p.cp1Y +
            3 * u * pe2 * p.cp2Y +
            pe2 * pe * p.targetY;

          this.projCtx.fillText(p.char, px, py);
        }
      }

      if (timeSeconds >= DROP_TIME) {
        this.isMorphing = false;
        this.shockwaveStartTime = timestamp;
        document.documentElement.classList.add('ba-playing-active');
        // Fall through directly into Phase B without returning to prevent 1-frame stutter
      } else {
        this.animFrameId = requestAnimationFrame(this.renderLoop);
        return;
      }
    }

    // ─── Phase B: Main Playback (Matrix / Silhouette) ───
    if (!this.videoEl || this.videoEl.paused || this.videoEl.ended) {
      return;
    }

    if (this.procCtx && this.procCanvas) {
      try {
        this.procCtx.drawImage(this.videoEl, 0, 0, PROC_W, PROC_H);
        const imgData = this.procCtx.getImageData(0, 0, PROC_W, PROC_H);
        const buf32 = new Uint32Array(imgData.data.buffer);

        // Edge polarity check (sample 4 corners to determine black/white background)
        const c1 = buf32[0] & 0xff;
        const c2 = buf32[PROC_W - 1] & 0xff;
        const c3 = buf32[(PROC_H - 1) * PROC_W] & 0xff;
        const c4 = buf32[PROC_H * PROC_W - 1] & 0xff;
        const isBgWhite = (c1 + c2 + c3 + c4) / 4 > 128;

        const isDarkTheme = document.documentElement.classList.contains('dark');
        const fgColor = isDarkTheme ? 0xeeffffff : 0xe6181818;

        this.projCtx.clearRect(0, 0, vw, vh);

        const aspect = PROC_W / PROC_H;
        let dw = vw;
        let dh = vw / aspect;
        if (dh > vh) {
          dh = vh;
          dw = vh * aspect;
        }
        const ox = (vw - dw) / 2;
        const oy = (vh - dh) / 2;

        if (this.currentMode === 'silhouette') {
          const totalPixels = PROC_W * PROC_H;
          if (isBgWhite) {
            for (let i = 0; i < totalPixels; i++) {
              const gray = buf32[i] & 0xff;
              buf32[i] = gray > 140 ? 0x00000000 : fgColor;
            }
          } else {
            for (let i = 0; i < totalPixels; i++) {
              const gray = buf32[i] & 0xff;
              buf32[i] = gray < 115 ? 0x00000000 : fgColor;
            }
          }

          this.procCtx.putImageData(imgData, 0, 0);
          this.projCtx.drawImage(this.procCanvas, ox, oy, dw, dh);
        } else {
          // Matrix Hanzi Mode
          const cellW = dw / MATRIX_COLS;
          const cellH = dh / MATRIX_ROWS;
          const fontSize = Math.floor(Math.min(cellW, cellH) * 1.2);

          this.projCtx.font = `bold ${fontSize}px "JetBrains Mono", "PingFang SC", "Microsoft YaHei", monospace`;
          this.projCtx.fillStyle = '#ffffff';
          this.projCtx.textAlign = 'center';
          this.projCtx.textBaseline = 'middle';

          const stepX = PROC_W / MATRIX_COLS;
          const stepY = PROC_H / MATRIX_ROWS;
          const textLen = this.blogChars.length;
          let charIdx = 0;

          for (let row = 0; row < MATRIX_ROWS; row++) {
            const py = Math.floor(row * stepY);
            const rowOffset = py * PROC_W;
            const renderY = oy + (row + 0.5) * cellH;

            for (let col = 0; col < MATRIX_COLS; col++) {
              const px = Math.floor(col * stepX);
              const gray = buf32[rowOffset + px] & 0xff;
              const isSilhouette = isBgWhite ? gray <= 140 : gray >= 115;

              if (isSilhouette) {
                const renderX = ox + (col + 0.5) * cellW;
                const ch = this.blogChars[charIdx % textLen];
                charIdx++;
                this.projCtx.fillText(ch, renderX, renderY);
              }
            }
          }
        }

        // 350ms expanding shockwave pulse ring
        if (this.shockwaveStartTime && timestamp - this.shockwaveStartTime < 350) {
          const swProg = (timestamp - this.shockwaveStartTime) / 350;
          const swAlpha = (1 - swProg) * 0.45;
          const swRadius = Math.min(vw, vh) * (0.28 + 0.32 * swProg);
          this.projCtx.save();
          this.projCtx.strokeStyle = `rgba(255, 255, 255, ${swAlpha})`;
          this.projCtx.lineWidth = Math.max(3 * (1 - swProg), 1);
          this.projCtx.beginPath();
          this.projCtx.arc(vw / 2, vh / 2, swRadius, 0, Math.PI * 2);
          this.projCtx.stroke();
          this.projCtx.restore();
        }
      } catch (err: any) {
        if (!this.corsErrorNotified) {
          this.corsErrorNotified = true;
          console.error(
            '[BadApple] CORS SecurityError: Failed to execute getImageData on canvas. ' +
              'If using a cross-origin video, ensure the server returns "Access-Control-Allow-Origin: *". ' +
              'Details:',
            err
          );
          this.options.onPlayError?.(err);
        }
      }
    }

    this.animFrameId = requestAnimationFrame(this.renderLoop);
  };
}
