import { useState, useRef, useEffect } from "react";

export default function StatusBadge({ status, secretId, onStatusChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef(null);

  const statusStyles = {
    OPEN: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700',
    RESOLVED: 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700',
    ACCEPTED_RISK: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-gray-700/20 dark:text-gray-300 dark:border-gray-600',
  };

  const statusOptions = ["OPEN", "IN_PROGRESS", "RESOLVED", "ACCEPTED_RISK"];

  const handleStatusChange = async (newStatus) => {
    if (newStatus === status || !secretId) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`http://localhost:5002/api/findings/${secretId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      onStatusChange?.(newStatus);
      setIsOpen(false);
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!secretId) {
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusStyles[status] || statusStyles.OPEN}`}>
        {status}
      </span>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer hover:opacity-80 transition ${statusStyles[status] || statusStyles.OPEN} ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isUpdating ? "Updating..." : status}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 theme-card border border-theme-border rounded-lg shadow-lg overflow-hidden">
          {statusOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleStatusChange(option)}
              disabled={isUpdating}
              className={`w-full text-left px-3 py-2 text-xs theme-text theme-hover transition ${option === status ? "font-semibold theme-hover" : ""} ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
