"use client"

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string // ISO date string YYYY-MM-DD
}

export interface Budget {
  [category: string]: number
}

const TRANSACTIONS_KEY = 'trackit_transactions'
const BUDGET_KEY = 'trackit_budget'

const SEED_TRANSACTIONS: Transaction[] = [
  // May 2026
  { id: '1', type: 'income', amount: 5200, category: 'Salary', description: 'Monthly salary', date: '2026-05-01' },
  { id: '2', type: 'expense', amount: 1800, category: 'Housing', description: 'Rent payment', date: '2026-05-02' },
  { id: '3', type: 'expense', amount: 120, category: 'Food', description: 'Grocery shopping', date: '2026-05-04' },
  { id: '4', type: 'expense', amount: 55, category: 'Transport', description: 'Monthly bus pass', date: '2026-05-05' },
  { id: '5', type: 'income', amount: 800, category: 'Freelance', description: 'Web design project', date: '2026-05-10' },
  { id: '6', type: 'expense', amount: 85, category: 'Entertainment', description: 'Netflix + Spotify', date: '2026-05-11' },
  { id: '7', type: 'expense', amount: 200, category: 'Food', description: 'Restaurants & dining out', date: '2026-05-15' },
  { id: '8', type: 'expense', amount: 60, category: 'Health', description: 'Gym membership', date: '2026-05-16' },
  { id: '9', type: 'expense', amount: 45, category: 'Transport', description: 'Gas station', date: '2026-05-20' },
  { id: '10', type: 'income', amount: 150, category: 'Investment', description: 'Dividend payout', date: '2026-05-22' },
  { id: '11', type: 'expense', amount: 95, category: 'Other', description: 'Amazon purchases', date: '2026-05-25' },
  // April 2026
  { id: '12', type: 'income', amount: 5200, category: 'Salary', description: 'Monthly salary', date: '2026-04-01' },
  { id: '13', type: 'expense', amount: 1800, category: 'Housing', description: 'Rent payment', date: '2026-04-02' },
  { id: '14', type: 'expense', amount: 145, category: 'Food', description: 'Grocery shopping', date: '2026-04-06' },
  { id: '15', type: 'expense', amount: 55, category: 'Transport', description: 'Monthly bus pass', date: '2026-04-05' },
  { id: '16', type: 'expense', amount: 175, category: 'Entertainment', description: 'Concert tickets', date: '2026-04-14' },
  { id: '17', type: 'expense', amount: 90, category: 'Health', description: 'Doctor visit copay', date: '2026-04-18' },
  { id: '18', type: 'income', amount: 500, category: 'Freelance', description: 'Logo design', date: '2026-04-20' },
  { id: '19', type: 'expense', amount: 220, category: 'Food', description: 'Restaurants & dining out', date: '2026-04-22' },
  // March 2026
  { id: '20', type: 'income', amount: 5200, category: 'Salary', description: 'Monthly salary', date: '2026-03-01' },
  { id: '21', type: 'expense', amount: 1800, category: 'Housing', description: 'Rent payment', date: '2026-03-02' },
  { id: '22', type: 'expense', amount: 130, category: 'Food', description: 'Grocery shopping', date: '2026-03-07' },
  { id: '23', type: 'expense', amount: 55, category: 'Transport', description: 'Monthly bus pass', date: '2026-03-05' },
  { id: '24', type: 'expense', amount: 70, category: 'Entertainment', description: 'Movie & dinner', date: '2026-03-15' },
  { id: '25', type: 'expense', amount: 150, category: 'Health', description: 'Prescription medication', date: '2026-03-20' },
  { id: '26', type: 'income', amount: 200, category: 'Investment', description: 'Stock dividend', date: '2026-03-25' },
  { id: '27', type: 'expense', amount: 75, category: 'Other', description: 'Household items', date: '2026-03-28' },
]

const SEED_BUDGET: Budget = {
  Housing: 2000,
  Food: 600,
  Transport: 300,
  Entertainment: 200,
  Health: 200,
  Other: 300,
}

export function initializeData(): void {
  if (typeof window === 'undefined') return
  const existing = localStorage.getItem(TRANSACTIONS_KEY)
  if (!existing) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(SEED_TRANSACTIONS))
    localStorage.setItem(BUDGET_KEY, JSON.stringify(SEED_BUDGET))
  }
}

export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(TRANSACTIONS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
}

export function addTransaction(transaction: Transaction): void {
  const transactions = getTransactions()
  transactions.push(transaction)
  saveTransactions(transactions)
}

export function deleteTransaction(id: string): void {
  const transactions = getTransactions()
  saveTransactions(transactions.filter(t => t.id !== id))
}

export function getBudget(): Budget {
  if (typeof window === 'undefined') return {}
  const data = localStorage.getItem(BUDGET_KEY)
  return data ? JSON.parse(data) : SEED_BUDGET
}

export function saveBudget(budget: Budget): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budget))
}
