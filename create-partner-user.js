const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');
const Partner = require('./models/partner.model');
const Project = require('./models/project.model');
const Module = require('./models/module.model');

async function createPartnerUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/software-dev-management');
    console.log('✅ Kết nối MongoDB thành công!');

    console.log('Bắt đầu tạo user đối tác...');

    // Tạo hoặc tìm user admin để làm createdBy
    const hashedPassword = await bcrypt.hash('admin123', 10);
    let adminUser = await User.findOne({ email: 'admin@devmanagement.com' });
    
    if (!adminUser) {
      adminUser = new User({
        username: 'admin',
        email: 'admin@devmanagement.com',
        password: hashedPassword,
        fullName: 'Administrator',
        role: 'admin',
        status: 'active'
      });
      await adminUser.save();
      console.log('✅ Đã tạo user admin:', adminUser.fullName);
    } else {
      console.log('✅ User admin đã tồn tại:', adminUser.fullName);
    }

    // Tạo partner
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

    let partner = await Partner.findOne({ code: partnerData.code });
    if (!partner) {
      partner = new Partner(partnerData);
      await partner.save();
      console.log('✅ Đã tạo partner:', partner.name);
    } else {
      console.log('✅ Partner đã tồn tại:', partner.name);
    }

    // Tạo user đối tác
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

    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = new User(userData);
      await user.save();
      console.log('✅ Đã tạo user đối tác:', user.fullName);
    } else {
      console.log('✅ User đối tác đã tồn tại:', user.fullName);
    }

    // Tạo project mẫu cho đối tác
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

    let project = await Project.findOne({ code: projectData.code });
    if (!project) {
      project = new Project(projectData);
      await project.save();
      console.log('✅ Đã tạo project:', project.name);
    } else {
      console.log('✅ Project đã tồn tại:', project.name);
    }

    // Tạo modules mẫu
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
        console.log('✅ Đã tạo module:', module.name);
      } else {
        console.log('✅ Module đã tồn tại:', module.name);
      }
    }

    // Cập nhật thống kê partner
    await partner.updateStatistics();

    console.log('\n🎉 Hoàn thành tạo dữ liệu đối tác!');
    console.log('\n📋 Thông tin đăng nhập:');
    console.log('Email: partner@techsolutions.com');
    console.log('Password: partner123');
    console.log('Role: partner');
    console.log('\n🔗 Truy cập portal đối tác: http://localhost:3000/partner');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    mongoose.connection.close();
  }
}

createPartnerUser(); 