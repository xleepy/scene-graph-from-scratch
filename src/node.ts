import { Matrix4 } from "./matrix";
import { Vector3 } from "./types";

export class Node {
  private readonly children: Node[] = [];
  private parent: Node | null = null;
  private _position: Vector3 = [0, 0, 0];
  private _rotation: Vector3 = [0, 0, 0];
  private _scale: Vector3 = [1, 1, 1];
  private _worldMatrix: Matrix4 = Matrix4.create();
  private _localMatrix: Matrix4 = Matrix4.create();
  public dirty: boolean = true;

  constructor(public readonly name: string) {}

  public add(child: Node): void {
    this.children.push(child);
    child.setParent(this);
  }

  private makeDirty(): void {
    if (!this.dirty) {
      this.dirty = true;
      for (const child of this.children) {
        child.makeDirty();
      }
    }
  }

  public get worldMatrix(): Matrix4 {
    return this._worldMatrix;
  }

  public get localMatrix(): Matrix4 {
    return this._localMatrix;
  }

  public set localMatrix(m: Matrix4) {
    this._localMatrix = m;
    this.makeDirty();
  }

  public set worldMatrix(m: Matrix4) {
    this._worldMatrix = m;
    this.makeDirty();
  }

  public get position(): Vector3 {
    return this._position;
  }

  public set position(pos: Vector3) {
    this._position = pos;
    this.makeDirty();
  }

  public get rotation(): Vector3 {
    return this._rotation;
  }

  public set rotation(rot: Vector3) {
    this._rotation = rot;
    this.makeDirty();
  }

  public get scale(): Vector3 {
    return this._scale;
  }

  public set scale(s: Vector3) {
    this._scale = s;
    this.makeDirty();
  }

  setParent(parent: Node): void {
    this.parent = parent;
  }

  updateWorldMatrix(): void {
    if (this.dirty) {
      const translation = Matrix4.makeTranslation(...this.position);
      const [x, y, z] = this.rotation;
      const rotationX = Matrix4.rotationX(x);
      const rotationY = Matrix4.rotationY(y);
      const rotationZ = Matrix4.rotationZ(z);
      const scale = Matrix4.makeScale(...this.scale);

      this._localMatrix = translation
        .multiply(rotationX)
        .multiply(rotationY)
        .multiply(rotationZ)
        .multiply(scale);

      if (this.parent) {
        this.worldMatrix = this.parent.worldMatrix.multiply(this.localMatrix);
      } else {
        this.worldMatrix = this.localMatrix;
      }
    }
    this.dirty = false;
    for (const child of this.children) {
      child.updateWorldMatrix();
    }
  }

  toString(): string {
    return JSON.stringify(
      {
        name: this.name,
        position: this.position,
        rotation: this.rotation,
        scale: this.scale,
        children: this.children.map((child) => child.toString()),
      },
      null,
      2,
    );
  }
}
