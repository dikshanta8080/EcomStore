import React, { useState } from 'react';
import { Sidebar, type NavTab } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  lowStockCount?: number;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onTabChange,
  onRefresh,
  isRefreshing,
  lowStockCount,
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/75 flex">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={onTabChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        lowStockCount={lowStockCount}
      />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header
          currentTab={currentTab}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
