import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import TrendChart from "../components/TrendChart";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSecrets: "0",
    criticalExposures: "0",
    activeIncidents: "0",
    repositoriesScanned: "0",
    scannedReposList: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5002/api/findings/stats");

        if (!response.ok) throw new Error("Failed to fetch stats");

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Secrets" value={loading ? "..." : stats.totalSecrets} />
        <StatCard title="Critical Exposures" value={loading ? "..." : stats.criticalExposures} />
        <StatCard title="Active Incidents" value={loading ? "..." : stats.activeIncidents} />
        <StatCard 
          title="Repos Scanned" 
          value={loading ? "..." : stats.repositoriesScanned} 
          details={stats.scannedReposList || []}
        />
      </div>

      <div className="w-full">
        <TrendChart />
      </div>
    </div>
  );
}
