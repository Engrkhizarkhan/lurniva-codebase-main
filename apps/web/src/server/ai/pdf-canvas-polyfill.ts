/**
 * pdfjs-dist's Node build unconditionally constructs a `DOMMatrix` at module
 * load time (independent of whether a document is ever rendered), normally
 * polyfilled from the native `@napi-rs/canvas` package. That native binary
 * isn't reliably deployable to Vercel's serverless function bundle, so we
 * provide a minimal, dependency-free polyfill instead. We only ever call
 * pdf-parse's text-extraction APIs (never page rendering), so `ImageData`
 * and `Path2D` just need to exist, not behave correctly.
 *
 * Call `ensurePdfCanvasPolyfills()` synchronously right before dynamically
 * importing "pdf-parse" — a static import gets bundled ahead of a plain
 * side-effect import regardless of source order (Rollup hoists real ESM
 * imports of external packages to the top of the chunk), so a top-level
 * `import "./pdf-canvas-polyfill"` placed before `import "pdf-parse"` does
 * NOT guarantee this code runs first.
 */

class DOMMatrixPolyfill {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;

  constructor(init?: number[]) {
    const m = init?.length === 6 ? init : [1, 0, 0, 1, 0, 0];
    this.a = m[0] ?? 1;
    this.b = m[1] ?? 0;
    this.c = m[2] ?? 0;
    this.d = m[3] ?? 1;
    this.e = m[4] ?? 0;
    this.f = m[5] ?? 0;
  }

  multiply(other: DOMMatrixPolyfill): DOMMatrixPolyfill {
    return new DOMMatrixPolyfill([
      this.a * other.a + this.c * other.b,
      this.b * other.a + this.d * other.b,
      this.a * other.c + this.c * other.d,
      this.b * other.c + this.d * other.d,
      this.a * other.e + this.c * other.f + this.e,
      this.b * other.e + this.d * other.f + this.f,
    ]);
  }

  multiplySelf(other: DOMMatrixPolyfill): this {
    const result = this.multiply(other);
    [this.a, this.b, this.c, this.d, this.e, this.f] =
      [result.a, result.b, result.c, result.d, result.e, result.f];
    return this;
  }

  preMultiplySelf(other: DOMMatrixPolyfill): this {
    const result = other.multiply(this);
    [this.a, this.b, this.c, this.d, this.e, this.f] =
      [result.a, result.b, result.c, result.d, result.e, result.f];
    return this;
  }

  translate(tx: number, ty: number): DOMMatrixPolyfill {
    return this.multiply(new DOMMatrixPolyfill([1, 0, 0, 1, tx, ty]));
  }

  scale(sx: number, sy: number = sx): DOMMatrixPolyfill {
    return this.multiply(new DOMMatrixPolyfill([sx, 0, 0, sy, 0, 0]));
  }

  invertSelf(): this {
    const det = this.a * this.d - this.b * this.c;
    if (det === 0) {
      [this.a, this.b, this.c, this.d, this.e, this.f] = [NaN, NaN, NaN, NaN, NaN, NaN];
      return this;
    }
    const { a, b, c, d, e, f } = this;
    this.a = d / det;
    this.b = -b / det;
    this.c = -c / det;
    this.d = a / det;
    this.e = (c * f - d * e) / det;
    this.f = (b * e - a * f) / det;
    return this;
  }
}

class ImageDataPolyfill {
  data: Uint8ClampedArray;
  width: number;
  height: number;

  constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
    if (typeof dataOrWidth === "number") {
      this.width = dataOrWidth;
      this.height = widthOrHeight;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    } else {
      this.data = dataOrWidth;
      this.width = widthOrHeight;
      this.height = height ?? 0;
    }
  }
}

class Path2DPolyfill {
  addPath(): void {}
  moveTo(): void {}
  lineTo(): void {}
  bezierCurveTo(): void {}
  closePath(): void {}
  rect(): void {}
  ellipse(): void {}
}

export function ensurePdfCanvasPolyfills(): void {
  const target = globalThis as Record<string, unknown>;
  target.DOMMatrix ??= DOMMatrixPolyfill;
  target.ImageData ??= ImageDataPolyfill;
  target.Path2D ??= Path2DPolyfill;
}
