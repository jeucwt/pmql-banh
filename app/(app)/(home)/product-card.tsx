import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number | null;
}

export default function ProductCard({ id, name, description, price }: ProductCardProps) {
  return (
    <Link href={`/product/${id}`} className="block">
      <div
        style={{ backgroundColor: "#FFDBBB" }}
        className="rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
      >
        {/* Image placeholder */}
        <div className="bg-white h-40 w-full" />

        {/* Info */}
        <div style={{ backgroundColor: "#CCBEB1" }} className="p-3">
          <p className="font-semibold text-sm" style={{ color: "#664930" }}>{name}</p>
          <p className="text-xs mt-0.5" style={{ color: "#997E67" }}>{description}</p>
          {price !== null && (
            <p className="text-xs font-bold mt-1.5" style={{ color: "#664930" }}>
              Từ {price.toLocaleString("vi-VN")} ₫
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}