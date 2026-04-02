import { Matrix4 } from "./matrix";
export class Transform {
  public position: [number, number, number] = [0, 0, 0];
  public rotation: [number, number, number] = [0, 0, 0];
  public scale: [number, number, number] = [1, 1, 1];
  public modelMatrix: Matrix4 = Matrix4.create();

  // Collapses position, rotation, and scale into a single 4×4 matrix.
  // Downstream code (Node, renderer) only needs to deal with one matrix per object
  // rather than three separate transforms.
  public updateMatrix() {
    const translation = Matrix4.makeTranslation(...this.position); // [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1]
    const rotationX = Matrix4.rotationX(this.rotation[0]); // [1, 0, 0, 0, 0, cx, -sx, 0, 0, sx, cx, 0, 0, 0, 0, 1]
    const rotationY = Matrix4.rotationY(this.rotation[1]); // [cy, 0, sy, 0, 0, 1, 0, 0, -sy, 0, cy, 0, 0, 0, 0, 1]
    const rotationZ = Matrix4.rotationZ(this.rotation[2]); // [cz, -sz, 0, 0, sz, cz, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    const scale = Matrix4.makeScale(...this.scale); // [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1]

    // Row-vector convention (v * M): leftmost matrix is applied first.
    // Desired order: scale → rotate → translate, so S is leftmost.
    this.modelMatrix = scale
      .multiply(rotationX)
      .multiply(rotationY)
      .multiply(rotationZ)
      .multiply(translation);
  }
}
