import type { Product } from "@/cajas/simple/lib/types";

/** Foto del producto si tiene, si no el emoji. */
export default function ProductImage({ product, size = 56 }: { product: Pick<Product, "emoji" | "photo">; size?: number }) {
  if (product.photo) {
    // eslint-disable-next-line @next/next/no-img-element -- foto local en data URL
    return <img src={product.photo} alt="" width={size} height={size} className="shrink-0 rounded-xl object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center justify-center leading-none" style={{ width: size, height: size, fontSize: size * 0.8 }}>
      {product.emoji}
    </span>
  );
}
