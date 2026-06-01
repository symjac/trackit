interface SummaryCardProps {
  title: string
  value: string
  subtitle?: string
  color?: 'blue' | 'green' | 'red' | 'indigo' | 'gray'
  icon?: string
}

const colorMap = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  gray: 'bg-gray-50 border-gray-200 text-gray-700',
}

const valueColorMap = {
  blue: 'text-blue-900',
  green: 'text-green-900',
  red: 'text-red-900',
  indigo: 'text-indigo-900',
  gray: 'text-gray-900',
}

export default function SummaryCard({ title, value, subtitle, color = 'indigo', icon }: SummaryCardProps) {
  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-sm font-medium ${colorMap[color].split(' ').pop()}`}>{title}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className={`text-2xl font-bold ${valueColorMap[color]}`}>{value}</p>
      {subtitle && <p className="text-xs mt-1 opacity-70">{subtitle}</p>}
    </div>
  )
}
