export const MATRIX_COLS = 88;
export const MATRIX_ROWS = 35;
export const PROC_W = 480;
export const PROC_H = 360;

/**
 * 88x35 Reimu Hakurei aperture silhouette bitmask (1427 character points)
 */
export const REIMU_BITMASK_B64 =
  'AAAAB//////+AAAAAAAAP/////4AAAAAAAA//////gAAAAAAAB/////+AAAAAAAAP/////wAAAAAAAA/////+AAAAAAAAB/////4AAAAAAAAB/////wAAAAAAAAD/////AAAAAAAAAH////8AAAAAAAAAf////4AAAAAAAAB/////gAAAAAAAAH////+AAAAAAAAA/////wAAAAAAAAB////+AAAAAAAAA/////4AAAAAAAAP/////wAAAAAAAB//////wAAAAAAAP//////gAAAAAAA//////+AAAAAAAD//////4AAAAAAAP//////gAAAAAAP//////+AAAAAAB///////8AAAAAAH////////AAAAAAP///////+AAAAAAf///////wAAAAAD///////+AAAAAAP/////3/4AAAAAB/////+f/gAAAAAP/////x/+AAAAAB//////H/8AAAAAP/////8//wAAAAA//////z//AAAAAH//////P/+AA==';

export interface Point {
  x: number;
  y: number;
}

/**
 * Decodes the base64 bitmask into normalized viewport coordinates
 * maintaining the standard 4:3 video aspect ratio and centering on screen.
 */
export function decodeTargetPoints(vw: number, vh: number): Point[] {
  let raw: string;
  if (typeof atob === 'function') {
    raw = atob(REIMU_BITMASK_B64);
  } else if (typeof (globalThis as any).Buffer !== 'undefined') {
    raw = (globalThis as any).Buffer.from(REIMU_BITMASK_B64, 'base64').toString('binary');
  } else {
    return [];
  }

  const bits: number[] = [];
  for (let i = 0; i < raw.length; i++) {
    const b = raw.charCodeAt(i);
    for (let bit = 7; bit >= 0; bit--) {
      bits.push((b >> bit) & 1);
    }
  }

  const points: Point[] = [];
  const aspect = PROC_W / PROC_H;
  let dw = vw;
  let dh = vw / aspect;
  if (dh > vh) {
    dh = vh;
    dw = vh * aspect;
  }
  const ox = (vw - dw) / 2;
  const oy = (vh - dh) / 2;

  const cellW = dw / MATRIX_COLS;
  const cellH = dh / MATRIX_ROWS;

  for (let r = 0; r < MATRIX_ROWS; r++) {
    for (let c = 0; c < MATRIX_COLS; c++) {
      if (bits[r * MATRIX_COLS + c]) {
        const px = ox + (c + 0.5) * cellW;
        const py = oy + (r + 0.5) * cellH;
        points.push({ x: px, y: py });
      }
    }
  }
  return points;
}
