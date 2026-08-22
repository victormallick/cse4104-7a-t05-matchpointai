import {
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  FileClock,
  FileSearch,
  Gauge,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  PinOff,
  ShieldCheck,
  UserRound,
  UsersRound
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
import ThemeToggle from './ThemeToggle';
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
  name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'AR';

function Navigation({ links, isCollapsed, onNavigate }) {
  return (
    <nav className="grid gap-1.5">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          title={isCollapsed ? label : undefined}
          className={({ isActive }) => cn(
            'group relative flex items-center transition-all duration-200 cursor-pointer',
            isCollapsed
              ? 'size-11 justify-center rounded-xl mx-auto'
              : 'min-h-12 gap-3 rounded-xl px-4 text-sm font-semibold',
            isActive
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white'
          )}
        >
          <Icon className="size-5 shrink-0" />
          {!isCollapsed && <span className="truncate">{label}</span>}

          {/* Floating Tooltip in Collapsed Mode */}
          {isCollapsed && (
            <div className="pointer-events-none absolute left-full ml-3 hidden rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white shadow-md group-hover:block dark:bg-white dark:text-slate-950 z-50 whitespace-nowrap">
              {label}
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarContent({
  admin,
  links,
  user,
  isCollapsed = false,
  isPinned = false,
  onTogglePin,
  onNavigate,
  onLogout
}) {
  return (
    <div
      className={cn(
        'flex h-full flex-col border-r border-slate-200/80 bg-white text-slate-900 transition-all duration-250 dark:border-slate-800/80 dark:bg-[#030a20] dark:text-white shadow-sm',
        isCollapsed ? 'w-[76px] p-3' : 'w-[270px] p-5'
      )}
    >
      {/* Header with Logo & Pin/Collapse Button */}
      <div className={cn('mb-6 flex items-center', isCollapsed ? 'justify-center' : 'justify-between px-1')}>
        {!isCollapsed ? (
          <>
            <Brand />
            {onTogglePin && (
              <button
                type="button"
                onClick={onTogglePin}
                className={cn(
                  'grid size-8 place-items-center rounded-lg transition cursor-pointer',
                  isPinned
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200'
                )}
                title={isPinned ? 'Sidebar is Pinned (Click to enable Auto-Collapse on hover)' : 'Click to Pin Sidebar open'}
              >
                <PanelLeftClose className="size-4.5" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <img
              src="/logo_icon.png"
              alt="MatchPoint AI"
              className="size-8 object-contain drop-shadow-xs cursor-pointer"
              onClick={onTogglePin}
              title="Expand & Pin sidebar"
            />
            {onTogglePin && (
              <button
                type="button"
                onClick={onTogglePin}
                className="grid size-7 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200 transition cursor-pointer"
                title="Click to Pin sidebar open"
              >
                <PanelLeftOpen className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <Navigation links={links} isCollapsed={isCollapsed} onNavigate={onNavigate} />
      </div>

      {/* Footer Area: Theme, Profile & Logout */}
      <div className={cn('mt-auto grid gap-3 border-t border-slate-200 pt-4 dark:border-white/10', isCollapsed && 'justify-center')}>
        {!isCollapsed ? (
          <>
            <ThemeToggle mode="segmented" />
            <NavLink
              to={admin ? '/admin' : '/profile'}
              onClick={onNavigate}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-slate-100 dark:hover:bg-white/8 group"
            >
              <Avatar className="size-10 rounded-xl ring-2 ring-blue-500/20 dark:ring-blue-500/30">
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-xs font-bold text-white">
                  {initialsFor(user?.full_name)}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-sm text-slate-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-white">
                  {user?.full_name || 'Amina Rahman'}
                </strong>
                <small className="block text-xs text-slate-500 dark:text-slate-400">
                  {admin ? 'Administrator' : 'Candidate'}
                </small>
              </span>
              <UserRound className="size-4 text-slate-400 transition group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300" />
            </NavLink>
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full justify-start gap-3 rounded-xl px-3 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-300 cursor-pointer"
              onClick={onLogout}
            >
              <LogOut className="size-5" />
              Logout
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2.5">
            <ThemeToggle />
            <NavLink
              to={admin ? '/admin' : '/profile'}
              onClick={onNavigate}
              className="group relative"
              title={`${user?.full_name || 'Candidate'} (Profile)`}
            >
              <Avatar className="size-9 rounded-xl ring-2 ring-blue-500/20 dark:ring-blue-500/30">
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-[11px] font-bold text-white">
                  {initialsFor(user?.full_name)}
                </AvatarFallback>
              </Avatar>
            </NavLink>
            <button
              type="button"
              onClick={onLogout}
              className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300 cursor-pointer transition"
              title="Logout"
            >
              <LogOut className="size-4.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppLayout({ admin = false }) {
  const [open, setOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    try {
      const stored = localStorage.getItem('matchpoint_sidebar_pinned');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const [isHovered, setIsHovered] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = admin ? adminLinks : candidateLinks;

  // The sidebar is expanded if it is pinned or when user hovers over it
  const isExpanded = isPinned || isHovered;
  const isCollapsed = !isExpanded;

  const handleTogglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('matchpoint_sidebar_pinned', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div
      className={cn(
        'min-h-screen bg-slate-50 text-slate-950 transition-colors duration-200 dark:bg-[#070d1e] dark:text-slate-100 lg:grid',
        isPinned ? 'lg:grid-cols-[270px_minmax(0,1fr)]' : 'lg:grid-cols-[76px_minmax(0,1fr)]'
      )}
    >
      {/* Desktop Sidebar: Slim 76px rail with hover auto-expand overlay */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen lg:block z-40 transition-all duration-250',
          !isPinned && isHovered && 'shadow-2xl'
        )}
        onMouseEnter={() => !isPinned && setIsHovered(true)}
        onMouseLeave={() => !isPinned && setIsHovered(false)}
      >
        <SidebarContent
          admin={admin}
          links={links}
          user={user}
          isCollapsed={isCollapsed}
          isPinned={isPinned}
          onTogglePin={handleTogglePin}
          onLogout={handleLogout}
        />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <div className="fixed right-4 top-4 z-40 flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <SheetTrigger
            type="button"
            className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-md dark:border-slate-800 dark:bg-[#030a20] dark:text-white"
          >
            <Menu className="size-5" />
            <span className="sr-only">Open navigation</span>
          </SheetTrigger>
        </div>
        <SheetContent side="left" showCloseButton className="w-[285px] border-r border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-[#030a20]">
          <SheetHeader className="sr-only">
            <SheetTitle>MatchPoint AI navigation</SheetTitle>
            <SheetDescription>Navigate through your MatchPoint AI workspace.</SheetDescription>
          </SheetHeader>
          <SidebarContent
            admin={admin}
            links={links}
            user={user}
            isCollapsed={false}
            isPinned={true}
            onNavigate={() => setOpen(false)}
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>

      <main className="min-w-0 transition-all duration-250">
        <Outlet />
      </main>
    </div>
  );
}
