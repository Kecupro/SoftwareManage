const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing login API...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'partner@techsolutions.com',
      password: 'partner123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
    if (error.toJSON) {
      console.log('Error.toJSON:', error.toJSON());
    }
    console.log('Error.message:', error.message);
    if (error.stack) {
      console.log('Error.stack:', error.stack);
    }
  }
}

testLogin(); 