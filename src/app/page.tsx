import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import PostFeed from '@/components/PostFeed'
import ChatButton from '@/components/ChatButton'
import MobileUsersToggle from '@/components/MobileUsersToggle'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header user={user} />

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 gap-6 md:gap-8">
        {/* Main Content */}
        <div className="flex-1 w-full max-w-2xl mx-auto order-2 lg:order-1 space-y-8">
          <PostFeed user={user} />
        </div>

        {/* Sidebar - Desktop only */}
        <aside className="hidden lg:block w-72 shrink-0 order-2">
          <Sidebar />
        </aside>

        {/* Mobile Users Toggle */}
        <MobileUsersToggle />
      </main>

      {/* Floating Chat Button for Mobile and Desktop */}
      <ChatButton user={user} />
    </div>
  )
}
