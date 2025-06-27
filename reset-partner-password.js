const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');

async function resetPartnerPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/software-dev-management');
    console.log('✅ Kết nối MongoDB thành công!');

    const user = await User.findOne({ email: 'partner@techsolutions.com' });
    if (!user) {
      console.log('❌ Không tìm thấy user partner');
      return;
    }

    const newPassword = 'partner123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.updateOne(
      { email: 'partner@techsolutions.com' },
      { $set: { password: hashedPassword } }
    );
    console.log('✅ Đã đặt lại mật khẩu cho user partner:', user.email);
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.connection.close();
  }
}

resetPartnerPassword(); 