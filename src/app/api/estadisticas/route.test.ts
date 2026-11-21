import { describe, expect, it } from "vitest";
import { POST } from "./route";

const pedir = (cuerpo: string, sitio = "same-origin") =>
  POST(new Request("https://altoque-cba.com.ar/api/estadisticas", { method: "POST", headers: { "sec-fetch-site": sitio }, body: cuerpo }));

describe("/api/estadisticas", () => {
  it("no cuenta pedidos de otro sitio", async () => {
    expect((await pedir(JSON.stringify({ tipo: "Landing" }), "cross-site")).status).toBe(403);
  });
  it("rechaza lo que no es un evento válido o es demasiado largo", async () => {
    expect((await pedir("no es json")).status).toBe(400);
    expect((await pedir(JSON.stringify({ tipo: "Cualquiera" }))).status).toBe(400);
    expect((await pedir(JSON.stringify({ tipo: "Landing", relleno: "x".repeat(2_000) }))).status).toBe(413);
  });
});
