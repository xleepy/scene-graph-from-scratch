import { Matrix4 } from "./matrix";
import { Node } from "./node";
const root = new Node("root");
const child1 = new Node("child1");

const matrixA = Matrix4.create();

root.add(child1);

root.updateWorldMatrix();

root.position = [1, 2, 3];
root.rotation = [Math.PI / 4, 0, 0];
root.scale = [2, 2, 2];

root.updateWorldMatrix();

console.log(root.toString());

console.log("matrixA:", matrixA.toString());
