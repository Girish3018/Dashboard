import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children, theme, onToggleTheme }) {
  return (
    <div className="flex min-h-screen theme-surface transition-theme">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar theme={theme} onToggleTheme={onToggleTheme} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
