# 📚 Tài liệu API Bakery & Hướng dẫn Postman

Dưới đây là danh sách tổng hợp toàn bộ các API hiện có trong hệ thống Bakery của bạn, cùng với hướng dẫn cách kiểm tra (test) chúng bằng Postman.

Tất cả các API đều chạy tại Base URL: **`http://localhost:3001`**

---

## 🚀 Hướng dẫn cấu hình Postman chung

1. **Base URL:** Thay vì gõ đi gõ lại `http://localhost:3001`, hãy tạo một biến môi trường `{{base_url}}` trong Postman bằng giá trị `http://localhost:3001`.
2. **Xác thực (Token):** Nhiều API yêu cầu `verifyToken` và `requireRole` (Quyền truy cập).
   - Trước tiên, hãy gọi API Login để lấy `token`.
   - Trong Postman, vào tab **Authorization**, chọn Type là **Bearer Token** và dán token vừa nhận được vào ô Token. (Bạn cũng có thể lưu token vào biến môi trường để dùng chung cho mọi API).
3. **Định dạng dữ liệu:** Ở tab **Body**, khi gửi dữ liệu dạng POST/PUT/PATCH, chọn **raw** và chọn định dạng **JSON**.

---

## 📜 Danh sách các API

### 1. Xác thực (Auth)
- **POST** `/api/auth/login` : Đăng nhập hệ thống (Lấy Token).
- **POST** `/api/auth/register` : Đăng ký tài khoản khách hàng mới.

### 2. Khách Hàng (Customer) - Bánh & Đơn Hàng
- **GET** `/api/banh/` : Lấy danh sách các bánh đang mở bán.
- **GET** `/api/banh/:id` : Lấy thông tin chi tiết một loại bánh (dành cho người dùng).
- **GET** `/api/kh/me` : Lấy thông tin hồ sơ của khách hàng hiện tại (Cần Token khách hàng).
- **PUT** `/api/kh/me` : Cập nhật thông tin hồ sơ khách hàng.
- **POST** `/api/donhang/` : Khách hàng tạo đơn hàng mới.
- **GET** `/api/donhang/me` : Lấy danh sách các đơn hàng mà khách hàng đã đặt.
- **GET** `/api/donhang/:id` : Xem chi tiết một đơn hàng cụ thể.

### 3. Quản Lý Bánh & Công Thức (Admin/Quản Lý)
- **GET** `/api/admin/banh/` : Xem toàn bộ danh sách bánh trong kho (Cần Token Quản Lý).
- **GET** `/api/admin/banh/:id` : Xem chi tiết một sản phẩm bánh theo ID.
- **POST** `/api/admin/banh/` : Thêm một loại bánh mới vào hệ thống.
- **PUT** `/api/admin/banh/:id` : Cập nhật thông tin bánh.
- **DELETE** `/api/admin/banh/:id` : Xóa một loại bánh.
- **GET** `/api/admin/congthuc/:maBanh` : Lấy công thức nguyên liệu cho một loại bánh.
- **PUT** `/api/admin/congthuc/:maBanh` : Cập nhật hoặc thêm công thức nguyên liệu cho loại bánh.

### 4. Quản Lý Kho & Nguyên Liệu (Admin/Quản Lý)
- **GET** `/api/admin/kho/` : Lấy danh sách nguyên liệu hiện có trong kho.
- **POST** `/api/admin/kho/` : Thêm nguyên liệu mới vào kho.
- **PUT** `/api/admin/kho/:id` : Cập nhật thông tin nguyên liệu.
- **DELETE** `/api/admin/kho/:id` : Xóa nguyên liệu khỏi kho.
- **GET** `/api/admin/nhacc/` : Lấy danh sách các nhà cung cấp.
- **POST** `/api/admin/nhacc/` : Thêm nhà cung cấp mới.
- **PUT** `/api/admin/nhacc/:id` : Sửa thông tin nhà cung cấp.
- **DELETE** `/api/admin/nhacc/:id` : Xóa nhà cung cấp.
- **GET** `/api/admin/phieunhap/` : Xem danh sách phiếu nhập kho nguyên liệu.
- **GET** `/api/admin/phieunhap/:id` : Xem chi tiết phiếu nhập kho.
- **POST** `/api/admin/phieunhap/` : Tạo phiếu nhập kho mới.

