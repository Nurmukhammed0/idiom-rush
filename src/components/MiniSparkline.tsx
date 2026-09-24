import { LineChart, Line, ResponsiveContainer } from 'recharts';

export function MiniSparkline({
  data,
  color,
  icon,
  label,
  total,
}: {
  data: number[];
  color: string;
  icon: string;
  label: string;
  total: number;
}) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
          <span>{icon}</span> {label}
        </span>
        <span className="text-lg font-extrabold text-gray-900">{total}</span>
      </div>
      <div style={{ width: '100%', height: 36 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
