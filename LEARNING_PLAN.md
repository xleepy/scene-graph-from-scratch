# Scene Graph Learning Plan

This plan follows the code already in this repo and builds on it step by step.
Reference article: <https://learnopengl.com/Guest-Articles/2021/Scene/Scene-Graph>

---

## Phase 1 — Core Concepts (understand the theory)

**Goal:** Know what a scene graph is and why it exists.

**Todos**

- [x] Read the LearnOpenGL scene graph article (linked in README) — _establishes the mental model everything else builds on_
- [x] Draw a scene graph tree on paper: root → car body → 4 wheel nodes — _makes the parent-child relationship concrete before touching code_
- [x] Open [src/node.ts](src/node.ts) and trace how `add()` links parent ↔ child — _shows how the tree is actually wired in memory_
- [x] Explain to yourself in one sentence what "local space" vs "world space" means — _this distinction is why the whole system exists; get it wrong and nothing renders in the right place_
- [x] Write down the rule: _world transform = parent world matrix × node local matrix_ — _this single equation drives all of Phase 3 and 4_

**Concepts**

1. **Tree structure basics**
   - A scene graph is a tree of `Node` objects.
   - Each node has zero or one parent and zero or many children.
   - The root node has no parent; it represents "the world".
   - Already in the repo: [src/node.ts](src/node.ts) — `Node` holds `children[]` and `parent`.

2. **Why a hierarchy?**
   - Transforms propagate down the tree: moving a parent moves all its children.
   - Example: a car body node has wheel nodes as children — rotating the car rotates all wheels automatically.

3. **Local vs. world space**
   - _Local space_: transform relative to the parent.
   - _World space_: transform relative to the root (the final position on screen).
   - World transform = parent's world matrix × node's local matrix.

---

## Phase 2 — Math Foundations (understand the building blocks)

**Goal:** Read and reason about the matrix code without confusion.

**Todos**

