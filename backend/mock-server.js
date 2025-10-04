const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock users data
const users = {
  'admin@techcorp.in': { 
    id: '1', 
    email: 'admin@techcorp.in', 
    password: 'admin123', 
    firstName: 'Rajesh', 
    lastName: 'Sharma', 
    role: 'ADMIN',
    company: { name: 'TechCorp India', currencyCode: 'INR' }
  },
  'manager@techcorp.in': { 
    id: '2', 
    email: 'manager@techcorp.in', 
    password: 'manager123', 
    firstName: 'Priya', 
    lastName: 'Patel', 
    role: 'MANAGER',
    company: { name: 'TechCorp India', currencyCode: 'INR' }
  },
  'employee@techcorp.in': { 
    id: '3', 
    email: 'employee@techcorp.in', 
    password: 'employee123', 
    firstName: 'Arjun', 
    lastName: 'Kumar', 
    role: 'EMPLOYEE',
    company: { name: 'TechCorp India', currencyCode: 'INR' }
  }
};

// Mock expenses data
let expenses = [
  {
    id: '1',
    employeeId: '3',
    employee: { firstName: 'Arjun', lastName: 'Kumar' },
    amount: 150.50,
    originalCurrency: 'USD',
    convertedAmount: 12540.75,
    category: 'TRAVEL',
    subcategory: 'Flight',
    description: 'Business trip to Mumbai',
    expenseDate: '2025-10-01',
    status: 'PENDING',
    createdAt: '2025-10-02T10:00:00Z'
  },
  {
    id: '2',
    employeeId: '3',
    employee: { firstName: 'Arjun', lastName: 'Kumar' },
    amount: 45.00,
    originalCurrency: 'INR',
    convertedAmount: 45.00,
    category: 'FOOD',
    subcategory: 'Client dinner',
    description: 'Team lunch with clients',
    expenseDate: '2025-10-03',
    status: 'APPROVED',
    createdAt: '2025-10-03T14:30:00Z'
  }
];

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users[email];
  if (user && user.password === password) {
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token: 'mock-jwt-token'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Expenses endpoints
app.get('/api/expenses', (req, res) => {
  res.json({
    success: true,
    data: {
      expenses: expenses,
      total: expenses.length,
      page: 1,
      totalPages: 1
    }
  });
});

app.post('/api/expenses', (req, res) => {
  const newExpense = {
    id: Date.now().toString(),
    employeeId: '3',
    employee: { firstName: 'Arjun', lastName: 'Kumar' },
    ...req.body,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  
  expenses.push(newExpense);
  
  res.json({
    success: true,
    data: newExpense
  });
});

app.post('/api/expenses/:id/approve', (req, res) => {
  const { id } = req.params;
  const { action, comments } = req.body;
  
  const expense = expenses.find(e => e.id === id);
  if (expense) {
    expense.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    expense.comments = comments;
  }
  
  res.json({
    success: true,
    data: expense
  });
});

// External API endpoints
app.get('/api/external/currencies', (req, res) => {
  res.json({
    success: true,
    currencies: [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
    ]
  });
});

app.get('/api/external/exchange-rates', (req, res) => {
  const { from, to } = req.query;
  
  // Mock exchange rates
  const rates = {
    'USD_INR': 83.15,
    'EUR_INR': 89.45,
    'GBP_INR': 103.20,
    'JPY_INR': 0.55,
    'INR_USD': 0.012,
    'INR_EUR': 0.011,
    'INR_GBP': 0.0097,
    'INR_JPY': 1.82
  };
  
  const rate = rates[`${from}_${to}`] || 1;
  
  res.json({
    success: true,
    rate: rate,
    from: from,
    to: to
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📊 Demo accounts ready for testing!`);
  console.log(`👨‍💼 Admin: admin@techcorp.in / admin123`);
  console.log(`👩‍💼 Manager: manager@techcorp.in / manager123`);
  console.log(`👨‍💻 Employee: employee@techcorp.in / employee123`);
});