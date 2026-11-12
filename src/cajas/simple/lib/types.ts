export type Unit = "kg" | "unidad" | "atado";

export interface Product {
  id: string;
  name: string;
  emoji: string;
  /** Foto chiquita en JPEG (data URL). Si hay foto, se muestra en vez del emoji. */
  photo?: string | null;
  unit: Unit;
  /** Precio de venta en centavos, por kilo o por unidad/atado. */
  price: number;
  /** Precio de compra en centavos (opcional), para calcular la ganancia. */
  cost?: number | null;
  /** Cuánto trae un cajón (o bolsa, o caja): gramos si es por kilo, unidades/atados si no. */
  crate?: number | null;
  /** Borrado "blando": queda guardado para poder deshacer y para sincronizar. */
  deleted?: boolean;
  createdAt: number;
  updatedAt: number;
}

export const UNIT_LABEL: Record<Unit, string> = {
  kg: "por kilo",
  unidad: "por unidad",
  atado: "por atado",
};

/** Un renglón del ticket (y de la venta guardada). Guarda nombre y precio del momento. */
export interface SaleItem {
  productId: string;
  name: string;
  emoji: string;
  photo?: string | null;
  unit: Unit;
  /** Precio por kilo o por unidad, en centavos, al momento de vender. */
  price: number;
  /** Gramos si es por kilo; cantidad si es por unidad o atado. */
  qty: number;
  /** Lo que se cobra por este renglón, en centavos. */
  subtotal: number;
}

export type PayMethod = "efectivo" | "transferencia" | "qr" | "fiado";

export const PAY_LABEL: Record<PayMethod, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  qr: "QR / Mercado Pago",
  fiado: "Fiado",
};

export const PAY_ICON: Record<PayMethod, string> = {
  efectivo: "💵",
  transferencia: "🏦",
  qr: "📱",
  fiado: "📒",
};

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  method: PayMethod;
  /** Efectivo: con cuánto pagó (si se cargó), para el vuelto. */
  paidWith?: number | null;
  /** Fiado: a quién. */
  customerId?: string | null;
  deleted?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  deleted?: boolean;
  createdAt: number;
  updatedAt: number;
}

/** Movimiento de fiado que no es una venta: un pago o una deuda anotada a mano (ej. del cuaderno). */
export interface FiadoMove {
  id: string;
  customerId: string;
  kind: "pago" | "deuda";
  /** Siempre positivo, en centavos. */
  amount: number;
  /** Pagos: cómo pagó (para la caja del día). */
  method?: Exclude<PayMethod, "fiado"> | null;
  deleted?: boolean;
  createdAt: number;
  updatedAt: number;
}

/** Totales de un período de caja (desde el cierre anterior). Todo en centavos. */
export interface CashSummary {
  /** Ventas por medio de pago. */
  sales: Record<PayMethod, number>;
  salesTotal: number;
  salesCount: number;
  /** Cobros de fiado (pagos de deudas) por medio de pago. */
  fiadoPayments: Record<Exclude<PayMethod, "fiado">, number>;
}

/** Un cierre de caja ("Cerrar el día"). */
export interface CashClose {
  id: string;
  /** Desde cuándo cuenta (cierre anterior) y cuándo se cerró. */
  from: number;
  closedAt: number;
  /** Con cuánto se abrió el cajón (0 si no se abrió). */
  opening: number;
  openedAt?: number | null;
  summary: CashSummary;
  /** Lo que tendría que haber en el cajón y lo que se contó. */
  expected: number;
  counted: number;
  deleted?: boolean;
  createdAt: number;
  updatedAt: number;
}

/** Apertura de la caja del período actual. */
export interface CashOpening {
  amount: number;
  at: number;
}

/** Movimiento de mercadería: lo que se compró en el mercado, o una corrección de lo que queda. */
export interface StockEvent {
  id: string;
  productId: string;
  kind: "compra" | "conteo";
  /** Compra: lo que entró. Conteo: lo que queda de verdad. En gramos o unidades. */
  qty: number;
  /** Compra: cuántos cajones. */
  crates?: number | null;
  /** Compra: cuánto se pagó en total (centavos), si se cargó. */
  paid?: number | null;
  /** Conteo: lo que la app calculaba que quedaba (la diferencia es la merma). */
  estimated?: number | null;
  deleted?: boolean;
  createdAt: number;
  updatedAt: number;
}
