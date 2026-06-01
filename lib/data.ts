import { Transaction } from './storage'

export const EXPENSE_CATEGORIES = ['Housing', 'Food', 'Transport', 'Entertainment', 'Health', 'Other']
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Other']

export const CATEGORY_COLORS: Record<string, string> = {
  Housing: '#6366f1',
  Food: '#f59e0b',
  Transport: '#10b981',
  Entertainment: '#f43f5e',
  Health: '#3b82f6',
  Other: '#8b5cf6',
  Salary: '#22c55e',
  Freelance: '#14b8a6',
  Investment: '#f97316',
}

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleString('default', { month: 'short', year: 'numeric' })
}

export function getCurrentMonthKey(): string {
  return getMonthKey(new Date())
}

export function getLast6MonthKeys(): string[] {
  const keys: string[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(getMonthKey(d))
  }
  return keys
}

export function filterByMonth(transactions: Transaction[], monthKey: string): Transaction[] {
  return transactions.filter(t => t.date.startsWith(monthKey))
}

export function sumByType(transactions: Transaction[], type: 'income' | 'expense'): number {
  return transactions
    .filter(t => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0)
}

export function sumByCategory(transactions: Transaction[]): Record<string, number> {
  const result: Record<string, number> = {}
  for (const t of transactions) {
    result[t.category] = (result[t.category] || 0) + t.amount
  }
  return result
}

export function getLast6MonthsChartData(transactions: Transaction[]) {
  const keys = getLast6MonthKeys()
  return keys.map(key => {
    const monthTx = filterByMonth(transactions, key)
    return {
      month: getMonthLabel(key),
      income: sumByType(monthTx, 'income'),
      expenses: sumByType(monthTx, 'expense'),
    }
  })
}

export function getExpenseBreakdown(transactions: Transaction[]) {
  const expenses = transactions.filter(t => t.type === 'expense')
  const total = expenses.reduce((sum, t) => sum + t.amount, 0)
  const byCat = sumByCategory(expenses)

  return Object.entries(byCat)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      color: CATEGORY_COLORS[category] || '#6b7280',
    }))
    .sort((a, b) => b.amount - a.amount)
}
