import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  BanknotesIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const stats = [
  { id: 1, name: 'Total Expenses', stat: '$2,845.00', icon: BanknotesIcon, change: '+4.75%', changeType: 'positive' },
  { id: 2, name: 'Pending Approvals', stat: '12', icon: ClockIcon, change: '+54.02%', changeType: 'negative' },
  { id: 3, name: 'Approved This Month', stat: '24', icon: CheckCircleIcon, change: '+12.05%', changeType: 'positive' },
  { id: 4, name: 'Total Submissions', stat: '36', icon: DocumentTextIcon, change: '+24.05%', changeType: 'positive' },
];

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default function Dashboard() {
  const { user } = useAuthStore();

  useEffect(() => {
    // TODO: Fetch dashboard data
  }, []);

  return (
    <div>
      {/* Page header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-odoo-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="mt-1 text-sm text-odoo-gray-500">
            Here's what's happening with your expenses today.
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-odoo-gray-900 shadow-sm ring-1 ring-inset ring-odoo-gray-300 hover:bg-odoo-gray-50"
          >
            Export
          </button>
          <button
            type="button"
            className="ml-3 inline-flex items-center rounded-md bg-odoo-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-odoo-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-odoo-primary"
          >
            New Expense
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-odoo-primary p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-odoo-gray-500">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-odoo-gray-900">{item.stat}</p>
              <p
                className={classNames(
                  item.changeType === 'positive' ? 'text-green-600' : 'text-red-600',
                  'ml-2 flex items-baseline text-sm font-semibold'
                )}
              >
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Recent expenses */}
      <div className="mt-8">
        <div className="bg-white shadow sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-odoo-gray-900">Recent Expenses</h3>
            <div className="mt-5">
              <div className="flow-root">
                <ul role="list" className="-my-5 divide-y divide-odoo-gray-200">
                  {[
                    {
                      id: 1,
                      description: 'Office supplies',
                      amount: '$45.00',
                      date: '2024-01-15',
                      status: 'Pending',
                    },
                    {
                      id: 2,
                      description: 'Client lunch',
                      amount: '$125.50',
                      date: '2024-01-14',
                      status: 'Approved',
                    },
                    {
                      id: 3,
                      description: 'Travel expenses',
                      amount: '$320.00',
                      date: '2024-01-13',
                      status: 'Approved',
                    },
                  ].map((expense) => (
                    <li key={expense.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-odoo-gray-900 truncate">
                            {expense.description}
                          </p>
                          <p className="text-sm text-odoo-gray-500">
                            {expense.date}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium text-odoo-gray-900">
                            {expense.amount}
                          </div>
                          <span
                            className={classNames(
                              expense.status === 'Approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800',
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
                            )}
                          >
                            {expense.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <a
                  href="/dashboard/expenses"
                  className="text-sm font-medium text-odoo-primary hover:text-odoo-primary-dark"
                >
                  View all expenses
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-odoo-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-odoo-gray-500 truncate">Submit Expense</dt>
                  <dd className="text-sm text-odoo-gray-900">Create a new expense report</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-odoo-gray-50 px-5 py-3">
            <div className="text-sm">
              <button className="font-medium text-odoo-primary hover:text-odoo-primary-dark">
                Get started
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-odoo-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-odoo-gray-500 truncate">Review Approvals</dt>
                  <dd className="text-sm text-odoo-gray-900">Check pending expense approvals</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-odoo-gray-50 px-5 py-3">
            <div className="text-sm">
              <button className="font-medium text-odoo-primary hover:text-odoo-primary-dark">
                Review now
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-6 w-6 text-odoo-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-odoo-gray-500 truncate">View Analytics</dt>
                  <dd className="text-sm text-odoo-gray-900">Analyze spending patterns</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-odoo-gray-50 px-5 py-3">
            <div className="text-sm">
              <button className="font-medium text-odoo-primary hover:text-odoo-primary-dark">
                View reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}