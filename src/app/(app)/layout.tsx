import Providers from '@/components/Providers';
import Sidebar from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-navy-50">
        <Sidebar />
        {/* Main content */}
        <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </Providers>
  );
}
