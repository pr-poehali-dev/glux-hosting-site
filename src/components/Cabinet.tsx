import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import AuthPage, { UserInfo } from '@/components/AuthPage';

const ADMIN_API = 'https://functions.poehali.dev/d512cd7c-b4f4-49e5-81a1-f4fc243fb5ae';
const AUTH_API = 'https://functions.poehali.dev/1fbe82fa-e88f-4f52-b46b-1e9bf6dce83d';
const USER_KEY = 'glux_user';

interface Server {
  id: number;
  server_name: string;
  ip: string;
  plan: string;
  status: 'online' | 'offline' | 'restarting';
  ram: number;
  version: string;
  auto_restart: boolean;
}

const statusMap = {
  online: { label: 'Онлайн', color: 'text-primary', dot: 'bg-primary' },
  offline: { label: 'Выключен', color: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  restarting: { label: 'Перезагрузка', color: 'text-accent', dot: 'bg-accent animate-pulse' },
};

interface ConsoleLine {
  type: 'cmd' | 'out' | 'sys';
  text: string;
}

const Cabinet = () => {
  const [user, setUser] = useState<UserInfo | null>(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
  });
  const [servers, setServers] = useState<Server[]>([]);
  const [loadingServers, setLoadingServers] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [tab, setTab] = useState<'overview' | 'console' | 'settings'>('overview');
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([
    { type: 'sys', text: '[Glux] Консоль подключена. Введите "help" для списка команд.' },
  ]);
  const [cmd, setCmd] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [sendingCmd, setSendingCmd] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLines]);

  useEffect(() => {
    if (user) loadServers();
  }, [user]);

  const loadServers = async () => {
    if (!user) return;
    setLoadingServers(true);
    try {
      const res = await fetch(`${AUTH_API}?action=my_servers&user_id=${user.id}`, {
        headers: { 'X-User-Token': user.token },
      });
      const data = await res.json();
      setServers(data.servers || []);
      if (data.servers?.length > 0) setSelected(data.servers[0].id);
    } catch {
      toast.error('Ошибка загрузки серверов');
    } finally {
      setLoadingServers(false);
    }
  };

  const handleAuth = (u: UserInfo) => {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setServers([]);
    setSelected(null);
  };

  const server = servers.find((s) => s.id === selected);

  const updateServer = (id: number, patch: Partial<Server>) =>
    setServers((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const toggleServer = async (s: Server) => {
    const newStatus = s.status === 'online' ? 'offline' : 'online';
    updateServer(s.id, { status: newStatus });
    setConsoleLines((p) => [...p, {
      type: 'sys',
      text: newStatus === 'online' ? '[Glux] Сервер запускается...' : '[Glux] Сервер останавливается...',
    }]);
    toast.success(newStatus === 'online' ? `${s.server_name} запущен` : `${s.server_name} остановлен`);
  };

  const restartServer = (s: Server) => {
    updateServer(s.id, { status: 'restarting' });
    setConsoleLines((p) => [...p, { type: 'sys', text: '[Glux] Перезагрузка сервера...' }]);
    toast.info(`Перезагрузка ${s.server_name}...`);
    setTimeout(() => {
      updateServer(s.id, { status: 'online' });
      setConsoleLines((p) => [...p, { type: 'sys', text: '[Glux] Сервер успешно перезагружен.' }]);
      toast.success(`${s.server_name} перезагружен`);
    }, 2500);
  };

  const sendCmd = async () => {
    const c = cmd.trim();
    if (!c || !selected) return;
    setConsoleLines((p) => [...p, { type: 'cmd', text: `> ${c}` }]);
    setCmdHistory((p) => [c, ...p.slice(0, 49)]);
    setHistIdx(-1);
    setCmd('');
    setSendingCmd(true);
    try {
      const res = await fetch(`${ADMIN_API}?action=console`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': '' },
        body: JSON.stringify({ host_id: selected, cmd: c }),
      });
      const data = await res.json();
      const entries: ConsoleLine[] = (data.logs || [])
        .slice(-1)
        .flatMap((e: { cmd: string; out: string[] }) =>
          e.out.map((line: string) => ({ type: 'out' as const, text: line }))
        );
      if (entries.length) setConsoleLines((p) => [...p, ...entries]);
    } catch {
      setConsoleLines((p) => [...p, { type: 'sys', text: '[Glux] Ошибка отправки команды' }]);
    } finally {
      setSendingCmd(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { sendCmd(); return; }
    if (e.key === 'ArrowUp') {
      const idx = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(idx);
      setCmd(cmdHistory[idx] || '');
    }
    if (e.key === 'ArrowDown') {
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setCmd(idx === -1 ? '' : cmdHistory[idx]);
    }
  };

  const lineColor = (type: ConsoleLine['type']) => {
    if (type === 'cmd') return 'text-accent';
    if (type === 'sys') return 'text-primary/70';
    return 'text-foreground/80';
  };

  // Не авторизован — экран входа/регистрации
  if (!user) return <AuthPage onAuth={handleAuth} />;

  return (
    <div className="pt-24 pb-20 container">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-pixel text-2xl text-primary neon-text mb-1">ЛИЧНЫЙ КАБИНЕТ</h1>
          <p className="text-muted-foreground text-sm">Привет, <span className="text-foreground font-medium">{user.username}</span>!</p>
        </div>
        <Button variant="outline" onClick={logout} className="border-border text-muted-foreground text-sm">
          <Icon name="LogOut" size={15} className="mr-2" /> Выйти
        </Button>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="space-y-3">
          {loadingServers && (
            <div className="glass rounded-xl p-6 border border-border text-center text-muted-foreground text-sm">
              <Icon name="Loader2" size={20} className="animate-spin mx-auto mb-2 text-primary" />
              Загрузка серверов...
            </div>
          )}
          {!loadingServers && servers.length === 0 && (
            <div className="glass rounded-xl p-6 border border-border text-center">
              <Icon name="Server" size={28} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">У тебя пока нет серверов</p>
              <p className="text-xs text-muted-foreground">
                Купи тариф через{' '}
                <button onClick={() => window.open('https://t.me/virtso', '_blank')} className="text-primary hover:underline">
                  @virtso
                </button>{' '}
                и укажи никнейм: <span className="text-accent font-mono">@{user.username}</span>
              </p>
            </div>
          )}
          {servers.map((s) => {
            const st = statusMap[s.status] || statusMap.offline;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={`w-full text-left glass rounded-xl p-4 border transition-all ${
                  selected === s.id ? 'border-primary neon-border' : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold truncate">{s.server_name}</span>
                  <span className={`flex items-center gap-1 text-xs ${st.color}`}>
                    <span className={`w-2 h-2 rounded-full ${st.dot}`} /> {st.label}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-mono">{s.ip}</div>
              </button>
            );
          })}
          <Button
            variant="outline"
            onClick={() => window.open('https://t.me/virtso', '_blank')}
            className="w-full border-dashed border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Icon name="Plus" size={16} className="mr-2" /> Добавить сервер
          </Button>
        </aside>

        {/* Main */}
        {server ? (
          <main className="space-y-4">
            <div className="glass rounded-2xl p-5 border border-border">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold">{server.server_name}</h2>
                    <span className="font-pixel text-[10px] px-2 py-1 rounded bg-secondary text-primary">{server.plan}</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">{server.ip}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleServer(server)}
                    className={server.status === 'online'
                      ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'}
                  >
                    <Icon name={server.status === 'online' ? 'Power' : 'Play'} size={16} className="mr-2" />
                    {server.status === 'online' ? 'Стоп' : 'Запуск'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => restartServer(server)}
                    disabled={server.status === 'restarting'}
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icon name="RotateCw" size={16} className="mr-2" /> Рестарт
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 glass rounded-xl p-1 border border-border w-fit">
              {([['overview', 'Обзор', 'LayoutDashboard'], ['console', 'Консоль', 'Terminal'], ['settings', 'Настройки', 'Settings']] as const).map(([id, label, icon]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tab === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name={icon} size={15} /> {label}
                </button>
              ))}
            </div>

            {tab === 'overview' && (
              <div className="glass rounded-2xl p-6 border border-border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: 'MemoryStick', label: 'RAM', value: `${(server.ram / 1024).toFixed(0)} ГБ` },
                    { icon: 'Tag', label: 'Версия', value: server.version },
                    { icon: 'Activity', label: 'Статус', value: (statusMap[server.status] || statusMap.offline).label },
                    { icon: 'Gem', label: 'Тариф', value: server.plan },
                  ].map((m) => (
                    <div key={m.label} className="bg-secondary/40 rounded-xl p-4">
                      <Icon name={m.icon} className="text-primary mb-2" size={18} />
                      <div className="text-xs text-muted-foreground">{m.label}</div>
                      <div className="font-semibold">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'console' && (
              <div className="glass rounded-2xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Icon name="Terminal" size={16} className="text-primary" />
                    <span>Консоль — {server.server_name}</span>
                    <span className={`w-2 h-2 rounded-full ml-1 ${(statusMap[server.status] || statusMap.offline).dot}`} />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setConsoleLines([{ type: 'sys', text: '[Glux] Консоль очищена.' }])} className="text-muted-foreground text-xs">
                    <Icon name="Trash2" size={13} className="mr-1" /> Очистить
                  </Button>
                </div>
                <div
                  className="h-80 overflow-y-auto p-4 font-mono text-xs space-y-0.5 bg-background/60"
                  onClick={() => inputRef.current?.focus()}
                >
                  {consoleLines.map((line, i) => (
                    <div key={i} className={`leading-5 ${lineColor(line.type)}`}>{line.text}</div>
                  ))}
                  <div ref={consoleEndRef} />
                </div>
                <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-secondary/20">
                  <span className="text-primary font-mono text-sm select-none">{'>'}</span>
                  <Input
                    ref={inputRef}
                    value={cmd}
                    onChange={(e) => setCmd(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="list, say Привет, help..."
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 font-mono text-sm h-8 p-0 placeholder:text-muted-foreground/50"
                    disabled={sendingCmd}
                    autoFocus
                  />
                  <Button size="sm" onClick={sendCmd} disabled={sendingCmd || !cmd.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90 h-8">
                    {sendingCmd ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Send" size={14} />}
                  </Button>
                </div>
              </div>
            )}

            {tab === 'settings' && (
              <div className="glass rounded-2xl p-6 border border-border space-y-6">
                <div>
                  <div className="flex justify-between mb-2 text-sm">
                    <span>Выделенная память (RAM)</span>
                    <span className="text-primary font-medium">{(server.ram / 1024).toFixed(0)} ГБ</span>
                  </div>
                  <Slider value={[server.ram]} min={2048} max={8192} step={1024} onValueChange={([v]) => updateServer(server.id, { ram: v })} />
                </div>
                <div className="flex items-center justify-between py-3 border-t border-border">
                  <div>
                    <div className="text-sm font-medium">Авто-перезагрузка</div>
                    <div className="text-xs text-muted-foreground">Перезапуск каждые 6 часов</div>
                  </div>
                  <Switch
                    checked={server.auto_restart}
                    onCheckedChange={(v) => {
                      updateServer(server.id, { auto_restart: v });
                      toast.success(v ? 'Авто-перезагрузка включена' : 'Выключена');
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button variant="outline" onClick={() => toast.success('Бэкап создаётся...')} className="border-border">
                    <Icon name="Database" size={16} className="mr-2" /> Создать бэкап
                  </Button>
                  <Button variant="outline" onClick={() => toast.info('Скоро')} className="border-border">
                    <Icon name="FolderOpen" size={16} className="mr-2" /> Файлы
                  </Button>
                </div>
              </div>
            )}
          </main>
        ) : (
          !loadingServers && servers.length > 0 && (
            <div className="glass rounded-2xl p-10 border border-border flex items-center justify-center text-muted-foreground">
              Выбери сервер слева
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Cabinet;
