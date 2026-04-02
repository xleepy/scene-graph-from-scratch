import { Matrix4 as Matrix4Type } from "./types";
export class Matrix4 {
  public readonly elements: Float32Array;

  constructor(init: Matrix4Type) {
    this.elements = new Float32Array(init);
  }

  // Produces the identity matrix — the "do nothing" transform.
  // Every other matrix is built by starting from this and changing specific slots.
  static create() {
    return new Matrix4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }

  // Combines two transforms into one matrix so the GPU only needs a single multiply per vertex.
  // Uses row-major storage: result[i][j] = sum_k(a[i][k] * b[k][j]).
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

  // Moves a point by (x, y, z). Translation can't be expressed in a 3×3 matrix,
  // so it lives in the last row (row-vector convention: v * M).
  public static makeTranslation(x: number, y: number, z: number): Matrix4 {
    return new Matrix4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
  }

  // Stretches or shrinks along each axis independently.
  // Scale values sit on the diagonal; off-diagonal entries stay zero so axes don't mix.
  public static makeScale(sx: number, sy: number, sz: number): Matrix4 {
    return new Matrix4([sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1]);
  }

  // Rotates around the x-axis by the given angle in radians.
  // X is unchanged; Y and Z are mixed using the 2D rotation pattern (cos/sin in the YZ plane).
  public static rotationX(angle: number): Matrix4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Matrix4([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]);
  }

  // Rotates around the y-axis by the given angle in radians.
  // Y is unchanged; X and Z are mixed. The sign of s flips compared to rotationX
  // because the XZ plane has the opposite handedness from YZ.
  public static rotationY(angle: number): Matrix4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Matrix4([c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1]);
  }

  // Rotates around the z-axis by the given angle in radians.
  // Z is unchanged; X and Y are mixed using the 2D rotation pattern in the XY plane.
  public static rotationZ(angle: number): Matrix4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Matrix4([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }

  public toString(): string {
    return JSON.stringify(Array.from(this.elements));
  }
}
