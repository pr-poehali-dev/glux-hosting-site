import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const API = 'https://functions.poehali.dev/d512cd7c-b4f4-49e5-81a1-f4fc243fb5ae';
const TOKEN_KEY = 'glux_admin_token';

interface Host {
  id: number;
  tg_user: string;
  server_name: string;
  plan: string;
  ip: string;
  rcon: string;
  ram: number;
  version: string;
  status: 'online' | 'offline';
  auto_restart: boolean;
}

const Admin = () => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [creds, setCreds] = useState({ login: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);

  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState<number | null>(null);
  const [form, setForm] = useState({ user: '', name: '', plan: 'IRON' });

  const authHeaders = () => ({ 'Content-Type': 'application/json', 'X-Admin-Token': token || '' });

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setHosts([]);
  };

  const loadHosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API, { headers: authHeaders() });
      if (res.status === 403) {
        logout();
        return;
      }
      const data = await res.json();
      setHosts(data.hosts || []);
    } catch {
      toast.error('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadHosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async () => {
    if (!creds.login || !creds.password) {
      toast.error('Введите логин и пароль');
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch(`${API}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        toast.success('Добро пожаловать, администратор');
      } else {
        toast.error(data.error || 'Неверные данные');
      }
    } catch {
      toast.error('Ошибка входа');
    } finally {
      setLoginLoading(false);
    }
  };

  const issue = async () => {
    if (!form.user || !form.name) {
      toast.error('Заполни TG-пользователя и название сервера');
      return;
    }
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ tg_user: form.user, server_name: form.name, plan: form.plan }),
      });
      const data = await res.json();
      if (data.host) {
        setHosts((p) => [data.host, ...p]);
        setForm({ user: '', name: '', plan: 'IRON' });
        toast.success(`Хостинг выдан для ${data.host.tg_user}`);
      } else {
        toast.error(data.error || 'Ошибка');
      }
    } catch {
      toast.error('Ошибка выдачи');
    }
  };

  const regenRcon = async (id: number) => {
    const res = await fetch(API, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ id, field: 'rcon' }),
    });
    const data = await res.json();
    if (data.rcon) {
      setHosts((p) => p.map((h) => (h.id === id ? { ...h, rcon: data.rcon } : h)));
      toast.success('RCON-пароль обновлён');
    }
  };

  const toggleStatus = async (h: Host) => {
    const value = h.status === 'online' ? 'offline' : 'online';
    const res = await fetch(API, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ id: h.id, field: 'status', value }),
    });
    const data = await res.json();
    if (data.status) {
      setHosts((p) => p.map((x) => (x.id === h.id ? { ...x, status: data.status } : x)));
      toast.success(data.status === 'online' ? 'Сервер запущен' : 'Сервер остановлен');
    }
  };

  const remove = async (id: number) => {
    await fetch(`${API}?id=${id}`, { method: 'DELETE', headers: authHeaders() });
    setHosts((p) => p.filter((h) => h.id !== id));
    toast.success('Хостинг удалён');
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Скопировано');
  };

  if (!token) {
    return (
      <div className="pt-24 pb-20 container flex justify-center">
        <div className="glass rounded-2xl p-8 border border-border neon-border-cyan w-full max-w-md mt-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
              <Icon name="ShieldCheck" className="text-accent" size={28} />
            </div>
            <h1 className="font-pixel text-base text-accent neon-text-cyan mb-2">ВХОД В АДМИНКУ</h1>
            <p className="text-sm text-muted-foreground">Только для администраторов Glux-Hosting</p>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm mb-1.5 block">Логин</Label>
              <Input
                value={creds.login}
                onChange={(e) => setCreds({ ...creds, login: e.target.value })}
                placeholder="Введите логин"
                className="bg-secondary/50 border-border"
              />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Пароль</Label>
              <Input
                type="password"
                value={creds.password}
                onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && login()}
                placeholder="Введите пароль"
                className="bg-secondary/50 border-border"
              />
            </div>
            <Button
              onClick={login}
              disabled={loginLoading}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
            >
              {loginLoading ? (
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              ) : (
                <Icon name="LogIn" size={16} className="mr-2" />
              )}
              Войти
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 container">
      <div className="mb-10 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
            <Icon name="Shield" className="text-accent" size={22} />
          </div>
          <div>
            <h1 className="font-pixel text-xl text-accent neon-text-cyan">АДМИН-ПАНЕЛЬ</h1>
            <p className="text-muted-foreground text-sm">Выдача хостингов и управление серверами</p>
          </div>
        </div>
        <Button variant="outline" onClick={logout} className="border-border text-muted-foreground">
          <Icon name="LogOut" size={16} className="mr-2" /> Выйти
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: 'Server', label: 'Всего хостингов', value: hosts.length },
          { icon: 'Wifi', label: 'Онлайн', value: hosts.filter((h) => h.status === 'online').length },
          { icon: 'Users', label: 'Клиентов', value: new Set(hosts.map((h) => h.tg_user)).size },
          { icon: 'Gem', label: 'Diamond планов', value: hosts.filter((h) => h.plan === 'DIAMOND').length },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-5 border border-border">
            <Icon name={s.icon} className="text-accent mb-2" size={20} />
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <div className="glass rounded-2xl p-6 border border-border h-fit">
          <h3 className="font-semibold mb-5 flex items-center gap-2">
            <Icon name="PlusCircle" size={18} className="text-primary" /> Выдать хостинг
          </h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm mb-1.5 block">Telegram клиента</Label>
              <Input
                placeholder="@username"
                value={form.user}
                onChange={(e) => setForm({ ...form, user: e.target.value })}
                className="bg-secondary/50 border-border"
              />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Название сервера</Label>
              <Input
                placeholder="My Survival"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-secondary/50 border-border"
              />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Тариф</Label>
              <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STONE">STONE — 2 ГБ</SelectItem>
                  <SelectItem value="IRON">IRON — 4 ГБ</SelectItem>
                  <SelectItem value="DIAMOND">DIAMOND — 8 ГБ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={issue} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              <Icon name="Check" size={16} className="mr-2" /> Выдать
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {loading && (
            <div className="glass rounded-xl p-10 border border-border text-center text-muted-foreground">
              <Icon name="Loader2" size={28} className="animate-spin mx-auto mb-2 text-accent" />
              Загрузка...
            </div>
          )}
          {!loading && hosts.length === 0 && (
            <div className="glass rounded-xl p-10 border border-border text-center text-muted-foreground">
              Пока нет выданных хостингов
            </div>
          )}
          {hosts.map((h) => (
            <div key={h.id} className="glass rounded-xl p-5 border border-border">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold">{h.server_name}</span>
                    <span className="font-pixel text-[9px] px-2 py-1 rounded bg-secondary text-primary">{h.plan}</span>
                    <button
                      onClick={() => toggleStatus(h)}
                      className={`flex items-center gap-1 text-xs ${h.status === 'online' ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${h.status === 'online' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                      {h.status === 'online' ? 'Онлайн' : 'Выключен'}
                    </button>
                  </div>
                  <div className="text-sm text-accent">{h.tg_user}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => remove(h.id)} className="text-destructive hover:bg-destructive/10">
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-secondary/40 rounded-lg p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">IP сервера</div>
                    <div className="font-mono text-sm truncate">{h.ip}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copy(h.ip)} className="shrink-0">
                    <Icon name="Copy" size={14} />
                  </Button>
                </div>

                <div className="bg-secondary/40 rounded-lg p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">RCON-пароль</div>
                    <div className="font-mono text-sm truncate">
                      {show === h.id ? h.rcon : '••••••••••'}
                    </div>
                  </div>
                  <div className="flex shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setShow(show === h.id ? null : h.id)}>
                      <Icon name={show === h.id ? 'EyeOff' : 'Eye'} size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => copy(h.rcon)}>
                      <Icon name="Copy" size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => regenRcon(h.id)} className="text-accent">
                      <Icon name="RefreshCw" size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
