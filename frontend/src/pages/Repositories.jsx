import React, { useState, useEffect } from "react";
import { Search, Loader2, Database, ShieldAlert, Clock, GitBranch } from "lucide-react";

export default function Repositories() {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const response = await fetch("http://localhost:5002/api/repositories");
        if (!response.ok) throw new Error("Failed to fetch repositories");
        const data = await response.json();
        setRepositories(data);
      } catch (err) {
        console.error("Error fetching repositories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  const filteredRepos = repositories.filter(repo => 
    repo.name.toLowerCase().includes(search.toLowerCase()) || 
    repo.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold theme-text tracking-wide flex items-center gap-2">
            <Database size={24} className="text-blue-500" />
            Repository Management
          </h1>
          <p className="theme-muted mt-1 text-sm">View all scanned repositories and their total findings.</p>
        </div>
      </div>

      <div className="theme-card border border-theme-border rounded-2xl p-6 shadow-glow">
        <div className="mb-6 w-full max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="theme-muted-soft" />
            </div>
            <input
              type="text"
              placeholder="Search repositories by name or URL..."
              className="w-full theme-input border border-theme-border rounded-xl pl-10 pr-4 py-2 placeholder-theme-muted focus:outline-none focus:border-blue-500 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 theme-muted">
            <Loader2 size={32} className="animate-spin mb-4 text-blue-500" />
            <p>Loading repositories...</p>
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="text-center py-12 theme-muted">
            <p>No repositories found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-theme-surface border-b border-theme-border">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider theme-muted">Repository</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider theme-muted">Findings</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider theme-muted">Last Scan</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepos.map((repo) => (
                  <tr key={repo.id} className="odd:bg-theme-surface even:bg-theme-card border-b border-theme-border hover:bg-theme-surface-strong transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold theme-text break-all">{repo.name}</span>
                        <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline break-all truncate max-w-[280px]">
                          {repo.url ? repo.url.replace("https://github.com/", "") : "Unknown repository"}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${repo.totalFindings > 0 ? "text-red-600 bg-red-500/10" : "text-emerald-600 bg-emerald-500/10"}`}>
                        {repo.totalFindings}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm theme-text" title={repo.lastScanTime ? new Date(repo.lastScanTime).toLocaleString() : "Never"}>
                        {repo.lastScanTime ? new Date(repo.lastScanTime).toLocaleDateString() : "Never"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
