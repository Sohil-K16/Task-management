import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { blink } from '../lib/blink'
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus,
  ArrowUpRight,
  TrendingUp,
  Users
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../hooks/useAuth'

interface Task {
  id: string
  title: string
  status: string
  priority: string
  due_date: string
}

import { CheckSquare } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
  })
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return
      try {
        const tasks = await blink.db.tasks.list({
          where: { creatorId: user.id },
          limit: 5,
          orderBy: { createdAt: 'desc' }
        }) as unknown as Task[]
        
        setRecentTasks(tasks)

        const allTasks = await blink.db.tasks.list({
          where: { creatorId: user.id }
        }) as unknown as Task[]

        setStats({
          total: allTasks.length,
          completed: allTasks.filter(t => t.status === 'completed').length,
          inProgress: allTasks.filter(t => t.status === 'in_progress').length,
          todo: allTasks.filter(t => t.status === 'todo').length,
        })
      } catch (error) {
        console.error('Failed to fetch dashboard data', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const statCards = [
    { title: 'Total Tasks', value: stats.total, icon: CheckCircle2, color: 'text-zinc-900 dark:text-zinc-100' },
    { title: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-zinc-900 dark:text-zinc-100' },
    { title: 'Pending', value: stats.todo, icon: AlertCircle, color: 'text-zinc-900 dark:text-zinc-100' },
    { title: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-600' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.displayName || 'User'}</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Here's an overview of your workspace performance.</p>
          </div>
          <Button className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
            <Plus size={18} className="mr-2" />
            New Task
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-zinc-200 dark:border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon size={16} className={stat.color} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  <TrendingUp size={12} className="inline mr-1 text-green-500" />
                  +4% from last week
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                    <CheckSquare size={48} className="mb-4 opacity-20" />
                    <p>No tasks found. Create your first task!</p>
                  </div>
                ) : (
                  recentTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between border-b border-zinc-100 pb-4 last:border-0 last:pb-0 dark:border-zinc-800">
                      <div className="space-y-1">
                        <p className="font-medium leading-none">{task.title}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          Due {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={task.status === 'completed' ? 'default' : 'outline'}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <ArrowUpRight size={16} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3 border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-zinc-900 text-white text-xs dark:bg-zinc-100 dark:text-zinc-900">JD</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-sm text-zinc-500">jdoe@example.com</p>
                  </div>
                  <div className="ml-auto font-medium">12 tasks</div>
                </div>
                <div className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-zinc-900 text-white text-xs dark:bg-zinc-100 dark:text-zinc-900">AS</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Alice Smith</p>
                    <p className="text-sm text-zinc-500">asmith@example.com</p>
                  </div>
                  <div className="ml-auto font-medium">8 tasks</div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6 border-zinc-200 dark:border-zinc-800">
                <Users size={16} className="mr-2" />
                View Team Members
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
