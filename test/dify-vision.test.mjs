import assert from "node:assert/strict";
import { mock, test } from "node:test";
import sharp from "sharp";

mock.module("../lib/api-auth.mjs", {
  namedExports: { requireAuth: async () => ({ ok: true, userId: 7 }) },
});
mock.module("../lib/csrf.mjs", {
  namedExports: { requireCsrf: async () => ({ ok: true }) },
});

const { POST } = await import("../app/API/Dify/Chat/route.js");

test("Dify photo chat uploads and references the image using the vision app", async (t) => {
  process.env.DIFY_API_KEY = "text-key";
  process.env.DIFY_VISION_API_KEY = "vision-key";
  process.env.DIFY_API_URL = "https://dify.example/v1";

  const buffer = await sharp({ create: { width: 32, height: 24, channels: 3, background: "#b84a2f" } }).png().toBuffer();
  const image = new File([buffer], "food.png", { type: "image/png" });
  const form = new FormData();
  form.set("image", image);
  const request = new Request("http://localhost/API/Dify/Chat", {
    method: "POST",
    body: form,
  });

  const fetchMock = t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(options.headers.Authorization, "Bearer vision-key");
    if (url.endsWith("/files/upload")) {
      assert.equal(options.body.get("user"), "zhanjiang_user_7");
      assert.equal(options.body.get("file").type, "image/png");
      return Response.json({ id: "uploaded-photo" });
    }
    assert.equal(url, "https://dify.example/v1/chat-messages");
    const body = JSON.parse(options.body);
    assert.equal(body.user, "zhanjiang_user_7");
    assert.ok(body.query.length > 0);
    assert.deepEqual(body.files, [
      { type: "image", transfer_method: "local_file", upload_file_id: "uploaded-photo" },
    ]);
    return Response.json({ answer: "A shrimp cake." });
  });

  const response = await POST(request);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.data.answer, "A shrimp cake.");
  assert.equal(fetchMock.mock.callCount(), 2);
});

