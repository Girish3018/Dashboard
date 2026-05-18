import React, { useState, useEffect, useContext } from "react";
import SeverityBadge from "./SeverityBadge";
import StatusBadge from "./StatusBadge";

export default function FindingsTable() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFinding, setSelectedFinding] = useState(null);

  const handleRowClick = (finding) => {
    setSelectedFinding(finding);
  };
  
  const closeDrawer = () => {
    setSelectedFinding(null);
  };

  useEffect(() => {
    const fetchFindings = async () => {
      try {
        const response = await fetch("http://localhost:5002/api/findings");

        if (!response.ok) throw new Error("Failed to fetch findings");

        const data = await response.json();
        setFindings(data);
      } catch (err) {
        console.error("Error fetching findings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFindings();
  }, []);

  const handleStatusChange = (secretId, newStatus) => {
    setFindings((prevFindings) =>
      prevFindings.map((finding) =>
        finding.id === secretId ? { ...finding, status: newStatus } : finding
      )
    );
  };

  const getGitHubUrl = (repo, filePath) => {
    const githubOrg = "your-github-org"; // Change this to your GitHub org
    const branch = "main";
    const encodedPath = filePath.replace(/\s+/g, '%20');
    return `https://github.com/${githubOrg}/${repo}/blob/${branch}/${encodedPath}`;
  };



  // Filter by time range
  const filtered = findings.filter((item) => {
    const matchesSearch =
      item.secretType.toLowerCase().includes(search.toLowerCase()) ||
      item.repo.toLowerCase().includes(search.toLowerCase()) ||
      item.committerEmail.toLowerCase().includes(search.toLowerCase());

    const matchesSeverityFilter =
      filter === "All" || item.severity === filter;

    const matchesStatusFilter =
      statusFilter === "All" || item.status === statusFilter;

    let matchesTimeFilter = true;
    if (timeFilter !== "All") {
      const itemDate = new Date(item.time);
      const now = new Date();
      const diffTime = now - itemDate;
      const diffHours = diffTime / (1000 * 60 * 60);
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (timeFilter === "24h") {
        matchesTimeFilter = diffHours <= 24;
      } else if (timeFilter === "7d") {
        matchesTimeFilter = diffDays <= 7;
      } else if (timeFilter === "30d") {
        matchesTimeFilter = diffDays <= 30;
      }
    }

    return matchesSearch && matchesSeverityFilter && matchesStatusFilter && matchesTimeFilter;
  });

  const finalFiltered = filtered;

  if (loading) {
    return (
      <div className="theme-card border border-theme-border rounded-2xl p-6 shadow-glow">
        <div className="text-center theme-muted">Loading findings...</div>
      </div>
    );
  }

  return (
    <div className="theme-card border border-theme-border rounded-2xl p-6 shadow-glow">
      <div className="flex flex-col gap-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
          <select
            className="w-full theme-input border border-theme-border rounded-xl px-4 py-2 theme-text text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">Severity: All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            className="w-full theme-input border border-theme-border rounded-xl px-4 py-2 theme-text text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Status: All</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="ROTATED">ROTATED</option>
            <option value="ACCEPTED_RISK">ACCEPTED_RISK</option>
          </select>

          <select
            className="w-full theme-input border border-theme-border rounded-xl px-4 py-2 theme-text text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="All">Time: All</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

        </div>

        <div className="w-full">
          <input
            type="text"
            placeholder="Search findings, repos, or email..."
            className="w-full theme-input border border-theme-border rounded-xl px-4 py-2 placeholder-theme-muted focus:outline-none focus:border-blue-500 transition"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-theme-border theme-muted">
              <th className="pb-4 px-2">Secret Type</th>
              <th className="pb-4 px-2">Repo</th>
              <th className="pb-4 px-2">File Path</th>
              <th className="pb-4 px-2">Severity</th>
              <th className="pb-4 px-2">Workflow Status</th>
              <th className="pb-4 px-2">Time</th>
            </tr>
          </thead>

          <tbody>
            {finalFiltered.map((item, index) => {
              const isSelected = selectedFinding?.id === item.id;
              return (
                <React.Fragment key={index}>
                  <tr 
                    className={`border-b border-theme-border theme-hover transition cursor-pointer ${isSelected ? 'theme-overlay' : ''}`}
                    onClick={() => handleRowClick(item)}
                  >
                    <td className="py-4 px-2 theme-text font-medium">{item.secretType}</td>
                    <td className="py-4 px-2 theme-muted">{item.repo}</td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <code className="text-xs bg-theme-code px-2 py-1 rounded">
                          {item.filePath.length > 30 ? item.filePath.substring(0, 27) + '...' : item.filePath}
                        </code>
                        <a
                          href={item.sourceUrl || getGitHubUrl(item.repo, item.filePath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="theme-muted hover:text-blue-600 dark:hover:text-blue-400 transition"
                          title="View on GitHub"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 100 2h3.414l-8.707 8.707a1 1 0 001.414 1.414L15.414 6.414V10a1 1 0 102 0V3a1 1 0 00-1-1h-6z"></path>
                          </svg>
                        </a>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <SeverityBadge level={item.severity} />
                    </td>
                    <td className="py-4 px-2" onClick={(e) => e.stopPropagation()}>
                      <StatusBadge
                        status={item.status}
                        secretId={item.id}
                        onStatusChange={(newStatus) => handleStatusChange(item.id, newStatus)}
                      />
                    </td>
                    <td className="py-4 px-2 theme-muted-soft text-xs">{new Date(item.time).toLocaleDateString()}</td>
                  </tr>

                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {finalFiltered.length === 0 && (
        <div className="text-center theme-muted py-8">
          No findings match your search criteria
        </div>
      )}

      <div className="mt-4 text-xs theme-muted-soft">
        Showing {finalFiltered.length} of {findings.length} findings
      </div>

      {selectedFinding && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity" onClick={closeDrawer}>
          <div 
            className="w-full max-w-2xl h-full theme-card border-l border-theme-border shadow-2xl flex flex-col transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-theme-border">
              <h2 className="text-lg font-semibold theme-text">Secret Details</h2>
              <button onClick={closeDrawer} className="p-2 rounded-lg theme-hover theme-muted hover:text-gray-900 dark:hover:text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Overview */}
              <div>
                <h3 className="text-sm font-semibold theme-muted uppercase tracking-wider mb-4 border-b border-theme-border pb-2">Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="theme-muted-soft text-sm">Verdict</span>
                    <span className="theme-text text-sm font-medium">{selectedFinding.verdict || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="theme-muted-soft text-sm">Confidence</span>
                    <span className="theme-text text-sm font-medium">{selectedFinding.confidence || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="theme-muted-soft text-sm">Risk</span>
                    <SeverityBadge level={selectedFinding.severity} />
                  </div>
                  <div className="flex justify-between">
                    <span className="theme-muted-soft text-sm">Active</span>
                    <span className={`text-sm font-medium ${selectedFinding.isActive ? 'text-red-400' : 'text-green-400'}`}>
                      {selectedFinding.isActive ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Context */}
              <div>
                <h3 className="text-sm font-semibold theme-muted uppercase tracking-wider mb-4 border-b border-theme-border pb-2">Context</h3>
                <div className="space-y-3">
                  <div>
                    <span className="block theme-muted-soft text-xs mb-1">Repo</span>
                    <span className="theme-text text-sm">{selectedFinding.repo}</span>
                  </div>
                  <div>
                    <span className="block theme-muted-soft text-xs mb-1">File</span>
                    <code className="text-xs bg-theme-code px-2 py-1 rounded break-all">{selectedFinding.filePath}</code>
                  </div>
                  <div>
                    <span className="block theme-muted-soft text-xs mb-1">Branch</span>
                    <span className="theme-text text-sm">main</span>
                  </div>
                  <div>
                    <span className="block theme-muted-soft text-xs mb-1">Author Email</span>
                    <span className="theme-text text-sm break-all">{selectedFinding.committerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Evidence */}
              <div>
                <h3 className="text-sm font-semibold theme-muted uppercase tracking-wider mb-4 border-b border-theme-border pb-2">Evidence</h3>
                {selectedFinding.evidence && selectedFinding.evidence.length > 0 ? (
                  <ul className="list-disc list-inside theme-muted text-sm space-y-2">
                    {selectedFinding.evidence.map((ev, i) => (
                      <li key={i} className="break-all">{ev}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="theme-muted-soft text-sm italic">No evidence details available.</p>
                )}
              </div>

              {/* Reasoning */}
              <div>
                <h3 className="text-sm font-semibold theme-muted uppercase tracking-wider mb-4 border-b border-theme-border pb-2">AI Reasoning</h3>
                {selectedFinding.reasoning ? (
                  <p className="theme-muted text-sm whitespace-pre-wrap">{selectedFinding.reasoning}</p>
                ) : (
                  <p className="theme-muted-soft text-sm italic">No reasoning provided.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
