import { useState } from 'react';
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

interface Host {
  id: number;
  user: string;
  name: string;
  plan: string;
  ip: string;
  rcon: string;
  status: 'online' | 'offline';
}

const initialHosts: Host[] = [
  { id: 1, user: '@steve', name: 'SkyBlock Survival', plan: 'IRON', ip: 'mc.glux.host:25565', rcon: 'rcon_a8f3k2', status: 'online' },
  { id: 2, user: '@alex', name: 'Anarchy World', plan: 'DIAMOND', ip: 'anarchy.glux.host:25566', rcon: 'rcon_x91zp7', status: 'offline' },
];

const genRcon = () => 'rcon_' + Math.random().toString(36).slice(2, 8);
const genIp = () => `srv${Math.floor(Math.random() * 900 + 100)}.glux.host:255${Math.floor(Math.random() * 90 + 10)}`;

const Admin = () => {
  const [hosts, setHosts] = useState(initialHosts);
  const [show, setShow] = useState<number | null>(null);
  const [form, setForm] = useState({ user: '', name: '', plan: 'IRON' });

  const issue = () => {
    if (!form.user || !form.name) {
      toast.error('Заполни TG-пользователя и название сервера');
      return;
    }
    const newHost: Host = {
      id: Date.now(),
      user: form.user.startsWith('@') ? form.user : '@' + form.user,
      name: form.name,
      plan: form.plan,
      ip: genIp(),
      rcon: genRcon(),
      status: 'online',
    };
    setHosts((p) => [newHost, ...p]);
    setForm({ user: '', name: '', plan: 'IRON' });
    toast.success(`Хостинг выдан для ${newHost.user}`);
  };

  const regenRcon = (id: number) => {
    setHosts((p) => p.map((h) => (h.id === id ? { ...h, rcon: genRcon() } : h)));
    toast.success('RCON-пароль обновлён');
  };

  const remove = (id: number) => {
    setHosts((p) => p.filter((h) => h.id !== id));
    toast.success('Хостинг удалён');
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Скопировано');
  };

  return (
    <div className="pt-24 pb-20 container">
      <div className="mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
          <Icon name="Shield" className="text-accent" size={22} />
        </div>
        <div>
          <h1 className="font-pixel text-xl text-accent neon-text-cyan">АДМИН-ПАНЕЛЬ</h1>
          <p className="text-muted-foreground text-sm">Выдача хостингов и управление серверами</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: 'Server', label: 'Всего хостингов', value: hosts.length },
          { icon: 'Wifi', label: 'Онлайн', value: hosts.filter((h) => h.status === 'online').length },
          { icon: 'Users', label: 'Клиентов', value: new Set(hosts.map((h) => h.user)).size },
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
        {/* Issue form */}
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

        {/* Hosts table */}
        <div className="space-y-3">
          {hosts.map((h) => (
            <div key={h.id} className="glass rounded-xl p-5 border border-border">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{h.name}</span>
                    <span className="font-pixel text-[9px] px-2 py-1 rounded bg-secondary text-primary">{h.plan}</span>
                    <span className={`flex items-center gap-1 text-xs ${h.status === 'online' ? 'text-primary' : 'text-muted-foreground'}`}>
                      <span className={`w-2 h-2 rounded-full ${h.status === 'online' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                      {h.status === 'online' ? 'Онлайн' : 'Выключен'}
                    </span>
                  </div>
                  <div className="text-sm text-accent">{h.user}</div>
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
