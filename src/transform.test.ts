import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Transform } from "./transform";

const EPSILON = 1e-6;
const near = (a: number, b: number) => Math.abs(a - b) < EPSILON;

// Phase 3 — verify Transform.updateMatrix() once you implement it
describe("Transform.updateMatrix()", () => {
  it("default transform (no changes) produces the identity matrix", () => {
    const t = new Transform();
    t.updateMatrix();
    assert.ok(near(t.modelMatrix.elements[0], 1), "elements[0]");
    assert.ok(near(t.modelMatrix.elements[5], 1), "elements[5]");
    assert.ok(near(t.modelMatrix.elements[10], 1), "elements[10]");
    assert.ok(near(t.modelMatrix.elements[15], 1), "elements[15]");
    assert.ok(near(t.modelMatrix.elements[12], 0), "tx should be 0");
    assert.ok(near(t.modelMatrix.elements[13], 0), "ty should be 0");
    assert.ok(near(t.modelMatrix.elements[14], 0), "tz should be 0");
  });

  it("position [3, 0, 0] → elements[12] = 3", () => {
    const t = new Transform();
    t.position = [3, 0, 0];
    t.updateMatrix();
    assert.ok(
      near(t.modelMatrix.elements[12], 3),
      `expected 3, got ${t.modelMatrix.elements[12]}`,
    );
  });

  it("position [0, 7, 0] → elements[13] = 7", () => {
    const t = new Transform();
    t.position = [0, 7, 0];
    t.updateMatrix();
    assert.ok(
      near(t.modelMatrix.elements[13], 7),
      `expected 7, got ${t.modelMatrix.elements[13]}`,
    );
  });

  it("scale [2, 1, 1] → elements[0] = 2, other diagonal unchanged", () => {
    const t = new Transform();
    t.scale = [2, 1, 1];
    t.updateMatrix();
    assert.ok(
      near(t.modelMatrix.elements[0], 2),
      `sx: expected 2, got ${t.modelMatrix.elements[0]}`,
    );
    assert.ok(near(t.modelMatrix.elements[5], 1), "sy should be 1");
    assert.ok(near(t.modelMatrix.elements[10], 1), "sz should be 1");
  });

  it("translation + scale are both reflected in the matrix", () => {
    const t = new Transform();
    t.position = [5, 0, 0];
    t.scale = [3, 1, 1];
    t.updateMatrix();
    console.log(t.modelMatrix.toString());
    assert.ok(
      near(t.modelMatrix.elements[0], 3),
      `sx: expected 3, got ${t.modelMatrix.elements[0]}`,
    );
    assert.ok(
      near(t.modelMatrix.elements[12], 5),
      `tx: expected 5, got ${t.modelMatrix.elements[12]}`,
    );
  });

  it("calling updateMatrix() twice with the same values gives the same result", () => {
    const t = new Transform();
    t.position = [1, 2, 3];
    t.updateMatrix();
    const first = Array.from(t.modelMatrix.elements);
    t.updateMatrix();
    const second = Array.from(t.modelMatrix.elements);
    assert.deepEqual(first, second);
  });
});
