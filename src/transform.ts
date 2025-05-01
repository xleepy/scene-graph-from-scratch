import { Matrix4 } from "./matrix";
export class Transform {
  public position: [number, number, number] = [0, 0, 0];
  public rotation: [number, number, number] = [0, 0, 0];
  public scale: [number, number, number] = [1, 1, 1];
  public modelMatrix: Matrix4 = Matrix4.create();
}
