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
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

const candidateSections = [
  {
    title: 'Workspace',
    links: [
      {
        to: '/dashboard',
        label: 'Dashboard',
        description: 'Real-time ATS score, recent scans & career overview',
        icon: LayoutDashboard
      },
      {
        to: '/analyze',
        label: 'Analyze Resume',
        description: 'Upload PDF/DOCX for AI ATS scoring & gap insights',
        icon: FileSearch,
        badge: 'ATS'
      },
      {
        to: '/result',
        label: 'ATS Scorecard',
        description: 'In-depth analysis report, skill match & recruiter tips',
        icon: Gauge
      }
    ]
  },
  {
    title: 'Career Tools',
    links: [
      {
        to: '/interview',
        label: 'Interview Prep',
        description: 'Role-calibrated STAR behavioral & technical mock questions',
        icon: MessageSquareText,
        badge: 'STAR'
      },
      {
        to: '/jobs',
        label: 'Live Job Search',
        description: '1-click filtered live search on LinkedIn & Google Jobs',
        icon: BriefcaseBusiness,
        badge: 'Live'
      },
      {
        to: '/history',
        label: 'Scan History',
        description: 'Track past resume revisions, score trends & evolution',
        icon: History
      }
    ]
  },
  {
    title: 'Settings',
    links: [
      {
        to: '/profile',
        label: 'Candidate Profile',
        description: 'Manage target roles, industry focus & preferences',
        icon: UserRound
      }
    ]
  }
];

const adminSections = [
  {
    title: 'Administration',
    links: [
      {
        to: '/admin',
        label: 'Admin Dashboard',
        description: 'System health, global stats & quick actions',
        icon: ShieldCheck,
        end: true
      },
      {
        to: '/admin/users',
        label: 'Manage Users',
        description: 'View candidates, edit permissions & monitor accounts',
        icon: UsersRound
      },
      {
        to: '/admin/analytics',
        label: 'System Analytics',
        description: 'Scan volume, pass rates & conversion metrics',
        icon: BarChart3
      },
      {
        to: '/admin/ai-usage',
        label: 'AI Usage & Tokens',
        description: 'OpenAI/Gemini token burn, latency & cost metrics',
        icon: BrainCircuit
      },
      {
        to: '/admin/logs',
        label: 'Audit Logs',
        description: 'Real-time security events & administrative history',
        icon: FileClock
      }
    ]
  }
];

const initialsFor = (name = '', email = '') => {
  const clean = (name || email?.split('@')[0] || 'Candidate').trim();
  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'C';
};

