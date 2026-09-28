# In Ấn Sáng Tạo

Website mới được xây dựng bằng Next.js và React, chuyển các bài viết, trang nội dung, sản phẩm và danh mục công khai từ bản sao NukeViet sang trang tĩnh. Mã nguồn NukeViet gốc nằm trong `public_html/` và được Git bỏ qua.

## Chạy trên máy

```bash
npm install
npm run dev
```

## Nhập nội dung từ NukeViet

Đặt bản sao cơ sở dữ liệu SQL và thư mục `public_html` cũ trên máy, sau đó chạy:

```bash
npm run import -- --sql "D:/duong-dan/h02b7abdac_inansang_com.sql" --legacy "D:/duong-dan/public_html"
```

Lệnh này chỉ xuất nội dung công khai gồm bài viết, trang, sản phẩm, danh mục và các tệp hình được nội dung sử dụng. Tài khoản, thông tin khách hàng, đơn hàng, mật khẩu và cấu hình máy chủ không được chuyển vào site mới.

## Build và triển khai

```bash
npm run build
```

Next.js tạo bản tĩnh trong `out/`. Có thể kết nối repository với Vercel; Vercel sẽ nhận diện Next.js và chạy lệnh build.

Site hiện phục vụ nội dung tĩnh và liên hệ báo giá. Các tác vụ cần máy chủ hoặc cơ sở dữ liệu như đăng nhập quản trị, sửa nội dung trực tuyến, giỏ hàng, thanh toán, bình luận và đơn hàng chưa được chuyển đổi; cần một backend riêng nếu muốn dùng các chức năng đó.
