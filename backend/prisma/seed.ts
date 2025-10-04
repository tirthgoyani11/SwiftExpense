import { PrismaClient, UserRole, ExpenseCategory, ExpenseStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...');

  // Create a demo company
  const company = await prisma.company.upsert({
    where: { id: 'demo-company-id' },
    update: {},
    create: {
      id: 'demo-company-id',
      name: 'TechCorp India Private Limited',
      currencyCode: 'INR',
      country: 'India',
      settings: JSON.stringify({
        requireReceiptUpload: true,
        autoApprovalThreshold: 5000, // 5000 INR threshold
        allowMultiCurrency: true,
      }),
    },
  });

  console.log('✅ Created demo company');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@techcorp.in' },
    update: {},
    create: {
      id: 'admin-user-id',
      email: 'admin@techcorp.in',
      passwordHash: adminPassword,
      firstName: 'Rajesh',
      lastName: 'Sharma',
      role: UserRole.ADMIN,
      companyId: company.id,
      isActive: true,
      preferences: JSON.stringify({
        theme: 'light',
        notifications: true,
      }),
    },
  });

  console.log('✅ Created admin user');

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 12);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@techcorp.in' },
    update: {},
    create: {
      id: 'manager-user-id',
      email: 'manager@techcorp.in',
      passwordHash: managerPassword,
      firstName: 'Priya',
      lastName: 'Patel',
      role: UserRole.MANAGER,
      companyId: company.id,
      isActive: true,
      preferences: JSON.stringify({
        theme: 'light',
        notifications: true,
      }),
    },
  });

  console.log('✅ Created manager user');

  // Create employee user
  const employeePassword = await bcrypt.hash('employee123', 12);
  const employee = await prisma.user.upsert({
    where: { email: 'employee@techcorp.in' },
    update: {},
    create: {
      id: 'employee-user-id',
      email: 'employee@techcorp.in',
      passwordHash: employeePassword,
      firstName: 'Arjun',
      lastName: 'Kumar',
      role: UserRole.EMPLOYEE,
      companyId: company.id,
      managerId: manager.id,
      isActive: true,
      preferences: JSON.stringify({
        theme: 'light',
        notifications: true,
      }),
    },
  });

  console.log('✅ Created employee user');

  // Create sample expenses
  const sampleExpenses = [
    {
      id: 'expense-1',
      employeeId: employee.id,
      companyId: company.id,
      amount: 2500.00,
      originalCurrency: 'INR',
      convertedAmount: 2500.00,
      exchangeRate: 1.0,
      category: ExpenseCategory.FOOD,
      subcategory: 'Business Lunch',
      description: 'Client meeting lunch at Taj Hotel, Mumbai',
      expenseDate: new Date('2025-10-01'),
      status: ExpenseStatus.PENDING,
      location: JSON.stringify({ address: 'Taj Hotel, Colaba, Mumbai, Maharashtra', coordinates: { lat: 18.9220, lng: 72.8347 } }),
      tags: JSON.stringify(['client-meeting', 'lunch', 'mumbai']),
    },
    {
      id: 'expense-2',
      employeeId: employee.id,
      companyId: company.id,
      amount: 3200.00,
      originalCurrency: 'INR',
      convertedAmount: 3200.00,
      exchangeRate: 1.0,
      category: ExpenseCategory.OFFICE,
      subcategory: 'Supplies',
      description: 'Office supplies and stationery from Reliance Digital',
      expenseDate: new Date('2025-10-02'),
      status: ExpenseStatus.APPROVED,
      tags: JSON.stringify(['office-supplies', 'stationery']),
    },
    {
      id: 'expense-3',
      employeeId: employee.id,
      companyId: company.id,
      amount: 1800.00,
      originalCurrency: 'INR',
      convertedAmount: 1800.00,
      exchangeRate: 1.0,
      category: ExpenseCategory.TRAVEL,
      subcategory: 'Transportation',
      description: 'Uber to Bangalore airport for client visit',
      expenseDate: new Date('2025-10-03'),
      status: ExpenseStatus.DRAFT,
      tags: JSON.stringify(['travel', 'uber', 'bangalore']),
    },
    {
      id: 'expense-4',
      employeeId: employee.id,
      companyId: company.id,
      amount: 650.00,
      originalCurrency: 'INR',
      convertedAmount: 650.00,
      exchangeRate: 1.0,
      category: ExpenseCategory.TRAVEL,
      subcategory: 'Accommodation',
      description: 'Tea and snacks during travel - Railway station',
      expenseDate: new Date('2025-10-04'),
      status: ExpenseStatus.PENDING,
      tags: JSON.stringify(['travel', 'food', 'railway']),
    },
  ];

  for (const expenseData of sampleExpenses) {
    await prisma.expense.upsert({
      where: { id: expenseData.id },
      update: {},
      create: expenseData,
    });
  }

  console.log('✅ Created sample expenses');

  // Create approval workflow
  await prisma.approvalWorkflow.upsert({
    where: { id: 'default-workflow' },
    update: {},
    create: {
      id: 'default-workflow',
      companyId: company.id,
      name: 'Default Approval Workflow',
      description: 'Standard approval process for all expenses',
      rules: JSON.stringify({
        autoApprovalThreshold: 5000, // ₹5000 auto approval limit
        requiredApprovers: ['manager'],
        sequentialApproval: true,
      }),
      conditions: JSON.stringify({
        categories: ['ALL'],
        minAmount: 0,
        maxAmount: null,
      }),
      isActive: true,
      createdBy: admin.id,
    },
  });

  console.log('✅ Created approval workflow');

  // Create sample notifications
  await prisma.notification.create({
    data: {
      userId: manager.id,
      companyId: company.id,
      type: 'APPROVAL_REQUIRED',
      title: 'New Expense Requires Approval',
      message: 'Arjun Kumar submitted an expense for ₹2,500 that requires your approval.',
      data: JSON.stringify({ expenseId: 'expense-1', amount: 2500.00 }),
      read: false,
    },
  });

  console.log('✅ Created sample notifications');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📋 Demo Accounts for TechCorp India:');
  console.log('👨‍💼 Admin (Rajesh Sharma): admin@techcorp.in / admin123');
  console.log('👩‍💼 Manager (Priya Patel): manager@techcorp.in / manager123');
  console.log('👨‍💻 Employee (Arjun Kumar): employee@techcorp.in / employee123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });