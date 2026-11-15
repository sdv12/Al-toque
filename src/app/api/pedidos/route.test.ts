import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("/api/pedidos", () => {
  it("no da números a pedidos que salen de otro sitio", async () => {
    const r = await POST(new Request("https://altoque-cba.com.ar/api/pedidos", { method: "POST", headers: { "sec-fetch-site": "cross-site" } }));
    expect(r.status).toBe(403);
  });
});
