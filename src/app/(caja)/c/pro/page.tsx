import type { Metadata, Viewport } from "next";
import AppPro from "@/cajas/pro/ui/AppPro";

export const metadata: Metadata = {
  title: "Demo de la caja pro",
  description: "Caja para comercios con empleados y sucursales: ventas con lector de código de barras, factura electrónica, QR de Mercado Pago, stock, cuentas corrientes, permisos y auditoría.",
};

export const viewport: Viewport = { themeColor: "#0f766e" };

/** Demo navegable de la caja pro: todo en el navegador, con una ferretería inventada. */
export default function Page() {
  return <AppPro />;
}
