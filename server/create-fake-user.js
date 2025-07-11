const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function createFakeUser() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công!');

    // Kiểm tra user đã tồn tại chưa
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('⚠️ Fake user đã tồn tại:', existingUser.email);
      return;
    }

    // Tạo fake user
    const fakeUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123!', // Sẽ được hash tự động
      fullName: 'Test User',
      role: 'admin',
      isActive: true,
      status: 'active'
    });

    await fakeUser.save();
    console.log('✅ Fake user đã được tạo:', fakeUser.email);
    console.log('📝 Thông tin đăng nhập:');
    console.log('   Email: test@example.com');
    console.log('   Password: Test123!');

  } catch (error) {
    console.error('❌ Lỗi tạo fake user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Đã đóng kết nối MongoDB');
  }
}

createFakeUser(); 