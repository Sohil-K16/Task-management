import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Switch } from '../components/ui/switch'
import { useAuth } from '../hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { toast } from 'sonner'

export default function Settings() {
  const { user } = useAuth()

  const handleSave = () => {
    toast.success('Settings saved successfully')
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your account and workspace preferences.</p>
        </div>

        <div className="grid gap-8">
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and how others see you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.metadata?.avatar as string} />
                  <AvatarFallback className="bg-zinc-900 text-xl text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {user?.displayName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Avatar</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user?.displayName || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue={user?.email || ''} disabled />
                </div>
              </div>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose how you want to be notified about task updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Receive summaries of your tasks via email.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Team Activity</Label>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Get notified when team members comment on tasks.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-100 dark:border-red-900/30">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
              <CardDescription>Permanently delete your account and all associated data.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">Delete Account</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
