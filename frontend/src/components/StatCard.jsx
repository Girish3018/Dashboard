import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, FolderGit2 } from "lucide-react";

export default function StatCard({ title, value, details = [] }) {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setExpanded(false);
      }
    };
    if (expanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  return (
    <div 
      ref={cardRef}
      className={`relative theme-card border border-theme-border rounded-2xl p-6 shadow-glow transition-all duration-300 ${details.length > 0 ? "cursor-pointer theme-hover" : "hover:scale-[1.02]"}`}
      onClick={() => details.length > 0 && setExpanded(!expanded)}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="theme-muted text-xs font-semibold tracking-wider uppercase">{title}</p>
          <h2 className="text-4xl font-bold mt-2 theme-text bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">{value}</h2>
        </div>
        {details.length > 0 && (
          <div className={`p-1.5 rounded-lg border transition-all duration-300 ${expanded ? 'bg-blue-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400' : 'theme-hover border-theme-border theme-muted'}`}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        )}
      </div>

      {expanded && details.length > 0 && (
        <div 
          className="absolute top-[calc(100%+8px)] left-0 w-full z-50 theme-surface border border-theme-border rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] p-4 cursor-default transform origin-top transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <h4 className="text-xs theme-muted font-semibold mb-3 tracking-wider uppercase border-b border-theme-border pb-2">Scanned Repositories</h4>
          <div className="max-h-56 overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-2.5">
              {details.map((detail, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 px-3 py-1.5 theme-input border border-theme-border-60 rounded-lg text-xs font-medium theme-muted hover:text-gray-900 dark:hover:text-white hover:border-theme-border theme-hover transition-all"
                >
                  <FolderGit2 size={14} className="text-blue-600 dark:text-blue-400" />
                  <span className="truncate max-w-[200px]">{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
