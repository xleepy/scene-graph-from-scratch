import { Node } from "./node";
import { Renderer } from "./renderer";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const root = new Node("root");
const child1 = new Node("child1");

root.add(child1);
root.position = [200, 200, 0];
child1.position = [100, 0, 0];

root.updateWorldMatrix();

const renderer = new Renderer();
renderer.render(root, ctx);
