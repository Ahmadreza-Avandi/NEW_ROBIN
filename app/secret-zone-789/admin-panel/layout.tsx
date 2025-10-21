import './admin-panel.css';

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-panel-layout">
      {children}
    </div>
  );
}