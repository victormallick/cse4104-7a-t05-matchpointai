import {
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  ChevronUp,
  FileClock,
  FileSearch,
  Gauge,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  ShieldCheck,
  UserRound,
  UsersRound
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import Brand from './Brand';
import { useAuth } from '../context/AuthContext';

const candidateLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analyze', label: 'Analyze Resume', icon: FileSearch },
  { to: '/result', label: 'AI Result', icon: Gauge },
  { to: '/interview', label: 'Interview', icon: MessageSquareText },
  { to: '/jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { to: '/history', label: 'History', icon: History },
  { to: '/profile', label: 'Profile', icon: UserRound }
];

const adminLinks = [
  { to: '/admin', label: 'Admin Dashboard', icon: ShieldCheck, end: true },
  { to: '/admin/users', label: 'Manage Users', icon: UsersRound },
  { to: '/admin/analytics', label: 'System Analytics', icon: BarChart3 },
  { to: '/admin/ai-usage', label: 'AI Usage', icon: BrainCircuit },
  { to: '/admin/logs', label: 'Admin Logs', icon: FileClock }
];

const initialsFor = (name = '') =>
  name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

function Navigation({ links, onNavigate }) {
  return (
    <nav className="grid gap-1.5">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) => cn(
            'flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition',
            isActive
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-300 hover:bg-white/8 hover:text-white'
          )}
        >
          <Icon className="size-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarContent({ admin, links, user, onNavigate, onLogout }) {
  return (
    <div className="flex h-full flex-col bg-[#030a20] p-5 text-white">
      <Brand light className="mb-9 px-1" />
      <Navigation links={links} onNavigate={onNavigate} />
      <div className="mt-auto grid gap-2 border-t border-white/10 pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger type="button" className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-white/8">
            <Avatar className="size-10 rounded-xl">
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-xs font-bold text-white">
                {initialsFor(user?.full_name)}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-sm">{user?.full_name}</strong>
              <small className="block text-xs text-slate-500">{admin ? 'Administrator' : 'Candidate'}</small>
            </span>
            <ChevronUp className="size-4 text-slate-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel>{user?.email || 'MatchPoint AI account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600">
              <LogOut /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          type="button"
          variant="ghost"
          className="h-11 w-full justify-start gap-3 rounded-xl px-3 text-slate-300 hover:bg-red-500/10 hover:text-red-300"
          onClick={onLogout}
        >
          <LogOut className="size-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export default function AppLayout({ admin = false }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = admin ? adminLinks : candidateLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[270px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen lg:block">
        <SidebarContent admin={admin} links={links} user={user} onLogout={handleLogout} />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger type="button" className="fixed right-4 top-4 z-40 grid size-11 place-items-center rounded-xl bg-[#030a20] text-white shadow-lg lg:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Open navigation</span>
        </SheetTrigger>
        <SheetContent side="left" showCloseButton className="w-[285px] border-0 bg-[#030a20] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>MatchPoint AI navigation</SheetTitle>
            <SheetDescription>Navigate through your MatchPoint AI workspace.</SheetDescription>
          </SheetHeader>
          <SidebarContent
            admin={admin}
            links={links}
            user={user}
            onNavigate={() => setOpen(false)}
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>

      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
