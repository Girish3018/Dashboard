export default function SeverityBadge({ level }) {
  const styles = {
    Critical: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    High: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
    Medium: "bg-amber-100 text-amber-700 dark:bg-yellow-500/20 dark:text-yellow-300",
    Low: "bg-emerald-100 text-emerald-700 dark:bg-green-500/20 dark:text-green-400",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[level]}`}>
      {level}
    </span>
  );
}
