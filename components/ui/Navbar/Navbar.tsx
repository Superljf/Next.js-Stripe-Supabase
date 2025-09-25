import { createClient } from '@/utils/supabase/server';
import s from './Navbar.module.css';
import Navlinks from './Navlinks';
import Link from 'next/link';

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <nav className="bg-white backdrop-blur-lg z-30 w-full flex items-center justify-between p-6 px-8 border-b border-zinc-200">
      <div className="flex items-center space-x-8">
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-zinc-900 border-2 border-zinc-900 rounded-md p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-white"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
          </div>
          <span className="text-xl font-bold">Next.js Subscription</span>
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/resources"
            className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
          >
            Resources
          </Link>
          <Link
            href="/resources/public"
            className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
          >
            Public Resources
          </Link>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <Link
            href="/account"
            className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
          >
            Account
          </Link>
        ) : null}
        <Navlinks user={user} />
      </div>
    </nav>
  );
}