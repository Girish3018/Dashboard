import { useState } from "react";
import { Play, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function TriggerScan() {
  const [repoUrl, setRepoUrl] = useState("");
  const [branches, setBranches] = useState("");
  const [status, setStatus] = useState("idle"); // idle, scanning, success, error
  const [message, setMessage] = useState("");

  const handleScan = async (e) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setStatus("scanning");
    setMessage("Initializing scan pipeline...");

    try {
      const response = await fetch("http://localhost:5002/api/scan/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          branches: branches.split(",").map(b => b.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to trigger scan");

      setStatus("success");
      setMessage(data.message || "Scan completed successfully! Check findings dashboard.");
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold theme-text tracking-wide">Trigger Scan</h1>
        <p className="theme-muted mt-1">Manually initiate a secrets detection scan on a target repository.</p>
      </div>

      <div className="theme-card border border-theme-border rounded-2xl p-6 shadow-glow">
        <form onSubmit={handleScan} className="space-y-6">
          <div>
            <label className="block text-sm font-medium theme-muted mb-2">Repository URL <span className="text-red-600 dark:text-red-400">*</span></label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/org/repo.git"
              className="w-full theme-input border border-theme-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              required
              disabled={status === "scanning"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium theme-muted mb-2">Target Branches</label>
            <input
              type="text"
              value={branches}
              onChange={(e) => setBranches(e.target.value)}
              placeholder="main, develop, feature-branch (comma separated)"
              className="w-full theme-input border border-theme-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              disabled={status === "scanning"}
            />
            <p className="text-xs theme-muted mt-2">Leave blank to scan the default branch.</p>
          </div>

          <button
            type="submit"
            disabled={status === "scanning" || !repoUrl.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "scanning" ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            {status === "scanning" ? "Scanning..." : "Start Scan"}
          </button>
        </form>
      </div>

      {status !== "idle" && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
          status === "scanning" ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400" :
          status === "success" ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400" :
          "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400"
        }`}>
          {status === "scanning" && <Loader2 size={20} className="animate-spin mt-0.5 shrink-0" />}
          {status === "success" && <CheckCircle2 size={20} className="mt-0.5 shrink-0" />}
          {status === "error" && <XCircle size={20} className="mt-0.5 shrink-0" />}
          
          <div>
            <h4 className="font-semibold text-sm">
              {status === "scanning" ? "Scan in Progress" : status === "success" ? "Scan Complete" : "Scan Failed"}
            </h4>
            <p className="text-sm mt-1 opacity-90">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