/* -------------------------------------------------------------------------- */
/* 1. SLIM DESKTOP ICON RAIL (Option 3: VS Code / Slack Style)                */
/* -------------------------------------------------------------------------- */
function SlimRailNavigation({ sections }) {
  return (
    <div className="flex flex-col items-center gap-3 py-1 w-full">
      {sections.map((section, sIdx) => (
        <div key={section.title} className="flex flex-col items-center gap-1.5 w-full">
          {sIdx > 0 && <div className="h-px w-8 bg-slate-200/80 dark:bg-slate-800/80 my-1" />}
          
          {section.links.map(({ to, label, description, icon: Icon, end, badge }) => (
            <div key={to} className="relative group flex items-center justify-center">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) => cn(
                  'flex size-11 items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-500/20'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white'
                )}
              >
                <Icon className="size-5 shrink-0" />

                {/* Status Dot for Live/STAR badge */}
                {badge === 'Live' && (
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#030a20]" />
                )}
              </NavLink>

              {/* Rich Floating Glassmorphic Tooltip Card on Hover */}
              <div className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 min-w-[230px] max-w-[270px] flex flex-col rounded-2xl border border-slate-200/90 bg-white p-3.5 text-left shadow-2xl dark:border-slate-800 dark:bg-[#0f172a] z-[9999] ring-1 ring-black/5 dark:ring-white/5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {section.title}
                  </span>
                  {badge && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[9px] font-bold shrink-0 tracking-wide',
                        badge === 'Live'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                          : badge === 'STAR'
                          ? 'bg-violet-500/20 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500/30'
                          : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/30'
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-slate-950 dark:text-slate-100 mb-1">
                  {label}
                </div>
                {description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    {description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. FULL MOBILE DRAWER NAVIGATION                                           */
/* -------------------------------------------------------------------------- */
function MobileDrawerNavigation({ sections, onNavigate }) {
  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <div key={section.title} className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {section.title}
          </p>
          <nav className="grid gap-1">
            {section.links.map(({ to, label, description, icon: Icon, end, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) => cn(
                  'group relative flex items-center justify-between min-h-11 rounded-xl px-3.5 text-sm font-semibold transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="size-4.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </div>

                {badge && (
                  <span
                    className={cn(
                      'ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 tracking-wide',
                      badge === 'Live'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                        : badge === 'STAR'
                        ? 'bg-violet-500/20 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500/30'
                        : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/30'
                    )}
                  >
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      ))}
    </div>
  );
}

export default function AppLayout({ admin = false }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sections = admin ? adminSections : candidateSections;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors duration-200 dark:bg-[#070d1e] dark:text-slate-100 lg:grid lg:grid-cols-[74px_minmax(0,1fr)]">
      
      {/* ========================================================================= */}
      {/* DESKTOP SLIM ICON RAIL (OPTION 3)                                         */}
      {/* ========================================================================= */}
      <aside className="sticky top-0 hidden h-screen lg:flex flex-col items-center justify-between border-r border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#030a20] py-5 px-3 z-50 shadow-xs">
        
        {/* Top: Logo Icon */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <NavLink to="/dashboard" className="cursor-pointer" title="MatchPoint AI">
            <img
              src="/logo_icon.png"
              alt="MatchPoint AI"
              className="size-9 object-contain drop-shadow-xs transition hover:scale-105"
            />
          </NavLink>
        </div>

        {/* Center: Slim Navigation Rail (no overflow hidden to allow tooltips to show) */}
        <div className="flex-1 w-full flex flex-col items-center justify-center py-2">
          <SlimRailNavigation sections={sections} />
        </div>

        {/* Bottom: Theme Toggle, Profile & Logout */}
        <div className="mt-auto flex flex-col items-center gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 w-full">
          <ThemeToggle />

          {/* Profile Avatar with Popout Tooltip */}
          <div className="relative group flex items-center justify-center">
            <NavLink
              to={admin ? '/admin' : '/profile'}
              className="cursor-pointer"
            >
              <Avatar className="size-10 rounded-2xl ring-2 ring-blue-500/20 dark:ring-blue-500/30 hover:scale-105 transition">
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-xs font-bold text-white">
                  {initialsFor(user?.full_name, user?.email)}
                </AvatarFallback>
              </Avatar>
            </NavLink>

            <div className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 min-w-[200px] flex flex-col rounded-2xl border border-slate-200/90 bg-white p-3 text-left shadow-2xl dark:border-slate-800 dark:bg-[#0f172a] z-[9999] ring-1 ring-black/5 dark:ring-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {admin ? 'Admin Account' : 'Candidate Account'}
              </span>
              <strong className="block text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                {user?.full_name || user?.email?.split('@')[0] || 'Candidate'}
              </strong>
              <small className="block text-[10px] text-slate-400 truncate">
                {user?.email || 'Logged in user'}
              </small>
            </div>
          </div>

          {/* Sign Out Button with Tooltip */}
          <div className="relative group flex items-center justify-center">
            <button
              type="button"
              onClick={handleLogout}
              className="grid size-10 place-items-center rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300 transition cursor-pointer"
            >
              <LogOut className="size-5" />
            </button>

            <div className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-bold text-red-600 shadow-xl dark:border-slate-800 dark:bg-[#0f172a] dark:text-red-400 z-[9999] whitespace-nowrap">
              Sign Out
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER SHEET                                                       */}
      {/* ========================================================================= */}
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="fixed right-4 top-4 z-40 flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <SheetTrigger
            type="button"
            className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-md dark:border-slate-800 dark:bg-[#030a20] dark:text-white cursor-pointer"
          >
            <Menu className="size-5" />
            <span className="sr-only">Open navigation</span>
          </SheetTrigger>
        </div>
        <SheetContent side="left" showCloseButton className="w-[285px] border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#030a20] flex flex-col justify-between">
          <SheetHeader className="sr-only">
            <SheetTitle>MatchPoint AI navigation</SheetTitle>
            <SheetDescription>Navigate through your MatchPoint AI workspace.</SheetDescription>
          </SheetHeader>

          <div>
            <div className="mb-6 px-1">
              <Brand />
            </div>
            <MobileDrawerNavigation
              sections={sections}
              onNavigate={() => setOpen(false)}
            />
          </div>

          <div className="mt-auto grid gap-3 border-t border-slate-200 pt-4 dark:border-white/10">
            <NavLink
              to={admin ? '/admin' : '/profile'}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-slate-100 dark:hover:bg-white/8 group cursor-pointer"
            >
              <Avatar className="size-10 rounded-xl ring-2 ring-blue-500/20 dark:ring-blue-500/30 shrink-0">
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-xs font-bold text-white">
                  {initialsFor(user?.full_name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-sm text-slate-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-white">
                  {user?.full_name || user?.email?.split('@')[0] || 'Candidate'}
                </strong>
                <small className="block text-xs text-slate-500 dark:text-slate-400">
                  {admin ? 'Administrator' : 'Candidate'}
                </small>
              </span>
              <UserRound className="size-4 text-slate-400 transition group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 shrink-0" />
            </NavLink>

            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full justify-start gap-3 rounded-xl px-3 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-300 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="size-4.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Page Workspace (Maximum width utilization) */}
      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

