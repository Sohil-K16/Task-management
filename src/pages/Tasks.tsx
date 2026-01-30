import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { blink } from '../lib/blink'
import { 
  CheckSquare, 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date: string
  creator_id: string
}

export default function Tasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // New task form state
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [newDueDate, setNewDueDate] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [user])

  const fetchTasks = async () => {
    if (!user) return
    setLoading(true)
    try {
      const result = await blink.db.tasks.list({
        where: { creatorId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setTasks(result as unknown as Task[])
    } catch (error) {
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    try {
      await blink.db.tasks.create({
        title: newTitle,
        description: newDesc,
        status: 'todo',
        priority: newPriority,
        dueDate: newDueDate || null,
        creatorId: user.id
      })
      toast.success('Task created!')
      setIsDialogOpen(false)
      resetForm()
      fetchTasks()
    } catch (error) {
      toast.error('Failed to create task')
    }
  }

  const resetForm = () => {
    setNewTitle('')
    setNewDesc('')
    setNewPriority('medium')
    setNewDueDate('')
  }

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      await blink.db.tasks.update(taskId, { status: newStatus })
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
      toast.success('Status updated')
    } catch (error) {
      toast.error('Update failed')
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await blink.db.tasks.delete(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
      toast.success('Task deleted')
    } catch (error) {
      toast.error('Delete failed')
    }
  }

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High</Badge>
      case 'medium': return <Badge variant="secondary" className="bg-zinc-200">Medium</Badge>
      case 'low': return <Badge variant="outline">Low</Badge>
      default: return null
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-green-500" size={18} />
      case 'in_progress': return <Clock className="text-blue-500" size={18} />
      case 'todo': return <AlertCircle className="text-zinc-400" size={18} />
      default: return null
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Manage and track your project tasks here.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                <Plus size={18} className="mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-zinc-200 dark:border-zinc-800">
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your workspace.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    placeholder="Task title" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={newDesc} 
                    onChange={(e) => setNewDesc(e.target.value)} 
                    placeholder="Describe the task..." 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={newPriority} onValueChange={(v: any) => setNewPriority(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input 
                      id="dueDate" 
                      type="date" 
                      value={newDueDate} 
                      onChange={(e) => setNewDueDate(e.target.value)} 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Task</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <Input 
              placeholder="Filter tasks..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter size={18} />
            Filter
          </Button>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
              <Clock size={48} className="animate-spin mb-4 opacity-20" />
              <p>Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
              <CheckSquare size={64} className="mb-4 opacity-10" />
              <p>No tasks found.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredTasks.map((task) => (
                <div key={task.id} className="group flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => updateTaskStatus(task.id, task.status === 'completed' ? 'todo' : 'completed')}
                      className="mt-1 flex h-5 w-5 items-center justify-center rounded border border-zinc-300 transition-colors hover:border-zinc-900 dark:border-zinc-700 dark:hover:border-zinc-100"
                    >
                      {task.status === 'completed' && <CheckCircle2 className="text-zinc-900 dark:text-zinc-100" size={14} />}
                    </button>
                    <div className="space-y-1">
                      <p className={`font-medium ${task.status === 'completed' ? 'line-through text-zinc-400' : ''}`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-md">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-3 pt-1">
                        {getPriorityBadge(task.priority)}
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-zinc-500">
                            <Calendar size={12} />
                            {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs font-medium">
                          {getStatusIcon(task.status)}
                          <span className="capitalize">{task.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <MoreVertical size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 border-zinc-200 dark:border-zinc-800">
                      <DropdownMenuItem onClick={() => updateTaskStatus(task.id, 'in_progress')}>
                        Move to In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateTaskStatus(task.id, 'completed')}>
                        Mark as Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateTaskStatus(task.id, 'todo')}>
                        Move to Todo
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-red-600 dark:text-red-400">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
