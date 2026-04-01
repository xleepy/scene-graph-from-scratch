import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Matrix4 } from "./matrix";

const EPSILON = 1e-6;
const near = (a: number, b: number) => Math.abs(a - b) < EPSILON;

// Phase 2 — verify existing code
describe("Matrix4.create()", () => {
  it("has 1s on the diagonal (indices 0, 5, 10, 15)", () => {
    const m = Matrix4.create();
    assert.equal(m.elements[0], 1);
    assert.equal(m.elements[5], 1);
    assert.equal(m.elements[10], 1);
    assert.equal(m.elements[15], 1);
  });

  it("has 0s on every off-diagonal index", () => {
    const m = Matrix4.create();
    const diag = new Set([0, 5, 10, 15]);
    for (let i = 0; i < 16; i++) {
      if (!diag.has(i))
        assert.equal(m.elements[i], 0, `index ${i} should be 0`);
    }
  });
});

describe("Matrix4.multiply()", () => {
  it("identity × identity = identity", () => {
    const result = Matrix4.create().multiply(Matrix4.create());
    const id = Matrix4.create();
    for (let i = 0; i < 16; i++) {
      assert.ok(near(result.elements[i], id.elements[i]), `index ${i}`);
    }
  });
});

// Phase 3 — verify code you implement
describe("Matrix4.makeTranslation()", () => {
  it("stores tx, ty, tz at indices 12, 13, 14 (row-vector convention)", () => {
    const m = Matrix4.makeTranslation(3, 5, 7);
    assert.equal(m.elements[12], 3);
    assert.equal(m.elements[13], 5);
    assert.equal(m.elements[14], 7);
  });

  it("diagonal stays at 1", () => {
    const m = Matrix4.makeTranslation(3, 5, 7);
    assert.equal(m.elements[0], 1);
    assert.equal(m.elements[5], 1);
    assert.equal(m.elements[10], 1);
    assert.equal(m.elements[15], 1);
  });

  it("T(1,0,0).multiply(T(2,0,0)) = T(3,0,0)  — translations add when composed", () => {
    const combined = Matrix4.makeTranslation(1, 0, 0).multiply(
      Matrix4.makeTranslation(2, 0, 0),
    );
    assert.ok(
      near(combined.elements[12], 3),
      `expected 3, got ${combined.elements[12]}`,
    );
  });
});

describe("Matrix4.makeScale()", () => {
  it("places sx, sy, sz on the diagonal at indices 0, 5, 10", () => {
    const m = Matrix4.makeScale(2, 3, 4);
    assert.equal(m.elements[0], 2);
    assert.equal(m.elements[5], 3);
    assert.equal(m.elements[10], 4);
    assert.equal(m.elements[15], 1);
  });

  it("has 0s on all off-diagonal entries", () => {
    const m = Matrix4.makeScale(2, 3, 4);
    const diag = new Set([0, 5, 10, 15]);
    for (let i = 0; i < 16; i++) {
      if (!diag.has(i))
        assert.equal(m.elements[i], 0, `index ${i} should be 0`);
    }
  });
});

describe("Matrix4.rotationX()", () => {
  it("rotationX(0) equals identity", () => {
    const m = Matrix4.rotationX(0);
    const id = Matrix4.create();
    for (let i = 0; i < 16; i++) {
      assert.ok(
        near(m.elements[i], id.elements[i]),
        `index ${i}: expected ${id.elements[i]}, got ${m.elements[i]}`,
      );
    }
  });

  it("rotationX(π/2): x-axis unchanged — elements[0] = 1", () => {
    const m = Matrix4.rotationX(Math.PI / 2);
    assert.ok(near(m.elements[0], 1));
  });

  it("rotationX(π/2): cos(π/2)≈0 appears at elements[5] and elements[10]", () => {
    const m = Matrix4.rotationX(Math.PI / 2);
    assert.ok(
      near(m.elements[5], 0),
      `elements[5] should be ≈0, got ${m.elements[5]}`,
    );
    assert.ok(
      near(m.elements[10], 0),
      `elements[10] should be ≈0, got ${m.elements[10]}`,
    );
  });

  it("rotationX(π/2): sin(π/2)≈1 appears at either elements[6] or elements[9]", () => {
    const m = Matrix4.rotationX(Math.PI / 2);
    const hasSin =
      near(Math.abs(m.elements[6]), 1) || near(Math.abs(m.elements[9]), 1);
    assert.ok(hasSin, "expected sin(π/2)=1 at index 6 or 9");
  });
});

describe("Matrix4.rotationY()", () => {
  it("rotationY(0) equals identity", () => {
    const m = Matrix4.rotationY(0);
    const id = Matrix4.create();
    for (let i = 0; i < 16; i++) {
      assert.ok(near(m.elements[i], id.elements[i]), `index ${i}`);
    }
  });
});

describe("Matrix4.rotationZ()", () => {
  it("rotationZ(0) equals identity", () => {
    const m = Matrix4.rotationZ(0);
    const id = Matrix4.create();
    for (let i = 0; i < 16; i++) {
      assert.ok(near(m.elements[i], id.elements[i]), `index ${i}`);
    }
  });
});