- [x] Open [src/types.ts](src/types.ts) — write out a `Vector3` and `Matrix4` by hand — _seeing the flat 16-number layout demystifies how matrix data is stored_
- [x] Verify `Matrix4.create()` in [src/matrix.ts](src/matrix.ts) produces the identity matrix (1s on diagonal, 0s elsewhere) — _the identity is the "do nothing" transform; all other matrices are deviations from it_
- [x] Read `Matrix4.multiply()` at [src/matrix.ts:13](src/matrix.ts#L13) and trace one multiplication step manually — _forces you to understand row vs column indexing, which you'll need when building TRS matrices_
- [x] Look up the difference between column-major and row-major matrix storage and decide which convention this repo uses — _the same 16 numbers mean different transforms depending on convention; getting this wrong silently produces wrong results_
- [x] Write down TRS order: Translation × Rotation × Scale — and why order matters — _matrix multiplication is not commutative; the wrong order produces shearing and other artifacts_
- [x] Open [src/transform.ts](src/transform.ts) — confirm it holds all three TRS fields plus `modelMatrix` — _this is the struct you'll be filling in Phase 3_

**Concepts**

1. **Vectors**
   - `Vector3 = [x, y, z]` — already in [src/types.ts](src/types.ts).
   - Represents a position, direction, or scale in 3D space.

2. **4×4 Transformation Matrix**
   - `Matrix4` — already in [src/types.ts](src/types.ts) and [src/matrix.ts](src/matrix.ts).
   - A single matrix can encode translation, rotation, and scale.
   - Stored in a flat 16-element `Float32Array` (column-major or row-major — pick one and stick to it).

3. **Matrix multiplication**
   - Combining two transforms = multiplying their matrices.
   - Already in [src/matrix.ts:13](src/matrix.ts#L13) — `Matrix4.multiply()`.
   - Order matters: `parent × child ≠ child × parent`.

4. **TRS decomposition**
   - A transform is built from three operations applied in order: **T**ranslation × **R**otation × **S**cale.
   - The `Transform` class in [src/transform.ts](src/transform.ts) holds all three plus the resulting `modelMatrix`.

**Exercise:** On paper, write out what the identity matrix looks like and verify `Matrix4.create()` produces it.

---

## Phase 3 — Completing the Transform Pipeline (write the missing code)

**Goal:** Make the `Transform` class compute a real local matrix from TRS values.

**Todos**

- [x] Add a `makeTranslation(x, y, z): Matrix4` static method to `Matrix4` — _translation can't be expressed in a 3×3 matrix; this is why we use 4×4 with a homogeneous coordinate_
- [x] Add a `makeScale(sx, sy, sz): Matrix4` static method to `Matrix4` — _scale sits on the diagonal; understanding this makes the TRS layout readable_
- [x] Add `rotationX(angle)`, `rotationY(angle)`, `rotationZ(angle)` static methods to `Matrix4` — _each axis rotation is just the 2D cos/sin pattern applied to the two axes that move; the third axis row/column is unchanged_
- [x] Add `updateMatrix()` to `Transform` that computes `modelMatrix = T × R × S` — _this collapses three separate matrices into one, so downstream code only has to deal with a single matrix per node_
- [x] Test `updateMatrix()` manually: set position `[1,0,0]`, call it, verify column 3 of the matrix is `[1,0,0,1]` — _a concrete check that your matrix layout and multiply order are correct before wiring it into the tree_
- [x] Add `worldMatrix: Matrix4` field to `Node` — _separating local vs world matrix is what lets you move a parent and have all children move "for free"_
- [x] In `Node`, compute `worldMatrix = parent.worldMatrix × localMatrix`; when no parent exists use `localMatrix` directly — _this is the one rule that makes the whole hierarchy work_

**Concepts**

1. **Build rotation matrices from Euler angles**
   - Euler angles (in `Node.rotation`) need to become a 4×4 rotation matrix.
   - Implement `rotationX(angle)`, `rotationY(angle)`, `rotationZ(angle)` helpers.
   - Combine them: `Rx × Ry × Rz`.

2. **Build the local model matrix**
   - `modelMatrix = T × R × S`
   - Add an `updateMatrix()` method to `Transform` that recomputes `modelMatrix` when TRS values change.

3. **Propagate world matrices down the tree**
   - Add `worldMatrix: Matrix4` to each `Node`.
   - On update, walk the tree top-down:

     ```
     node.worldMatrix = parent.worldMatrix × node.localMatrix
     ```

   - Root node's world matrix is its local matrix (no parent).

---

## Phase 4 — Traversal & Update Loop (wire everything together)

**Goal:** Implement tree traversal and a dirty-flag system.

**Todos**

- [x] Add a `dirty: boolean = true` flag to `Node` — _without this, every node recomputes its world matrix every frame even if nothing changed_
- [x] Set `dirty = true` in `Node` whenever `position`, `rotation`, or `scale` is changed (use setters) — _setters intercept assignment so the flag is never missed; also cascade `dirty` down to children since their world matrix depends on yours_
- [x] Implement `Node.updateWorldMatrix(parentWorldMatrix?: Matrix4)`:
  - [x] If dirty: recompute local matrix, set `dirty = false` — _only do the expensive TRS multiply when something actually changed_
  - [x] Multiply parent world matrix × local matrix → store as `worldMatrix` — _the parent's matrix must already be up to date, which is guaranteed by the top-down traversal order_
  - [x] Recurse into each child passing `this.worldMatrix` — _each child receives its parent's (now-correct) world matrix so it can compute its own_
- [x] Call `root.updateWorldMatrix()` in [src/index.ts](src/index.ts) and log the world matrix of `child1` — _the single entry point that triggers the whole tree update; call it once per frame before rendering_
- [x] Manually move `child1` position, call update again, verify world matrix changed — _confirms the dirty flag is being set and cleared correctly_

**Concepts**

1. **Depth-first traversal**
   - Visit the root, then recursively visit each child.
   - This is the standard way to update world matrices.

2. **Dirty flags (optimization)**
   - Only recompute a node's world matrix if it or any ancestor changed.
   - Add a `dirty: boolean` flag to `Node`; set it when TRS changes; clear it after recompute.

3. **Update pass**
   - Add `Node.updateWorldMatrix(parentWorldMatrix?)` that:
     - Recomputes local matrix if dirty.
     - Multiplies by parent's world matrix.
     - Recurses into children.

---

## Phase 5 — Rendering Integration (apply it to something visible)

**Goal:** Use world matrices to draw objects.

**Todos**

- [ ] Create `src/renderer.ts` with a `render(root: Node, ctx: CanvasRenderingContext2D)` function — _separating rendering from the scene graph keeps the tree logic reusable and testable without a GPU_
- [ ] In the render function, traverse the tree depth-first — _same traversal order as `updateWorldMatrix`; by this point all world matrices are already computed_
- [ ] For each node, extract the world position (columns 12–14 of the world matrix) and draw a rectangle on the canvas — _proves the matrices are correct with a visual check you can eyeball_
- [ ] Wire it up in `index.ts`: create a `<canvas>`, call `root.updateWorldMatrix()`, then `render(root, ctx)` — _update always before render; this is the frame loop pattern every real engine uses_
- [ ] Move `child1` to `[100, 50, 0]` and confirm it renders at a different position than the root — _validates that local position is being correctly transformed into world space_
- [ ] (Stretch) Set up a minimal WebGL context and pass `node.worldMatrix.elements` as `uniform mat4 uModel` — _the world matrix is exactly what the GPU expects as the model matrix in the MVP transform_

**Concepts**

1. **What the renderer needs**
   - For each renderable node, pass its `worldMatrix` to the GPU as the model matrix in the MVP transform: `MVP = Projection × View × Model`.

2. **Minimal canvas/WebGL demo**
   - Create a `<canvas>` and draw 2D rectangles using the world positions extracted from each node's world matrix.
   - This avoids full WebGL setup but proves the math works.

3. **Stretch goal — WebGL**
   - Pass `node.worldMatrix.elements` as a `uniform mat4 uModel` in a vertex shader.

---

## Phase 6 — Common Extensions (go deeper)

**Goal:** Explore how real engines build on the scene graph foundation.

**Todos**

- [ ] Add `visible: boolean = true` to `Node`; skip node and subtree in the render traversal when `false` — _skipping the subtree (not just the node) is important: hidden parent = hidden children_
- [ ] Add a `CameraNode` subclass whose view matrix = inverse of its world matrix — _the camera is just another node in the tree; inverting its world matrix transforms everything else into camera space_
- [ ] Sketch a `Component` interface and attach a `MeshComponent` to a node instead of hardcoding rendering in the node — _this is how Unity/Godot work: nodes are just transform containers, components add behaviour_
- [ ] Add an axis-aligned bounding box to each node that updates when `worldMatrix` changes — _AABBs in world space enable frustum culling: skip nodes the camera can't see_
- [ ] Try instancing: share one mesh but render it at multiple world positions from different nodes — _the world matrix is the only thing that differs per instance; the GPU draws them all in one draw call_

**Concepts**

| Feature          | Description                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| Camera node      | A node whose inverse world matrix becomes the view matrix                                           |
| Visibility flag  | `node.visible = false` skips the node and its subtree during render                                 |
| Component system | Attach a `MeshComponent`, `LightComponent`, etc. to nodes instead of baking rendering into the node |
| Bounding volumes | Axis-aligned bounding boxes (AABB) that update with world transform — used for frustum culling      |
| Instancing       | Reuse the same mesh data across many nodes with different world matrices                            |

---

## Suggested Reading Order

1. [LearnOpenGL — Scene Graph](https://learnopengl.com/Guest-Articles/2021/Scene/Scene-Graph) (linked in README)
2. [WebGL Fundamentals — Scene Graphs](https://webglfundamentals.org/webgl/lessons/webgl-scene-graph.html) — interactive diagrams
3. [3D Math Primer for Graphics and Game Development](https://gamemath.com/) — chapters on matrices and transforms

---

## Quick Reference: Files in This Repo

| File                                 | What it does now              | What it needs                                             |
| ------------------------------------ | ----------------------------- | --------------------------------------------------------- |
| [src/types.ts](src/types.ts)         | `Vector3`, `Matrix4` types    | Done                                                      |
| [src/matrix.ts](src/matrix.ts)       | Identity matrix + multiply    | Translation, rotation, scale factory methods              |
| [src/transform.ts](src/transform.ts) | Holds TRS + `modelMatrix`     | `updateMatrix()` that builds matrix from TRS              |
| [src/node.ts](src/node.ts)           | Parent-child tree + local TRS | `worldMatrix`, `updateWorldMatrix()`, dirty flag          |
| [src/index.ts](src/index.ts)         | Creates root + child1         | Traversal demo, logging world positions s matrix from TRS |
| [src/node.ts](src/node.ts)           | Parent-child tree + local TRS | `worldMatrix`, `updateWorldMatrix()`, dirty flag          |
| [src/index.ts](src/index.ts)         | Creates root + child1         | Traversal demo, logging world positions                   |
