import { makeItem } from "./sale";
import type { CashOpening, Customer, Product, Sale, SaleItem } from "./types";

/**
 * Datos de ejemplo para las demos y la prueba de /caja: una mañana de ventas, dos clientes con
 * fiado y la caja abierta. Así quien la prueba ve Caja del día y Fiado con algo adentro.
 */
export function datosDeEjemplo(products: Product[], now = Date.now()): {
  sales: Sale[];
  customers: Customer[];
  opening: CashOpening;
} {
  const p = (i: number) => products[i % products.length]!;
  /** Cantidad razonable: 1,5 kg o 2 unidades. */
  const item = (i: number, veces = 1): SaleItem => makeItem(p(i), p(i).unit === "kg" ? 1500 * veces : 2 * veces);
  const minutos = (m: number) => now - m * 60_000;

  const customers: Customer[] = [
    { id: "ejemplo-marta", name: "Marta (la del 3° B)", phone: null, createdAt: minutos(600), updatedAt: minutos(600) },
    { id: "ejemplo-carlos", name: "Don Carlos", phone: null, createdAt: minutos(600), updatedAt: minutos(600) },
  ];

  const ventas: Array<[minutosAtras: number, items: SaleItem[], method: Sale["method"], extra?: Partial<Sale>]> = [
    [170, [item(0), item(1)], "efectivo", { paidWith: null }],
    [150, [item(2), item(4, 2)], "transferencia"],
    [125, [item(3)], "fiado", { customerId: "ejemplo-marta" }],
    [100, [item(5), item(0), item(6)], "efectivo"],
    [80, [item(7)], "qr"],
    [55, [item(1, 2), item(8)], "fiado", { customerId: "ejemplo-carlos" }],
    [30, [item(9), item(2)], "efectivo"],
  ];

  const sales: Sale[] = ventas.map(([m, items, method, extra], i) => {
    const total = items.reduce((t, x) => t + x.subtotal, 0);
    const paidWith = method === "efectivo" ? Math.ceil(total / 1_000_000) * 1_000_000 : null;
    return {
      id: `ejemplo-venta-${i + 1}`,
      items,
      total,
      method,
      paidWith,
      customerId: null,
      ...extra,
      createdAt: minutos(m),
      updatedAt: minutos(m),
    };
  });

  return { sales, customers, opening: { amount: 2_000_000, at: minutos(190) } };
}
