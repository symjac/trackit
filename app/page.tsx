"use client"

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { initializeData, getTransactions, getBudget, Transaction, Budget } from '@/lib/storage'
import {
  getCurrentMonthKey, getMonthLabel, filterByMonth, sumByType,
  getLast6MonthsChartData, getExpenseBreakdown,
} from '@/lib/data'
import SummaryCard from '@/components/SummaryCard'

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budget, setBudget] = useState<Budget>({})

  useEffect(() => {
    initializeData()
    setTransactions(getTransactions())
    setBudget(getBudget())
  }, [])

  const monthKey = getCurrentMonthKey()
  const monthLabel = getMonthLabel(monthKey)
  const monthTx = filterByMonth(transactions, monthKey)
  const income = sumByType(monthTx, 'income')
  const expenses = sumByType(monthTx, 'expense')
  const net = income - expenses
  const totalBudget = Object.values(budget).reduce((a, b) => a + b, 0)
  const budgetRemaining = totalBudget - expenses

  const chartData = getLast6MonthsChartData(transactions)
  const breakdown = getExpenseBreakdown(monthTx)
  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{monthLabel} overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Income" value={fmt(income)} icon="💵" color="green" subtitle={monthLabel} />
        <SummaryCard title="Total Expenses" value={fmt(expenses)} icon="💳" color="red" subtitle={monthLabel} />
        <SummaryCard title="Net Balance" value={fmt(net)} icon="📊" color={net >= 0 ? 'blue' : 'red'} subtitle={monthLabel} />
        <SummaryCard title="Budget Remaining" value={fmt(budgetRemaining)} icon="🎯" color={budgetRemaining >= 0 ? 'indigo' : 'red'} subtitle={`of ${fmt(totalBudget)}`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Income vs Expenses chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Income vs Expenses (6 months)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => '$' + (v >= 1000 ? (v/1000).toFixed(0) + 'k' : v)} />
              <Tooltip formatter={(v) => typeof v === 'number' ? fmt(v) : v} />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Expense Breakdown — {monthLabel}</h2>
          {breakdown.length === 0 ? (
            <p className="text-gray-400 text-sm">No expenses this month</p>
          ) : (
            <div className="space-y-3">
              {breakdown.map(item => (
                <div key={item.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{item.category}</span>
                    <span className="text-gray-500">{fmt(item.amount)} · {item.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Recent Transactions</h2>
          <a href="/transactions" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View all →</a>
        </div>
        {recent.length === 0 ? (
          <p className="text-gray-400 text-sm">No transactions yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recent.map(t => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.description}</p>
                  <p className="text-xs text-gray-400">{t.category} · {t.date}</p>
                </div>
                <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
