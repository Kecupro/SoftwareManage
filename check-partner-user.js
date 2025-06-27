const mongoose = require('mongoose');
const User = require('./models/user.model');

async function checkPartnerUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/software-dev-management');
    console.log('✅ Kết nối MongoDB thành công!');

    const user = await User.findOne({ email: 'partner@techsolutions.com' });
    
    if (user) {
      console.log('✅ Tìm thấy user partner:');
      console.log('ID:', user._id);
      console.log('Email:', user.email);
      console.log('Username:', user.username);
      console.log('Full Name:', user.fullName);
      console.log('Role:', user.role);
      console.log('Status:', user.status);
      console.log('isActive:', user.isActive);
      console.log('Created At:', user.createdAt);
    } else {
      console.log('❌ Không tìm thấy user partner');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkPartnerUser(); 