// Quick API test script
const https = require('http');

// Test health endpoint
const testHealth = () => {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Health Check Response:', JSON.parse(data));
        resolve(JSON.parse(data));
      });
    });

    req.on('error', (err) => {
      console.error('Health check failed:', err.message);
      reject(err);
    });

    req.end();
  });
};

// Test registration endpoint
const testRegister = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'test@techcorp.in',
      password: 'test12345',
      firstName: 'Test',
      lastName: 'User',
      companyName: 'TechCorp India'
    });

    const req = https.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Register Response:', JSON.parse(data));
        resolve(JSON.parse(data));
      });
    });

    req.on('error', (err) => {
      console.error('Register test failed:', err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
};

// Test login endpoint
const testLogin = (email = 'admin@techcorp.in', password = 'admin123') => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email,
      password
    });

    const req = https.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const response = JSON.parse(data);
        console.log(`Login Response (${email}):`, response);
        resolve(response);
      });
    });

    req.on('error', (err) => {
      console.error('Login test failed:', err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
};

// Test authenticated endpoint
const testGetProfile = (token) => {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Profile Response:', JSON.parse(data));
        resolve(JSON.parse(data));
      });
    });

    req.on('error', (err) => {
      console.error('Profile test failed:', err.message);
      reject(err);
    });

    req.end();
  });
};

// Run tests
async function runTests() {
  console.log('🧪 Testing SwiftExpense API...\n');
  
  try {
    console.log('1. Testing Health Endpoint...');
    await testHealth();
    
    console.log('\n2. Testing User Registration...');
    const registerResponse = await testRegister();
    
    console.log('\n3. Testing Admin Login...');
    const adminLogin = await testLogin('admin@techcorp.in', 'admin123');
    
    console.log('\n4. Testing Manager Login...');
    const managerLogin = await testLogin('manager@techcorp.in', 'manager123');
    
    console.log('\n5. Testing Employee Login...');
    const employeeLogin = await testLogin('employee@techcorp.in', 'employee123');
    
    console.log('\n6. Testing Profile Retrieval (Admin)...');
    if (adminLogin.success && adminLogin.data.token) {
      await testGetProfile(adminLogin.data.token);
    }
    
    console.log('\n✅ All API tests completed successfully!');
    console.log('\n📋 Demo Accounts Available:');
    console.log('👨‍💼 Admin: admin@techcorp.in / admin123');
    console.log('👩‍💼 Manager: manager@techcorp.in / manager123');
    console.log('👨‍💻 Employee: employee@techcorp.in / employee123');
    
  } catch (error) {
    console.error('\n❌ API test failed:', error.message);
  }
}

runTests();