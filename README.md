# nirv_server — NIRV Research Portal & CMS Server

Cổng thông tin học thuật trực tuyến và hệ thống quản trị nội dung (CMS) chính thức của **NIRV — Network for Intelligent Research Vietnam**.

## 📌 Công nghệ sử dụng
- **Frontend**: React 19, React Router v7, Vite 6, Lucide Icons.
- **Backend**: Node.js, Express, Helmet, Rate Limit, JSON Web Token (JWT), Bcrypt.
- **Database**: SQLite (Node 22/24 `DatabaseSync`) / Tương thích Turso (libSQL) & PostgreSQL.
- **Design System**: Chuẩn nhận diện học thuật Viettel-inspired (Brand Red `#EE0033`, Slate `#1F2937`, Light Gray `#F8F9FA`).

## 🚀 Cài đặt & Chạy cục bộ
```bash
# Cài đặt thư viện
npm install

# Khởi chạy đồng thời Backend (port 5000) và Frontend (port 3000)
npm run dev

# Build production
npm run build
```

## 🛡️ Bảo mật
- Xác thực phân quyền Quản trị viên qua JWT và cookie HttpOnly.
- Giới hạn tần suất request (Rate Limiting) phòng chống brute-force và DDoS.
- Header bảo mật Helmet (Content-Security-Policy, X-Frame-Options, HSTS).
- Khử trùng dữ liệu đầu vào và kiểm soát toàn vẹn CSDL.

---
© 2026 NIRV — Network for Intelligent Research Vietnam. All rights reserved.
