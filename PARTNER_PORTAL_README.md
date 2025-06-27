# Portal Đối Tác - Hướng Dẫn Sử Dụng

## Tổng Quan

Portal Đối Tác là giao diện chuyên dụng cho phép đối tác upload source code và tài liệu bàn giao cho các module đã hoàn thành. Hệ thống được thiết kế với phân quyền nghiêm ngặt để đảm bảo đối tác chỉ có thể truy cập dữ liệu của mình.

## Tính Năng Chính

### 1. Dashboard
- **Thống kê tổng quan**: Hiển thị số lượng dự án, module, tiến độ bàn giao
- **Hoạt động gần đây**: Theo dõi các hoạt động bàn giao và cập nhật
- **Thao tác nhanh**: Truy cập nhanh đến các chức năng chính

### 2. Quản Lý Dự Án
- **Danh sách dự án**: Xem tất cả dự án được gán cho đối tác
- **Lọc và tìm kiếm**: Tìm kiếm dự án theo tên, mã hoặc trạng thái
- **Chi tiết dự án**: Xem thông tin chi tiết về timeline, team, tiến độ

### 3. Quản Lý Module
- **Danh sách module**: Xem các module thuộc dự án đã chọn
- **Trạng thái module**: Theo dõi trạng thái phát triển và bàn giao
- **Chọn module**: Chọn module để thực hiện bàn giao

### 4. Bàn Giao Module
- **Upload source code**: Upload file ZIP/RAR chứa source code
- **Upload tài liệu**: Upload tài liệu bàn giao (PDF, DOC, DOCX)
- **Files bổ sung**: Upload các file khác nếu cần
- **Ghi chú bàn giao**: Mô tả chi tiết về những gì đã bàn giao
- **Git commit**: Liên kết với commit hash nếu có

### 5. Quản Lý Tài Liệu
- **Upload tài liệu**: Upload và quản lý tài liệu dự án
- **Xem tài liệu**: Xem danh sách tài liệu đã upload
- **Download tài liệu**: Tải về tài liệu khi cần

## Cách Sử Dụng

### 1. Đăng Nhập
```bash
Email: partner@techsolutions.com
Password: partner123
```

### 2. Truy Cập Portal
- Đăng nhập vào hệ thống chính
- Chuyển sang "Portal Đối Tác" bằng nút chuyển đổi ở header
- Hoặc truy cập trực tiếp: `http://localhost:3000/partner`

### 3. Quy Trình Bàn Giao

#### Bước 1: Chọn Dự Án
1. Vào tab "Dự án"
2. Tìm và chọn dự án cần bàn giao
3. Xem thông tin chi tiết dự án

#### Bước 2: Chọn Module
1. Vào tab "Module"
2. Chọn module đã hoàn thành (status: completed)
3. Xem thông tin chi tiết module

#### Bước 3: Thực Hiện Bàn Giao
1. Vào tab "Bàn giao"
2. Chọn module từ dropdown
3. Upload source code (file ZIP/RAR)
4. Upload tài liệu bàn giao
5. Điền ghi chú bàn giao
6. Nhấn "Bàn giao Module"

#### Bước 4: Theo Dõi Trạng Thái
1. Vào tab "Module" để xem trạng thái bàn giao
2. Trạng thái sẽ chuyển từ "pending" → "accepted/rejected"
3. Xem phản hồi từ team nội bộ

### 4. Quản Lý Tài Liệu
1. Vào tab "Tài liệu"
2. Chọn dự án cần quản lý tài liệu
3. Upload tài liệu mới
4. Xem và download tài liệu đã có

## Phân Quyền

### Quyền Đối Tác
- ✅ Xem dự án được gán
- ✅ Xem module thuộc dự án
- ✅ Upload source code và tài liệu
- ✅ Bàn giao module đã hoàn thành
- ✅ Quản lý tài liệu dự án
- ❌ Không thể xem dự án khác
- ❌ Không thể chỉnh sửa thông tin dự án
- ❌ Không thể xóa dữ liệu

### Bảo Mật
- Mỗi đối tác chỉ thấy dữ liệu của mình
- Kiểm tra quyền truy cập ở cả frontend và backend
- Logging tất cả hoạt động bàn giao
- Mã hóa file upload

## API Endpoints

### Partner Statistics
```
GET /api/partners/me/statistics
```

### Partner Activities
```
GET /api/partners/me/activities
```

### Partner Projects
```
GET /api/partners/me/projects
GET /api/partners/me/projects/:projectId/modules
```

### Module Delivery
```
POST /api/partners/me/deliver
```

## Cấu Trúc File Upload

### Source Code
- **Định dạng**: ZIP, RAR, 7Z, TAR, GZ
- **Kích thước tối đa**: 100MB
- **Cấu trúc đề xuất**:
```
project-name/
├── src/
│   ├── components/
│   ├── pages/
│   └── utils/
├── public/
├── package.json
├── README.md
└── .gitignore
```

### Tài Liệu Bàn Giao
- **Định dạng**: PDF, DOC, DOCX, TXT, MD
- **Kích thước tối đa**: 50MB
- **Tài liệu cần có**:
  - Hướng dẫn cài đặt
  - Hướng dẫn sử dụng
  - API documentation
  - Database schema
  - Deployment guide

## Troubleshooting

### Lỗi Thường Gặp

#### 1. Không thể đăng nhập
- Kiểm tra email và password
- Đảm bảo user có role 'partner'
- Kiểm tra kết nối database

#### 2. Không thấy dự án
- Kiểm tra partner có được gán dự án chưa
- Kiểm tra email trong thông tin partner
- Liên hệ admin để gán dự án

#### 3. Upload file thất bại
- Kiểm tra định dạng file
- Kiểm tra kích thước file
- Kiểm tra kết nối mạng

#### 4. Bàn giao module thất bại
- Kiểm tra module có status 'completed' không
- Kiểm tra module thuộc về đối tác không
- Kiểm tra đã upload đủ file chưa

### Liên Hệ Hỗ Trợ
- **Email**: support@devmanagement.com
- **Phone**: 090-123-4567
- **Working hours**: 8:00 AM - 6:00 PM (GMT+7)

## Cập Nhật và Bảo Trì

### Version History
- **v1.0.0**: Phiên bản đầu tiên với các tính năng cơ bản
- **v1.1.0**: Thêm tính năng upload multiple files
- **v1.2.0**: Cải thiện UI/UX và performance

### Roadmap
- [ ] Tích hợp Git API
- [ ] Real-time notifications
- [ ] Mobile app
- [ ] Advanced reporting
- [ ] Multi-language support

---

**Lưu ý**: Portal này được thiết kế đặc biệt cho đối tác. Vui lòng tuân thủ các quy định bảo mật và không chia sẻ thông tin đăng nhập với người khác. 