"use client"

import { useEffect, useState } from 'react'
import { initializeData, getTransactions, getBudget, saveBudget, Budget } from '@/lib/storage'
import { EXPENSE_CATEGORIES, CATEGORY_COLORS, getCurrentMonthKey, getMonthLabel, filterByMonth, sumByCategory } from '@/lib/data'

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function BudgetPage() {
  const [budget, setBudget] = useState<Budget>({})
  const [spent, setSpent] = useState<Record<string, number>>({})
  const [editing, setEditing] = useState<Record<string, string>>({})

  useEffect(() => {
    initializeData()
    const b = getBudget()
    setBudget(b)
    setEditing(Object.fromEntries(Object.entries(b).map(([k, v]) => [k, String(v)])))
    const txs = getTransactions()
    const monthKey = getCurrentMonthKey()
    const monthExpenses = filterByMonth(txs, monthKey).filter(t => t.type === 'expense')
    setSpent(sumByCategory(monthExpenses))
  }, [])

  const handleSave = (category: string) => {
    const val = parseFloat(editing[category])
    if (isNaN(val) || val < 0) return
    const updated = { ...budget, [category]: val }
    setBudget(updated)
    saveBudget(updated)
  }

  const totalBudget = EXPENSE_CATEGORIES.reduce((s, c) => s + (budget[c] || 0), 0)
  const totalSpent = EXPENSE_CATEGORIES.reduce((s, c) => s + (spent[c] || 0), 0)
  const overallPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  const monthLabel = getMonthLabel(getCurrentMonthKey())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
        <p className="text-gray-500 text-sm mt-1">{monthLabel} — click any amount to edit</p>
      </div>

      {/* Overall summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-600">Overall Budget</p>
            <p className="text-2xl font-bold text-gray-900">{fmt(totalSpent)} <span className="text-base font-normal text-gray-400">/ {fmt(totalBudget)}</span></p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${overallPct > 90 ? 'text-red-600' : overallPct > 70 ? 'text-yellow-500' : 'text-green-600'}`}>
              {overallPct.toFixed(0)}%
            </p>
            <p className="text-xs text-gray-400">used</p>
          </div>
        </div>
        <div className="h-3 rounded-full bg-gray-100">
          <div
            className={`h-3 rounded-full transition-all ${overallPct > 90 ? 'bg-red-500' : overallPct > 70 ? 'bg-yellow-400' : 'bg-green-500'}`}
            style={{ width: `${Math.min(overallPct, 100)}%` }}
          />
        </div>
      </div>

      {/* Per-category */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {EXPENSE_CATEGORIES.map(cat => {
          const budgeted = budget[cat] || 0
          const spentAmt = spent[cat] || 0
          const pct = budgeted > 0 ? (spentAmt / budgeted) * 100 : (spentAmt > 0 ? 100 : 0)
          const color = pct > 90 ? '#ef4444' : pct > 70 ? '#eab308' : '#22c55e'
          const remaining = budgeted - spentAmt

          return (
            <div key={cat} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{cat}</p>
                    <p className="text-xs text-gray-400">
                      {fmt(spentAmt)} spent · {remaining >= 0 ? fmt(remaining) + ' left' : fmt(Math.abs(remaining)) + ' over'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Budget: $</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={editing[cat] ?? String(budgeted)}
                    onChange={e => setEditing(ed => ({ ...ed, [cat]: e.target.value }))}
                    onBlur={() => handleSave(cat)}
                    onKeyDown={e => e.key === 'Enter' && handleSave(cat)}
                    className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
                />
              </div>
              {pct > 100 && (
                <p className="text-xs text-red-500 mt-1">Over budget by {fmt(spentAmt - budgeted)}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
