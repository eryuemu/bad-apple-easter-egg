import { Particle } from '../types';
import { Point } from './bitmask';

export const DEFAULT_TEXT_SELECTOR =
  '.site-header nav a, .hero-title, .hero-author-name, .hero-motto, .hero-desc, .hero-links a, .section-title, .tab-btn, .post-item a, .grid-card-item h3, .grid-card-item p, main, article, h1, h2, h3, h4, p, a, code, span, li';

export const DEFAULT_FALLBACK_CORPUS =
  '流れてく時の中ででも気だるさがほらグルグル廻って私から離れる心も見えないわそう知らない自分から動き出せば変わるの全部変えれば黒くなるの二月木自动化圆融自洽赛博洁癖衡水模式洛天依风暴星文章开发随笔BadApple东方幻想乡博丽灵梦雾雨魔理沙';

/**
 * Extracts clean textual characters from the current page.
 */
export function extractPageText(
  selector: string = DEFAULT_TEXT_SELECTOR,
  fallbackCorpus: string = DEFAULT_FALLBACK_CORPUS
): string {
  if (typeof document === 'undefined') return fallbackCorpus;

  try {
    const selectedEl = selector ? document.querySelector(selector) : null;
    const mainEl = selectedEl || document.querySelector('main') || document.querySelector('article') || document.body;
    const raw = (mainEl ? (mainEl as HTMLElement).innerText : '') || document.body.innerText || '';
    const clean = raw
      .replace(/[\s\r\n\t#*`_>[\]()\-+!]+/g, '')
      .replace(/[^\u4e00-\u9fa5\u3040-\u30ff\u3400-\u4dbfa-zA-Z0-9]/g, '');

    if (clean.length >= 20) {
      return clean;
    }
  } catch (e) {
    // ignore
  }

  return fallbackCorpus;
}

/**
 * Gathers visible DOM text positions across the viewport and calculates fluid vortex Bezier control points
 * converging smoothly onto target coordinates.
 */
export function gatherPageTextParticles(
  vw: number,
  vh: number,
  targets: Point[],
  selector: string = DEFAULT_TEXT_SELECTOR,
  textCorpus?: string
): Particle[] {
  const particles: Particle[] = [];
  const textNodes: { char: string; x: number; y: number }[] = [];

  if (typeof document !== 'undefined') {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.top < vh &&
          rect.bottom > 0 &&
          rect.left < vw &&
          rect.right > 0
        ) {
          const str = (el as HTMLElement).innerText?.trim() || '';
          if (str.length > 0 && str.length < 500) {
            const clean = str.replace(/[\s\r\n\t]+/g, '');
            const step = rect.width / Math.max(clean.length, 1);
            for (let i = 0; i < clean.length; i++) {
              textNodes.push({
                char: clean[i],
                x: rect.left + i * step + 4,
                y: rect.top + rect.height / 2,
              });
            }
          }
        }
      });
    } catch (e) {
      // fallback
    }
  }

  const corpus = textCorpus || extractPageText(selector);
  const totalTargets = targets.length;

  for (let i = 0; i < totalTargets; i++) {
    const target = targets[i];
    // 1:1 character index lock ensures 0 character popping during transition
    const char = corpus[i % corpus.length];
    let startX = 0;
    let startY = 0;

    if (i < textNodes.length) {
      startX = textNodes[i].x;
      startY = textNodes[i].y;
    } else if (textNodes.length > 0) {
      const source = textNodes[i % textNodes.length];
      startX = source.x + (Math.random() - 0.5) * 20;
      startY = source.y + (Math.random() - 0.5) * 10;
    } else {
      startX = Math.random() * vw;
      startY = Math.random() * vh;
    }

    // Dynamic fluid vortex angle & distance
    const dx = target.x - startX;
    const dy = target.y - startY;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) + (startX < vw / 2 ? 0.72 : -0.72);
    const swirlDist = dist * 0.55 + 35;

    const cp1X = startX + Math.cos(angle) * swirlDist;
    const cp1Y = startY + Math.sin(angle) * swirlDist;
    const cp2X = target.x - Math.cos(angle * 0.8) * (swirlDist * 0.45);
    const cp2Y = target.y - Math.sin(angle * 0.8) * (swirlDist * 0.45);

    particles.push({
      char,
      startX,
      startY,
      targetX: target.x,
      targetY: target.y,
      cp1X,
      cp1Y,
      cp2X,
      cp2Y,
      delay: Math.random() * 0.1, // Staggered arrival wave
    });
  }

  return particles;
}
