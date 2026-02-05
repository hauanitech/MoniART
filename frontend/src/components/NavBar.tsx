import { NavLink } from 'react-router-dom';

const links = [
  { to: '/create', label: '➕ Créer' },
  { to: '/history', label: '📋 Historique' },
];

export default function NavBar() {
  return (
    <nav className="bg-indigo-700 text-white">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <span className="font-bold text-lg tracking-tight">MoniART</span>
        <div className="flex gap-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-1 rounded text-sm font-medium transition ${
                  isActive ? 'bg-white/20' : 'hover:bg-white/10'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
