import assert from "node:assert/strict";
import test from "node:test";

import {
  ApiValidationError,
  MAX_UPLOAD_BYTES,
  assertAllowedValue,
  isEmail,
  isPhone,
  optionalIntRange,
  optionalString,
  positiveInt,
  readJsonBody,
  requiredString,
  validateUploadFile,
} from "../lib/api-validation.mjs";

test("requiredString trims valid strings and rejects blanks", () => {
  assert.equal(requiredString("  湛江白切鸡  ", "标题"), "湛江白切鸡");
  assert.throws(() => requiredString("   ", "标题"), ApiValidationError);
  assert.throws(() => requiredString(undefined, "标题"), /标题不能为空/);
});

test("optionalString accepts empty values and rejects non-strings", () => {
  assert.equal(optionalString(undefined, "简介"), undefined);
  assert.equal(optionalString("", "简介"), undefined);
  assert.equal(optionalString("  hello  ", "简介"), "hello");
  assert.throws(() => optionalString(123, "简介"), /简介必须是文本/);
});

test("positiveInt only accepts positive integers", () => {
  assert.equal(positiveInt("12", "postId"), 12);
  assert.equal(positiveInt(3, "targetId"), 3);
  assert.throws(() => positiveInt("0", "postId"), /postId必须是正整数/);
  assert.throws(() => positiveInt("1.5", "postId"), /postId必须是正整数/);
  assert.throws(() => positiveInt("abc", "postId"), /postId必须是正整数/);
});

test("optionalIntRange validates optional bounded integers", () => {
  assert.equal(optionalIntRange(undefined, 1, 120, "年龄"), undefined);
  assert.equal(optionalIntRange("", 1, 120, "年龄"), undefined);
  assert.equal(optionalIntRange("18", 1, 120, "年龄"), 18);
  assert.throws(() => optionalIntRange("0", 1, 120, "年龄"), /年龄必须在1到120之间/);
  assert.throws(() => optionalIntRange("121", 1, 120, "年龄"), /年龄必须在1到120之间/);
});

test("email phone and allowed value validators match form rules", () => {
  assert.equal(isEmail("test@example.com"), true);
  assert.equal(isEmail("bad-email"), false);
  assert.equal(isPhone("13800138000"), true);
  assert.equal(isPhone("123"), false);
  assert.equal(assertAllowedValue("male", ["male", "female", "secret"], "性别"), "male");
  assert.throws(() => assertAllowedValue("unknown", ["male", "female", "secret"], "性别"), /性别不正确/);
});

test("readJsonBody rejects invalid JSON bodies", async () => {
  const request = {
    async json() {
      throw new Error("bad json");
    },
  };

  await assert.rejects(() => readJsonBody(request), /请求体必须是合法JSON/);
});

test("validateUploadFile allows image files up to five megabytes", () => {
  const file = { name: "food.webp", type: "image/webp", size: MAX_UPLOAD_BYTES };
  assert.deepEqual(validateUploadFile(file), { extension: "webp" });
});

test("validateUploadFile rejects missing oversized and non-image files", () => {
  assert.throws(() => validateUploadFile(null), /未找到文件/);
  assert.throws(
    () => validateUploadFile({ name: "food.txt", type: "text/plain", size: 10 }),
    /仅支持上传JPG、PNG或WEBP图片/,
  );
  assert.throws(
    () => validateUploadFile({ name: "food.jpg", type: "image/jpeg", size: MAX_UPLOAD_BYTES + 1 }),
    /图片大小不能超过5MB/,
  );
  assert.throws(
    () => validateUploadFile({ name: "food", type: "image/jpeg", size: 10 }),
    /文件扩展名不正确/,
  );
});
