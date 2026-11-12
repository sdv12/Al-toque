import { describe, expect, it } from "vitest";
import { formatKg, formatMoney, formatTyping, moneyToTyping, parseMoney } from "./format";
import { seedProducts } from "./seed";

describe("formato argentino", () => {
  it("plata", () => {
    expect(formatMoney(125050)).toBe("$\u00a01.250,50");
    expect(formatMoney(120000)).toBe("$\u00a01.200");
    expect(formatMoney(5)).toBe("$\u00a00,05");
    expect(formatMoney(123456789)).toBe("$\u00a01.234.567,89");
    expect(formatMoney(-40000)).toBe("−$\u00a0400");
  });
  it("kilos", () => {
    expect(formatKg(1500)).toBe("1,5\u00a0kg");
    expect(formatKg(250)).toBe("0,25\u00a0kg");
    expect(formatKg(2000)).toBe("2\u00a0kg");
  });
  it("lo que se tipea", () => {
    expect(parseMoney("1250,5")).toBe(125050);
    expect(parseMoney("1.250,50")).toBe(125050);
    expect(parseMoney("0,1")).toBe(10);
    expect(parseMoney("")).toBeNull();
    expect(parseMoney(",")).toBeNull();
    expect(formatTyping("1250,5")).toBe("1.250,5");
    expect(formatTyping("1250,")).toBe("1.250,");
    expect(moneyToTyping(125050)).toBe("1250,5");
    expect(moneyToTyping(120000)).toBe("1200");
  });
});

describe("productos de arranque", () => {
  it("son 30, con nombre único y precio", () => {
    const list = seedProducts();
    expect(list).toHaveLength(30);
    expect(new Set(list.map((p) => p.name)).size).toBe(30);
    expect(list.every((p) => p.price > 0)).toBe(true);
  });
});
