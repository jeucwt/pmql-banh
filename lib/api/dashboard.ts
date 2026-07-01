const API_BASE = 'http://localhost:3001/api/admin/dashboard';

function getToken() {
    return localStorage.getItem('tiem_banh_token');
}

function authHeader() {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
    };
}

function getRange(filter: 'Ngay' | 'Tuan' | 'Thang' | 'Nam') {
    const now = new Date();
    let from: Date;
    const to = new Date(now);

    if (filter === 'Ngay') {
        from = new Date(now);
    } else if (filter === 'Tuan') {
        from = new Date(now);
        from.setDate(now.getDate() - 6);
    } else if (filter === 'Thang') {
        from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
        from = new Date(now.getFullYear(), 0, 1);
    }

    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { from: fmt(from), to: fmt(to) };
}

export async function fetchDoanhThu(filter: 'Ngay' | 'Tuan' | 'Thang' | 'Nam') {
    const { from, to } = getRange(filter);
    const res = await fetch(`${API_BASE}/doanhthu?from=${from}&to=${to}`, {
        headers: authHeader(),
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`${res.status}: ${body}`);
    }
    return res.json();
}

export async function fetchDonHang() {
    const res = await fetch(`${API_BASE}/donhang`, { headers: authHeader() });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`${res.status}: ${body}`);
    }
    return res.json();
}

export async function fetchTopSanPham(filter: 'Ngay' | 'Tuan' | 'Thang' | 'Nam') {
    const { from, to } = getRange(filter);
    const res = await fetch(`${API_BASE}/sanpham?from=${from}&to=${to}`, {
        headers: authHeader(),
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`${res.status}: ${body}`);
    }
    return res.json();
}