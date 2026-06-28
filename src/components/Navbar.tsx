import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  active: string;
  onNavigate: (id: string) => void;
}

const links = [
  { id: 'home', label: 'Главная' },
  { id: 'pricing', label: 'Тарифы' },
  { id: 'about', label: 'О нас' },
  { id: 'support', label: 'Поддержка' },
  { id: 'contacts', label: 'Контакты' },
];

const Navbar = ({ active, onNavigate }: NavbarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 group"
        >
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center animate-pulse-glow">
            <Icon name="Box" className="text-primary-foreground" size={20} />
          </div>
          <span className="font-pixel text-sm text-primary neon-text">GLUX</span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => onNavigate(l.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                active === l.id
                  ? 'text-primary neon-text'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => onNavigate('cabinet')}
            className="text-foreground hover:text-primary"
          >
            <Icon name="User" size={16} className="mr-1" /> Кабинет
          </Button>
          <Button
            onClick={() => onNavigate('admin')}
            variant="outline"
            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            <Icon name="Shield" size={16} className="mr-1" /> Админ
          </Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          <Icon name={open ? 'X' : 'Menu'} size={24} />
        </button>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-border animate-fade-in">
          <div className="container py-4 flex flex-col gap-1">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  onNavigate(l.id);
                  setOpen(false);
                }}
                className="text-left px-4 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground"
              >
                {l.label}
              </button>
            ))}
            <button onClick={() => { onNavigate('cabinet'); setOpen(false); }} className="text-left px-4 py-2 rounded-md text-sm text-primary">
              Личный кабинет
            </button>
            <button onClick={() => { onNavigate('admin'); setOpen(false); }} className="text-left px-4 py-2 rounded-md text-sm text-accent">
              Админ-панель
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
