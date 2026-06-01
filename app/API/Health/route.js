import { ApiResponse } from "../../../lib/api-response.mjs";

export const dynamic = "force-dynamic";

export async function GET() {
  return ApiResponse.success(
    {
      status: "ok",
      service: "zhanjiang",
    },
    "服务正常",
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
