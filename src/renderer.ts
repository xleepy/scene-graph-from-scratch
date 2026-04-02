import { Node } from "./node";

export class Renderer {
  render(root: Node, ctx: CanvasRenderingContext2D) {
    root.getChildren().forEach((child) => {
      const m = child.worldMatrix.elements;
      ctx.save();
      ctx.transform(m[0], m[1], m[4], m[5], m[12], m[13]);
      ctx.fillRect(-10, -10, 20, 20);
      this.render(child, ctx);
      ctx.restore();
    });
  }
}
