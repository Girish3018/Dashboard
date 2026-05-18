export default function GrafanaFrame({ url, title, height = "400" }) {
  return (
    <div className="theme-card border border-theme-border rounded-2xl overflow-hidden shadow-glow">
      <div className="p-4 border-b border-theme-border">
        <h3 className="font-semibold theme-text">{title}</h3>
      </div>

      <iframe
        src={url}
        title={title}
        width="100%"
        height={height}
        className="border-0"
      />
    </div>
  );
}
