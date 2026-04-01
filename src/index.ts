import { Matrix4 } from "./matrix";
import { Node } from "./node";
const root = new Node("root");
const child1 = new Node("child1");

const matrixA = Matrix4.create();

root.add(child1);

console.log(root.toString());

console.log("matrixA:", matrixA.toString());
