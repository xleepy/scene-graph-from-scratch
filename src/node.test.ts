import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Node } from './node';

const EPSILON = 1e-6;
const near = (a: number, b: number) => Math.abs(a - b) < EPSILON;

// Phase 4 — verify dirty flag + world matrix propagation once you implement them
describe('Node dirty flag', () => {
  it('is true on a newly created node', () => {
    const n = new Node('test');
    assert.equal(n.dirty, true);
  });

  it('is cleared to false after updateWorldMatrix()', () => {
    const n = new Node('test');
    n.updateWorldMatrix();
    assert.equal(n.dirty, false);
  });

  it('is set back to true when position is changed', () => {
    const n = new Node('test');
    n.updateWorldMatrix();
    n.position = [1, 0, 0];
    assert.equal(n.dirty, true);
  });

  it('is set back to true when scale is changed', () => {
    const n = new Node('test');
    n.updateWorldMatrix();
    n.scale = [2, 2, 2];
    assert.equal(n.dirty, true);
  });

  it('is set back to true when rotation is changed', () => {
    const n = new Node('test');
    n.updateWorldMatrix();
    n.rotation = [0, Math.PI / 2, 0];
    assert.equal(n.dirty, true);
  });
});

describe('Node.updateWorldMatrix() — root node', () => {
  it('world position is [0,0,0] when position is not set', () => {
    const root = new Node('root');
    root.updateWorldMatrix();
    assert.ok(near(root.worldMatrix.elements[12], 0), 'x');
    assert.ok(near(root.worldMatrix.elements[13], 0), 'y');
    assert.ok(near(root.worldMatrix.elements[14], 0), 'z');
  });

  it('world position matches local position for the root', () => {
    const root = new Node('root');
    root.position = [5, 3, 0];
    root.updateWorldMatrix();
    assert.ok(near(root.worldMatrix.elements[12], 5), `x: expected 5, got ${root.worldMatrix.elements[12]}`);
    assert.ok(near(root.worldMatrix.elements[13], 3), `y: expected 3, got ${root.worldMatrix.elements[13]}`);
  });
});

describe('Node.updateWorldMatrix() — parent → child propagation', () => {
  it('child world position = parent position + child local position', () => {
    const root = new Node('root');
    root.position = [10, 0, 0];

    const child = new Node('child');
    child.position = [5, 0, 0];
    root.add(child);

    root.updateWorldMatrix();

    assert.ok(
      near(child.worldMatrix.elements[12], 15),
      `expected 15, got ${child.worldMatrix.elements[12]}`
    );
  });

  it('child at origin inherits parent world position exactly', () => {
    const root = new Node('root');
    root.position = [7, 2, 0];

    const child = new Node('child'); // position stays [0,0,0]
    root.add(child);

    root.updateWorldMatrix();

    assert.ok(near(child.worldMatrix.elements[12], 7), `x: expected 7, got ${child.worldMatrix.elements[12]}`);
    assert.ok(near(child.worldMatrix.elements[13], 2), `y: expected 2, got ${child.worldMatrix.elements[13]}`);
  });

  it('grandchild accumulates all ancestor positions', () => {
    const root = new Node('root');
    root.position = [1, 0, 0];

    const child = new Node('child');
    child.position = [2, 0, 0];
    root.add(child);

    const grandchild = new Node('grandchild');
    grandchild.position = [3, 0, 0];
    child.add(grandchild);

    root.updateWorldMatrix();

    assert.ok(
      near(grandchild.worldMatrix.elements[12], 6),
      `expected 6 (1+2+3), got ${grandchild.worldMatrix.elements[12]}`
    );
  });

  it('moving the parent shifts the child world position by the same amount', () => {
    const root = new Node('root');
    const child = new Node('child');
    child.position = [2, 0, 0];
    root.add(child);

    root.position = [0, 0, 0];
    root.updateWorldMatrix();
    const before = child.worldMatrix.elements[12];

    root.position = [10, 0, 0];
    root.updateWorldMatrix();
    const after = child.worldMatrix.elements[12];

    assert.ok(near(after - before, 10), `expected shift of 10, got ${after - before}`);
  });
});
