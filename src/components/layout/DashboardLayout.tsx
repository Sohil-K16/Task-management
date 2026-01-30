import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { blink } from '../../lib/blink'
import { Button } from '../ui/button'
import { 
  Layout, 
  CheckSquare, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu'

const navItems = [
  { name: 'Dashboard', icon: Layout, path: '/' },
  { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { name: 'Teams', icon: Users, path: '/teams' },
  { name: 'Settings', icon: Settings, path: '/settings' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleLogout = async () => {
    await blink.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 transform border-r border-zinc-200 bg-white transition-transform duration-300 ease-in-out dark:border-zinc-800 dark:bg-zinc-900
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:static lg:translate-x-0
      `}>
        <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
          <div className="flex items-center gap-2 font-bold tracking-tight">
            <div className="rounded bg-zinc-900 p-1 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Layout size={18} />
            </div>
            <span>TaskFlow</span>
          </div>
          <button 
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100' 
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100'}
                `}
              >
                <item.icon size={18} />
                {item.name}
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-red-400"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 lg:px-8">
          <button 
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="hidden max-w-md flex-1 lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <Input 
                placeholder="Search tasks, teams..." 
                className="w-full border-none bg-zinc-100 pl-10 focus-visible:ring-1 focus-visible:ring-zinc-900 dark:bg-zinc-800 dark:focus-visible:ring-zinc-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 outline-none">
                  <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-800">
                    <AvatarImage src={user?.metadata?.avatar as string} />
                    <AvatarFallback className="bg-zinc-900 text-[10px] text-white dark:bg-zinc-100 dark:text-zinc-900">
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left lg:block">
                    <p className="text-xs font-semibold leading-none">{user?.displayName}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{user?.role || 'Member'}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-zinc-200 dark:border-zinc-800">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
