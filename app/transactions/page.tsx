"use client"

import { useEffect, useState } from 'react'
import {
  initializeData, getTransactions, addTransaction, deleteTransaction,
  Transaction,
} from '@/lib/storage'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/data'

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2026, i, 1)
  return { value: `2026-${String(i + 1).padStart(2, '0')}`, label: d.toLocaleString('default', { month: 'long', year: 'numeric' }) }
})

const DEFAULT_FORM = {
  type: 'expense' as 'income' | 'expense',
  amount: '',
  category: 'Food',
  description: '',
  date: new Date().toISOString().slice(0, 10),
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filterMonth, setFilterMonth] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [error, setError] = useState('')

  useEffect(() => {
    initializeData()
    setTransactions(getTransactions())
  }, [])

  const reload = () => setTransactions(getTransactions())

  const handleDelete = (id: string) => {
    deleteTransaction(id)
    reload()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!form.amount || isNaN(amount) || amount <= 0) {
      setError('Enter a valid positive amount')
      return
    }
    if (!form.description.trim()) {
      setError('Description is required')
      return
    }
    addTransaction({
      id: crypto.randomUUID(),
      type: form.type,
      amount,
      category: form.category,
      description: form.description.trim(),
      date: form.date,
    })
    reload()
    setShowModal(false)
    setForm(DEFAULT_FORM)
    setError('')
  }

  const categories = form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const filtered = transactions
    .filter(t => !filterMonth || t.date.startsWith(filterMonth))
    .filter(t => !filterType || t.type === filterType)
    .filter(t => !filterCategory || t.category === filterCategory)
    .sort((a, b) => b.date.localeCompare(a.date))

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES.filter(c => c !== 'Other')]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError('') }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <select
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
        >
          <option value="">All months</option>
          {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
        >
          <option value="">All categories</option>
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          <option value="Other">Other</option>
        </select>
        {(filterMonth || filterType || filterCategory) && (
          <button
            onClick={() => { setFilterMonth(''); setFilterType(''); setFilterCategory('') }}
            className="text-sm text-gray-400 hover:text-gray-600 px-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-sm p-6">No transactions match your filters.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(t => (
              <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.description}</p>
                    <p className="text-xs text-gray-400">{t.category} · {t.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </span>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors text-xs px-2 py-1 rounded"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Add Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type toggle */}
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                {(['expense', 'income'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type, category: type === 'expense' ? 'Food' : 'Salary' }))}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      form.type === type
                        ? type === 'expense' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Grocery run"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm(DEFAULT_FORM); setError('') }}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
