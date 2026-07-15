import Link from "next/link";
import { Plus } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number | null;
  soLuong?: number;
  imageUrl?: string | null;
}

export default function ProductCard({ id, name, description, price, soLuong, imageUrl }: ProductCardProps) {
  return (
    <Link href={`/product/${id}`} className="block group">
      <div
        style={{ backgroundColor: "#FFDBBB" }}
        className="rounded-2xl overflow-hidden shadow-sm border hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
      >
        {/* Image placeholder or real image */}
        {imageUrl ? (
          <img
            src={`http://localhost:3001${imageUrl}`}
            alt={name}
            className="h-40 w-full object-cover"
          />
        ) : (
          <div
            style={{ backgroundColor: "#FFDBBB" }}
            className="h-40 w-full flex items-center justify-center"
          >
            <span className="text-[#664930] opacity-50 text-sm">No image</span>
          </div>
        )}

        {/* Info */}
        <div className="bg-white p-4">
          <p className="font-medium text-sm" style={{ color: "#664930" }}>{name}</p>
          <p className="text-xs mt-1 line-clamp-1" style={{ color: "#997E67" }}>{description}</p>
          {soLuong !== undefined && (
            <span
              className="inline-block text-[10px] px-2 py-0.5 rounded-full mt-1.5"
              style={{ backgroundColor: soLuong > 0 ? "#e6f4ea" : "#fce8e6", color: soLuong > 0 ? "#137333" : "#c5221f" }}
            >
              {soLuong > 0 ? `Còn hàng (${soLuong})` : "Hết hàng"}
            </span>
          )}

          <div className="flex items-center justify-between mt-2">
            {price !== null ? (
              <p className="text-sm font-medium" style={{ color: "#664930" }}>
                Từ {price.toLocaleString("vi-VN")} ₫
              </p>
            ) : <span />}
            <span
              style={{ backgroundColor: "#664930", color: "#FFF8F0" }}
              className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus className="size-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}