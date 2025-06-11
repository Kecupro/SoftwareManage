# Sử dụng một image Node.js gọn nhẹ làm nền tảng
FROM node:20-alpine

# Tạo và đặt thư mục làm việc bên trong container là /app
WORKDIR /app

# Sao chép package.json và package-lock.json vào trước
# Điều này tận dụng cơ chế caching của Docker, giúp build nhanh hơn ở các lần sau
COPY package*.json ./

# Cài đặt các thư viện cần thiết một cách an toàn
RUN npm ci

# Sao chép toàn bộ mã nguồn còn lại của dự án vào thư mục làm việc
COPY . .

# Lệnh sẽ được thực thi khi container khởi chạy
# (Trong ví dụ của chúng ta, nó sẽ chạy file app.js)
CMD [ "node", "app.js" ]