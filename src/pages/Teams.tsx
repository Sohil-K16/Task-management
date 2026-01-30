import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { blink } from '../lib/blink'
import { 
  Users, 
  Plus, 
  Search,
  MoreVertical,
  Shield,
  UserPlus,
  Mail,
  Trash2
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
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

interface Team {
  id: string
  name: string
  description: string
  owner_id: string
}

interface Member {
  id: string
  team_id: string
  user_id: string
  role: 'admin' | 'member'
  email?: string // Added via mock/join if needed
}

export default function Teams() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // New team form
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  useEffect(() => {
    fetchTeams()
  }, [user])

  const fetchTeams = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Find teams owned by user or where user is member
      const ownedTeams = await blink.db.teams.list({
        where: { ownerId: user.id }
      })
      
      const memberships = await blink.db.members.list({
        where: { userId: user.id }
      }) as unknown as Member[]
      
      const memberTeamIds = memberships.map(m => m.team_id)
      
      const memberTeams = memberTeamIds.length > 0 ? await blink.db.teams.list({
        where: { id: { IN: memberTeamIds } }
      }) : []

      // Merge and remove duplicates
      const allTeams = [...(ownedTeams as unknown as Team[]), ...(memberTeams as unknown as Team[])]
      const uniqueTeams = allTeams.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
      
      setTeams(uniqueTeams)
    } catch (error) {
      toast.error('Failed to fetch teams')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    try {
      const team = await blink.db.teams.create({
        name: newName,
        description: newDesc,
        ownerId: user.id
      }) as unknown as Team
      
      // Also add creator as admin member
      await blink.db.members.create({
        teamId: team.id,
        userId: user.id,
        role: 'admin'
      })

      toast.success('Team created!')
      setIsDialogOpen(false)
      setNewName('')
      setNewDesc('')
      fetchTeams()
    } catch (error) {
      toast.error('Failed to create team')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Collaborate with your team members.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                <Plus size={18} className="mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-zinc-200 dark:border-zinc-800">
              <DialogHeader>
                <DialogTitle>Create Team</DialogTitle>
                <DialogDescription>
                  Start a new team to collaborate on tasks.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTeam} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Team Name</Label>
                  <Input 
                    id="name" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    placeholder="Engineering, Marketing, etc." 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Input 
                    id="desc" 
                    value={newDesc} 
                    onChange={(e) => setNewDesc(e.target.value)} 
                    placeholder="What does this team focus on?" 
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Create Team</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p>Loading teams...</p>
          ) : teams.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-zinc-500">
              <Users size={64} className="mb-4 opacity-10" />
              <p>No teams found. Create your first team!</p>
            </div>
          ) : (
            teams.map((team) => (
              <Card key={team.id} className="group border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-bold">{team.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Mail size={14} /> Invite Members
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Shield size={14} /> Permissions
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-red-600 dark:text-red-400">
                        <Trash2 size={14} /> Leave Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 h-10 line-clamp-2">
                    {team.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <Avatar key={i} className="h-8 w-8 border-2 border-white dark:border-zinc-900">
                          <AvatarFallback className="bg-zinc-200 text-[10px] dark:bg-zinc-800">
                            {i}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-medium dark:bg-zinc-800">
                        +2
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
