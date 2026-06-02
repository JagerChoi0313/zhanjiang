import { ApiResponse } from "../../../../lib/api-response.mjs";
import { createCsrfToken, setCsrfCookie } from "../../../../lib/csrf.mjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = createCsrfToken();
  const response = ApiResponse.success({ token }, "CSRF令牌已刷新", {
    headers: {
      "Cache-Control": "no-store",
    },
  });
  setCsrfCookie(response, token);
  return response;
}
