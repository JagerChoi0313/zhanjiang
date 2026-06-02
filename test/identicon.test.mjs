import assert from "node:assert/strict";
import test from "node:test";

import { createIdenticonDataUrl, createIdenticonSvg } from "../lib/identicon.mjs";

test("createIdenticonDataUrl returns stable svg data urls for the same seed", () => {
  const first = createIdenticonDataUrl("湛江食客");
  const second = createIdenticonDataUrl("湛江食客");

  assert.equal(first, second);
  assert.match(first, /^data:image\/svg\+xml;charset=UTF-8,/);
  assert.match(decodeURIComponent(first), /<svg/);
});

test("createIdenticonDataUrl changes the pattern and color for different users", () => {
  const first = createIdenticonDataUrl("alice");
  const second = createIdenticonDataUrl("bob");

  assert.notEqual(first, second);
});

test("createIdenticonSvg creates a symmetric five by five bit grid", () => {
  const svg = createIdenticonSvg("mirror-user");
  const cells = [...svg.matchAll(/<rect x="(\d+)" y="(\d+)"/g)].map((match) => ({
    x: Number(match[1]),
    y: Number(match[2]),
  }));

  assert.ok(cells.length > 0);
  assert.ok(cells.every(({ x, y }) => x >= 0 && x < 5 && y >= 0 && y < 5));
  for (const cell of cells) {
    assert.ok(cells.some((candidate) => candidate.x === 4 - cell.x && candidate.y === cell.y));
  }
});
