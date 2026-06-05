import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Navbar from './Navbar';
import Sidebar from './Sidebar';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((current) => !current);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onNavigate={closeSidebar}
      />

      <main className="app-main">
        <div className="app-frame">
          <Navbar
            onOpenSidebar={toggleSidebar}
          />

          <section className="page-content">
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;