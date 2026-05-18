import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Loader2 } from "lucide-react";

export default function TrendChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const response = await fetch("http://localhost:5002/api/findings/trend");
        if (!response.ok) throw new Error("Failed to fetch trend data");
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching trend data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrend();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="theme-card border border-theme-border p-4 rounded-xl shadow-glow text-sm">
          <p className="font-semibold mb-3 border-b border-theme-border pb-2 theme-text">
            {label}
          </p>
          <div className="space-y-1.5">
            {payload.map((entry, index) => (
              <div key={index} className="flex justify-between items-center gap-6">
                <span className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: entry.color }}
                  ></span>
                  <span className="theme-muted capitalize font-medium">{entry.name}</span>
                </span>
                <span className="font-bold theme-text">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="theme-card border border-theme-border rounded-2xl h-96 flex flex-col items-center justify-center shadow-glow">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
        <span className="theme-muted text-sm font-medium">Loading trend data...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="theme-card border border-theme-border rounded-2xl h-96 flex items-center justify-center shadow-glow">
        <span className="theme-muted text-sm font-medium">No trend data available.</span>
      </div>
    );
  }

  return (
    <div className="theme-card border border-theme-border rounded-2xl p-6 shadow-glow transition-all">
      <div className="mb-6">
        <h3 className="text-lg font-bold theme-text tracking-wide flex items-center gap-2">
          Detection Trend
        </h3>
        <p className="text-sm theme-muted mt-1">Total secrets detected over time categorized by severity</p>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(148, 163, 184, 0.2)', strokeWidth: 2 }} />
            
            <Line
              type="monotone"
              dataKey="total"
              name="Total Secrets"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "var(--card)" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            
            <Line
              type="monotone"
              dataKey="critical"
              name="Critical"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            
            <Line
              type="monotone"
              dataKey="high"
              name="High"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            
            <Line
              type="monotone"
              dataKey="medium"
              name="Medium"
              stroke="#eab308"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            
            <Line
              type="monotone"
              dataKey="low"
              name="Low"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
