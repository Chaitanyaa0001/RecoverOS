import Sidebar from "../../components/sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f8fafb]">
      <Sidebar />

      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}