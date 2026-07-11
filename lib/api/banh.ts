const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface Size {
    MaSize: number;
    KichThuoc: string;
    GiaTien: number;
}

export interface Banh{
    MaBanh: number;
    TenBanh: string;
    MoTa: string;
    TenLoai: string;
    TrangThaiBanh: string;
    SoLuong: number;
    sizes: Size[];
}

// Lấy danh sách bánh đang bán
export async function getDanhSachBanh(): Promise<Banh[]> {
    const res = await fetch(`${API_URL}/api/banh`,{
        cache: "no-store",
    });
    
    if (!res.ok) throw new Error("Không thể tải danh sách bánh");

    return res.json();
}

// Lấy chi tiết 1 bánh
export async function getChiTietBanh(id:string): Promise<Banh> {
    const res = await fetch(`${API_URL}/api/banh/${id}`,{
        cache:"no-store",
    });
    if (!res.ok) throw new Error("Không tìm thấy bánh");

    return res.json();
}