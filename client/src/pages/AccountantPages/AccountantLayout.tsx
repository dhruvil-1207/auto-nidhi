import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import {
  LayoutDashboard, FolderOpen, ArrowDownToLine, ArrowUpFromLine,
  Receipt, ShieldCheck, Wallet, Landmark, BadgePercent,
  LogOut, BellRing, Settings, Menu,
} from 'lucide-react'
import logoDark from '../../assets/AutoNidhi Logo 1.png'
import NotificationPanel from '../../components/app/NotificationPanel'
import { unreadCount, subscribe, fetchNotifications } from '../../store/notificationStore'

interface NavItem { to: string; label: string; icon: React.ComponentType<any> }
interface NavGroup { title: string; items: NavItem[] }

const accountantNav: NavGroup[] = [
  {
    title: 'Overview', items: [
      { to: '/accountant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/accountant/files',     label: 'Files',     icon: FolderOpen },
    ],
  },
  {
    title: 'Finance', items: [
      { to: '/accountant/payments/in',         label: 'Payment IN',         icon: ArrowDownToLine  },
      { to: '/accountant/payments/out',        label: 'Payment OUT',        icon: ArrowUpFromLine  },
      { to: '/accountant/rto-payments',        label: 'RTO Payments',       icon: Receipt          },
      { to: '/accountant/insurance-payments',  label: 'Insurance Payments', icon: ShieldCheck      },
      { to: '/accountant/expenses',            label: 'Expenses',           icon: Wallet           },
      { to: '/accountant/advances',            label: 'Advances',           icon: Landmark         },
      { to: '/accountant/commission/in',       label: 'Commission IN',      icon: BadgePercent     },
      { to: '/accountant/commission/out',      label: 'Commission OUT',     icon: BadgePercent     },
    ],
  },
  // ⚡ NEW: Operational Overrides & Adjustments Section
  {
    title: 'Operations', items: [
      { to: '/accountant/modifications',       label: 'Ledger Overrides',   icon: Settings         },
    ],
  },
]

export default function AccountantLayout() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('Accountant')
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  useEffect(() => {
    const role = localStorage.getItem('user_role') || ''
    let name = 'Accountant'
    try {
      const stored = localStorage.getItem('an_current_user')
      if (stored) {
        const u = JSON.parse(stored)
        name = u.first_name || u.name || 'Accountant'
      }
    } catch { /* ignore */ }
    setUserName(name)

    if (!localStorage.getItem('access_token') || role.toLowerCase() !== 'accountant') {
      navigate('/login', { replace: true })
      return
    }

    fetchNotifications()
    const unsubscribe = subscribe(() => {
      setNotifCount(unreadCount())
    })
    return () => unsubscribe()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('an_current_user')
    localStorage.removeItem('user_role')
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      {/* ── Mobile sidebar overlay ── */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={closeSidebar}
      />

      {/* ── Sidebar ── */}
      <aside className={`app-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sb-logo" style={{ position: 'relative' }}>
          <div className="sb-logo-mark"><img src={logoDark} alt="AutoNidhi" className="sidebar-logo-image" /></div>
          <button className="sidebar-close-btn" onClick={closeSidebar} aria-label="Close menu">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        {accountantNav.map((group) => (
          <div key={group.title}>
            <div className="sb-section">{group.title}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/accountant/dashboard'}
                className={({ isActive }) => (isActive ? 'active-link' : '')}
                onClick={closeSidebar}
              >
                <item.icon size={16} /> {item.label}
              </NavLink>
            ))}
          </div>
        ))}

        <div className="sb-foot">
          Signed in as <strong style={{ color: '#fff' }}>{userName}</strong><br />
          <span>Accountant</span>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="app-main">
        <header className="app-topbar">
          {/* Hamburger – mobile only */}
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <h1>Accountant Portal</h1>
          <div className="app-user">
            <div style={{ position: 'relative' }}>
              <button
                id="notif-bell-btn"
                className="btn btn-ghost"
                style={{ padding: 8, position: 'relative', display: 'flex', alignItems: 'center' }}
                onClick={() => setNotifOpen(p => !p)}
              >
                <BellRing size={18} color="#64748b" />
                {notifCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 6,
                    background: '#ef4444', color: '#fff', fontSize: '0.65rem',
                    fontWeight: 700, padding: '2px 5px', borderRadius: 10,
                    lineHeight: 1, minWidth: 16, textAlign: 'center'
                  }}>
                    {notifCount > 99 ? '99+' : notifCount}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            </div>
            <div className="app-avatar">{userName.slice(0, 1).toUpperCase()}</div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}