import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Findings from "./pages/Findings";
import TriggerScan from "./pages/TriggerScan";
import Repositories from "./pages/Repositories";

export default function App() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    setTheme(savedTheme === "light" ? "light" : "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  return (
    <Routes>
      <Route
        path="/*"
        element={
          <Layout theme={theme} onToggleTheme={toggleTheme}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/findings" element={<Findings />} />
              <Route path="/scan" element={<TriggerScan />} />
              <Route path="/repositories" element={<Repositories />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}
