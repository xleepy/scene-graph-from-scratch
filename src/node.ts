import { Vector3 } from "./types";

export class Node {
  private readonly children: Node[] = [];
  private parent: Node | null = null;
  private position: Vector3 = [0, 0, 0];
  private rotation: Vector3 = [0, 0, 0];
  private scale: Vector3 = [1, 1, 1];

  constructor(public readonly name: string) {}

  public add(child: Node): void {
    this.children.push(child);
    child.setParent(this);
  }

  setParent(parent: Node): void {
    this.parent = parent;
  }
}
