import { Matrix4 as Matrix4Type } from "./types";
export class Matrix4 {
  public readonly elements: Float32Array;

  constructor(init: Matrix4Type) {
    this.elements = new Float32Array(init);
  }

  static create() {
    return new Matrix4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }

  public multiply(m: Matrix4) {
    const a = this.elements;
    const b = m.elements;
    const result = new Array<number>(16);

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i * 4 + j] =
          a[i * 4] * b[j] +
          a[i * 4 + 1] * b[j + 4] +
          a[i * 4 + 2] * b[j + 8] +
          a[i * 4 + 3] * b[j + 12];
      }
    }

    return new Matrix4(result as Matrix4Type);
  }

  public static makeTranslation(x: number, y: number, z: number): Matrix4 {
    return new Matrix4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
  }

  public static makeScale(sx: number, sy: number, sz: number): Matrix4 {
    return new Matrix4([sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1]);
  }

  // Rotation around the x-axis by the given angle in radians.
  public static rotationX(angle: number): Matrix4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Matrix4([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]);
  }

  // Rotation around the y-axis by the given angle in radians.
  public static rotationY(angle: number): Matrix4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Matrix4([c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1]);
  }

  public static rotationZ(angle: number): Matrix4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Matrix4([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }

  public toString(): string {
    return JSON.stringify(Array.from(this.elements));
  }
}
