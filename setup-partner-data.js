const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');
const Partner = require('./models/partner.model');
const Project = require('./models/project.model');
const Module = require('./models/module.model');

async function setupPartnerData() {
  try {
    // Kết nối database
    await mongoose.connect('mongodb://localhost:27017/software-dev-management');
    console.log('✅ Kết nối MongoDB thành công!');
    console.log('🗄️ Database: software-dev-management');

    console.log('\n🚀 Bắt đầu setup dữ liệu đối tác...\n');

    // 1. Tạo hoặc tìm admin user
    console.log('1️⃣ Tạo admin user...');
    let adminUser = await User.findOne({ 
      $or: [
        { email: 'admin@devmanagement.com' },
        { username: 'admin' }
      ]
    });
    
    if (!adminUser) {
      try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        adminUser = new User({
          username: 'admin',
          email: 'admin@devmanagement.com',
          password: hashedPassword,
          fullName: 'Administrator',
          role: 'admin',
          status: 'active'
        });
        await adminUser.save();
        console.log('   ✅ Tạo mới admin user');
      } catch (error) {
        if (error.code === 11000) {
          console.log('   ℹ️ Admin user đã tồn tại (duplicate key)');
          adminUser = await User.findOne({ username: 'admin' });
        } else {
          throw error;
        }
      }
    } else {
      console.log('   ℹ️ Admin user đã tồn tại');
    }

    // 2. Tạo hoặc tìm partner
    console.log('\n2️⃣ Tạo partner...');
    let partner = await Partner.findOne({ code: 'TECH_PARTNER' });
    
    if (!partner) {
      const partnerData = {
        name: 'Tech Solutions Partner',
        code: 'TECH_PARTNER',
        description: 'Đối tác phát triển phần mềm chuyên nghiệp',
        contact: {
          primaryContact: {
            name: 'Nguyễn Văn Đối Tác',
            email: 'partner@techsolutions.com',
            phone: '0901234567',
            position: 'Giám đốc kỹ thuật'
          },
          address: {
            street: '123 Đường ABC',
            city: 'Hà Nội',
            country: 'Việt Nam'
          },
          website: 'https://techsolutions.com'
        },
        business: {
          type: 'enterprise',
          industry: 'Software Development',
          size: '51-200',
          foundedYear: 2018
        },
        status: 'active',
        createdBy: adminUser._id
      };
      
      partner = new Partner(partnerData);
      await partner.save();
      console.log('   ✅ Tạo mới partner');
    } else {
      console.log('   ℹ️ Partner đã tồn tại');
    }

    // 3. Tạo hoặc tìm partner user
    console.log('\n3️⃣ Tạo partner user...');
    let partnerUser = await User.findOne({ email: 'partner@techsolutions.com' });
    
    if (!partnerUser) {
      const partnerHashedPassword = await bcrypt.hash('partner123', 10);
      const userData = {
        username: 'partner_user',
        email: 'partner@techsolutions.com',
        password: partnerHashedPassword,
        fullName: 'Nguyễn Văn Đối Tác',
        role: 'partner',
        status: 'active',
        dataScope: {
          partners: [partner._id]
        }
      };
      
      partnerUser = new User(userData);
      await partnerUser.save();
      console.log('   ✅ Tạo mới partner user');
    } else {
      console.log('   ℹ️ Partner user đã tồn tại');
    }

    // 4. Tạo hoặc tìm project
    console.log('\n4️⃣ Tạo project...');
    let project = await Project.findOne({ code: 'ECOMMERCE_2024' });
    
    if (!project) {
      const projectData = {
        name: 'Dự án E-commerce Platform',
        code: 'ECOMMERCE_2024',
        description: 'Phát triển nền tảng thương mại điện tử hiện đại',
        status: 'active',
        priority: 'high',
        partner: {
          id: partner._id,
          name: partner.name,
          contactPerson: partner.contact.primaryContact.name,
          email: partner.contact.primaryContact.email,
          phone: partner.contact.primaryContact.phone
        },
        gitConfig: {
          repository: 'https://github.com/techsolutions/ecommerce-platform',
          branch: 'main'
        },
        timeline: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          estimatedDuration: 365
        },
        createdBy: adminUser._id
      };
      
      project = new Project(projectData);
      await project.save();
      console.log('   ✅ Tạo mới project');
    } else {
      console.log('   ℹ️ Project đã tồn tại');
    }

    // 5. Tạo modules
    console.log('\n5️⃣ Tạo modules...');
    const modulesData = [
      {
        name: 'User Management Module',
        code: 'USER_MGMT',
        description: 'Quản lý người dùng, phân quyền và xác thực',
        status: 'completed',
        priority: 'high',
        project: project._id,
        delivery: {
          source: 'partner',
          partner: partner._id,
          team: 'partner-team'
        },
        timeline: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-03-31'),
          estimatedDuration: 90
        },
        technicalInfo: {
          technology: ['React', 'Node.js', 'MongoDB'],
          framework: ['Express', 'Redux'],
          database: 'MongoDB',
          estimatedEffort: 240
        },
        createdBy: adminUser._id
      },
      {
        name: 'Product Catalog Module',
        code: 'PRODUCT_CAT',
        description: 'Quản lý danh mục sản phẩm và thông tin chi tiết',
        status: 'in-development',
        priority: 'medium',
        project: project._id,
        delivery: {
          source: 'partner',
          partner: partner._id,
          team: 'partner-team'
        },
        timeline: {
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-05-31'),
          estimatedDuration: 120
        },
        technicalInfo: {
          technology: ['React', 'Node.js', 'MongoDB'],
          framework: ['Express', 'Redux'],
          database: 'MongoDB',
          estimatedEffort: 320
        },
        createdBy: adminUser._id
      },
      {
        name: 'Order Management Module',
        code: 'ORDER_MGMT',
        description: 'Xử lý đơn hàng, thanh toán và vận chuyển',
        status: 'planning',
        priority: 'high',
        project: project._id,
        delivery: {
          source: 'partner',
          partner: partner._id,
          team: 'partner-team'
        },
        timeline: {
          startDate: new Date('2024-04-01'),
          endDate: new Date('2024-08-31'),
          estimatedDuration: 150
        },
        technicalInfo: {
          technology: ['React', 'Node.js', 'MongoDB'],
          framework: ['Express', 'Redux'],
          database: 'MongoDB',
          estimatedEffort: 400
        },
        createdBy: adminUser._id
      }
    ];

    for (const moduleData of modulesData) {
      let module = await Module.findOne({ code: moduleData.code });
      if (!module) {
        module = new Module(moduleData);
        await module.save();
        console.log(`   ✅ Tạo mới module: ${module.name}`);
      } else {
        console.log(`   ℹ️ Module đã tồn tại: ${module.name}`);
      }
    }

    // 6. Cập nhật thống kê partner
    console.log('\n6️⃣ Cập nhật thống kê partner...');
    await partner.updateStatistics();
    console.log('   ✅ Đã cập nhật thống kê');

    console.log('\n🎉 Setup dữ liệu đối tác hoàn thành!');
    console.log('\n📋 Thông tin đăng nhập:');
    console.log('   Email: partner@techsolutions.com');
    console.log('   Password: partner123');
    console.log('   Role: partner');
    console.log('\n🔗 Truy cập portal đối tác: http://localhost:5173/partner');

  } catch (error) {
    console.error('\n❌ Lỗi setup dữ liệu:', error.message);
    if (error.code === 11000) {
      console.log('💡 Gợi ý: Dữ liệu có thể đã tồn tại, hãy kiểm tra lại');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Đã đóng kết nối MongoDB');
  }
}

setupPartnerData(); 