### 5. Quản Lý Sản Xuất (Admin/Quản Lý)
- **GET** `/api/admin/sanxuat/goi-y` : Gợi ý số lượng bánh cần sản xuất dựa trên đơn hàng và lượng tồn.
- **GET** `/api/admin/sanxuat/` : Xem danh sách các phiếu/lệnh sản xuất.
- **GET** `/api/admin/sanxuat/:id` : Xem chi tiết lệnh sản xuất (nguyên liệu cần dùng, bánh cần làm).
- **POST** `/api/admin/sanxuat/` : Tạo phiếu sản xuất mới.
- **PATCH** `/api/admin/sanxuat/:id/trangthai` : Cập nhật trạng thái phiếu sản xuất (ví dụ: đang sản xuất, hoàn thành).
- **DELETE** `/api/admin/sanxuat/:id` : Hủy/Xóa phiếu sản xuất.

### 6. Quản Lý Đơn Hàng & Hóa Đơn (Bán Hàng/Quản Lý)
- **GET** `/api/donhang/dangxuly` : Lấy danh sách các đơn hàng đang chờ xử lý.
- **PATCH** `/api/donhang/:id/ship` : Cập nhật trạng thái giao hàng của đơn.
- **GET** `/api/hoadon/` : Lấy danh sách các hóa đơn đã thanh toán.
- **GET** `/api/hoadon/donhang-cho` : Xem các đơn hàng đã duyệt, đang chờ thanh toán.
- **GET** `/api/hoadon/:id` : Chi tiết hóa đơn.
- **POST** `/api/hoadon/` : Tạo hóa đơn từ một đơn hàng đã đặt online.
- **POST** `/api/hoadon/tai-quay` : Tạo hóa đơn mua hàng trực tiếp tại quầy.
- **GET** `/api/dvvc/` : Lấy danh sách các đơn vị vận chuyển.

### 7. Báo Cáo Thống Kê (Dashboard - Quản Lý)
- **GET** `/api/admin/dashboard/doanhthu` : Thống kê doanh thu theo thời gian.
- **GET** `/api/admin/dashboard/donhang` : Báo cáo tình trạng của các đơn hàng.
- **GET** `/api/admin/dashboard/sanpham` : Top sản phẩm bán chạy nhất.
- **GET** `/api/admin/dashboard/donhang-cho-sx` : Số lượng đơn hàng đang chờ để lên lịch sản xuất.

---

## 🛠️ Ví dụ cách Test một luồng nghiệp vụ trên Postman

### Bước 1: Lấy quyền truy cập (Token)
- **Method:** POST
- **URL:** `http://localhost:3001/api/auth/login`
- **Body (raw, JSON):**
  ```json
  {
    "username": "admin",
    "password": "your_password"
  }
  ```
- Nhấn **Send**. Bạn sẽ nhận được `token` trong kết quả trả về. Copy chuỗi token này.

### Bước 2: Gọi API Quản Lý (Yêu cầu xác thực)
- Ví dụ thử xem **Danh sách phiếu sản xuất**
- **Method:** GET
- **URL:** `http://localhost:3001/api/admin/sanxuat/`
- **Tab Authorization:** Chọn **Bearer Token** -> Dán Token từ Bước 1 vào.
- Nhấn **Send**. Hệ thống sẽ trả về danh sách các phiếu.

### Bước 3: Gửi dữ liệu phức tạp (Tạo phiếu sản xuất)
- **Method:** POST
- **URL:** `http://localhost:3001/api/admin/sanxuat/`
- **Tab Authorization:** Bearer Token.
- **Tab Body (raw, JSON):**
  ```json
  {
    "maNV": 1,
    "danhSachBanh": [
      {
        "maBanh": 2,
        "maSize": 4,
        "soLuong": 5
      }
    ]
  }
  ```
- Nhấn **Send** để tạo phiếu.
