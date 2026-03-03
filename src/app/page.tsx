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
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20 selection:text-primary">
      <Header user={user} />

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 lg:p-8 gap-10">
        {/* Main Content */}
        <div className="flex-1 w-full max-w-3xl mx-auto order-2 lg:order-1 animate-in slide-in-from-bottom-5 duration-500">
          <PostFeed user={user} />
        </div>

        {/* Sidebar - Desktop only */}
        <aside className="hidden lg:block w-72 shrink-0 order-2 sticky top-[100px] h-fit animate-in fade-in duration-700 delay-200">
          <div className="bg-card rounded-3xl border border-border shadow-2xl p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10 rounded-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 blur-2xl -z-10 rounded-full" />
            <Sidebar />
          </div>
        </aside>

        {/* Mobile Users Toggle - Left Corner */}
        <MobileUsersToggle />
      </main>

      {/* Floating Chat Button - Right Corner */}
      <ChatButton user={user} />
    </div>
  )
}
