import { useState } from "react";
import { Shield, Search, Lock, PlayCircle, Database } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getNavClass = ({ isActive }) =>
    `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 font-medium tracking-wide ${
      isActive
        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
        : "theme-muted hover:bg-theme-surface-strong hover:text-gray-900 dark:hover:text-white"
    } ${isCollapsed ? "justify-center" : "justify-start"}`;

  return (
    <aside className={`${isCollapsed ? "w-20" : "w-64"} bg-theme-surface border-r border-theme-border p-5 hidden md:flex flex-shrink-0 relative overflow-visible flex-col transition-all duration-300`}>
      {/* Decorative top glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-blue-500/5 blur-[50px] -z-10 rounded-full pointer-events-none transition-all duration-300"></div>



      <div 
        className={`flex items-center mb-10 mt-2 z-10 transition-all cursor-pointer hover:opacity-80 ${isCollapsed ? "justify-center" : "gap-3"}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] shrink-0">
          <Lock size={22} className="text-blue-600 dark:text-blue-400" />
        </div>
        {!isCollapsed && (
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 tracking-wider whitespace-nowrap overflow-hidden">
            Secret SOC
          </h1>
        )}
      </div>

      <nav className="space-y-3 z-10 flex-1">
        <NavLink to="/" className={getNavClass} title={isCollapsed ? "Dashboard" : ""}>
          <Shield size={18} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Dashboard</span>}
        </NavLink>

        <NavLink to="/findings" className={getNavClass} title={isCollapsed ? "Findings" : ""}>
          <Search size={18} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Findings</span>}
        </NavLink>

        <NavLink to="/repositories" className={getNavClass} title={isCollapsed ? "Repositories" : ""}>
          <Database size={18} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Repositories</span>}
        </NavLink>

        <NavLink to="/scan" className={getNavClass} title={isCollapsed ? "Trigger Scan" : ""}>
          <PlayCircle size={18} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Trigger Scan</span>}
        </NavLink>
      </nav>
      
      <div className="mt-auto pt-8 z-10 overflow-hidden">
        <div className={`theme-surface-soft-alpha rounded-xl border border-theme-border-30 flex items-center shadow-inner transition-all ${isCollapsed ? "justify-center p-3" : "p-4 gap-3"}`}>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse shrink-0"></div>
          {!isCollapsed && <span className="text-xs theme-muted font-medium whitespace-nowrap overflow-hidden">System Online</span>}
        </div>
      </div>
    </aside>
  );
}
