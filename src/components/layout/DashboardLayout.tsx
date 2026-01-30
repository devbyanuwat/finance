import { useState, type ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { MobileSidebar } from './MobileSidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex flex-1 flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main id="main-content" className="flex-1 overflow-y-auto px-4 pb-6 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
