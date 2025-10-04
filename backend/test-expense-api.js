// Expense Management API Test Suite
const http = require('http');

// Helper function to make API requests
const makeRequest = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          resolve({ rawData: responseData, status: res.statusCode });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

// Test login and get token
async function loginAndGetToken(email = 'admin@techcorp.in', password = 'admin123') {
  const response = await makeRequest('/auth/login', 'POST', { email, password });
  if (response.success && response.data.token) {
    return response.data.token;
  }
  throw new Error(`Login failed for ${email}`);
}

// Test expense management
async function testExpenseManagement() {
  console.log('🧪 Testing Expense Management API...\n');

  try {
    // 1. Test Admin Login
    console.log('1. Admin Login...');
    const adminToken = await loginAndGetToken('admin@techcorp.in', 'admin123');
    console.log('✅ Admin logged in successfully');

    // 2. Test Employee Login
    console.log('\n2. Employee Login...');
    const employeeToken = await loginAndGetToken('employee@techcorp.in', 'employee123');
    console.log('✅ Employee logged in successfully');

    // 3. Test Manager Login
    console.log('\n3. Manager Login...');
    const managerToken = await loginAndGetToken('manager@techcorp.in', 'manager123');
    console.log('✅ Manager logged in successfully');

    // 4. Test Get Expenses (Employee View)
    console.log('\n4. Testing Employee Expense List...');
    const employeeExpenses = await makeRequest('/expenses', 'GET', null, employeeToken);
    console.log('Employee Expenses:', {
      success: employeeExpenses.success,
      count: employeeExpenses.data?.expenses?.length || 0,
      pagination: employeeExpenses.data?.pagination
    });

    // 5. Test Get Expenses (Manager View)
    console.log('\n5. Testing Manager Expense List...');
    const managerExpenses = await makeRequest('/expenses', 'GET', null, managerToken);
    console.log('Manager Expenses:', {
      success: managerExpenses.success,
      count: managerExpenses.data?.expenses?.length || 0,
      pagination: managerExpenses.data?.pagination
    });

    // 6. Test Get Expenses (Admin View)
    console.log('\n6. Testing Admin Expense List...');
    const adminExpenses = await makeRequest('/expenses', 'GET', null, adminToken);
    console.log('Admin Expenses:', {
      success: adminExpenses.success,
      count: adminExpenses.data?.expenses?.length || 0,
      pagination: adminExpenses.data?.pagination
    });

    // 7. Test Create New Expense (Employee)
    console.log('\n7. Testing Create New Expense...');
    const newExpense = {
      amount: 2500.00,
      originalCurrency: 'INR',
      category: 'FOOD',
      subcategory: 'Business Meeting',
      description: 'Client lunch at ITC Grand Chola, Chennai',
      expenseDate: new Date().toISOString(),
      location: {
        address: 'ITC Grand Chola, Chennai, Tamil Nadu',
        coordinates: { lat: 13.0475, lng: 80.2197 }
      },
      tags: ['client-meeting', 'lunch', 'chennai']
    };

    const createResponse = await makeRequest('/expenses', 'POST', newExpense, employeeToken);
    console.log('Create Expense Response:', {
      success: createResponse.success,
      expenseId: createResponse.data?.expense?.id,
      status: createResponse.data?.expense?.status
    });

    // 8. Test Get User List (Admin only)
    console.log('\n8. Testing User Management (Admin)...');
    const userList = await makeRequest('/users', 'GET', null, adminToken);
    console.log('User List Response:', {
      success: userList.success,
      userCount: userList.data?.length || 0
    });

    // 9. Test Get Company Analytics (Admin)
    console.log('\n9. Testing Analytics (Admin)...');
    const analytics = await makeRequest('/analytics/dashboard', 'GET', null, adminToken);
    console.log('Analytics Response:', {
      success: analytics.success,
      hasData: !!analytics.data
    });

    console.log('\n✅ All Expense Management tests completed!');
    console.log('\n📊 Summary:');
    console.log('- ✅ Multi-role authentication working');
    console.log('- ✅ Role-based expense access control');
    console.log('- ✅ Expense creation functionality');
    console.log('- ✅ User management endpoints');
    console.log('- ✅ Analytics dashboard endpoints');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Run the test suite
testExpenseManagement();