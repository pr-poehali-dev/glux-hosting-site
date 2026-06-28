import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface Server {
  id: number;
  name: string;
  ip: string;
  plan: string;
  status: 'online' | 'offline' | 'restarting';
  players: string;
  ram: number;
  version: string;
  autoRestart: boolean;
}

const initialServers: Server[] = [
  { id: 1, name: 'SkyBlock Survival', ip: 'mc.glux.host:25565', plan: 'IRON', status: 'online', players: '12/30', ram: 4096, version: '1.20.4', autoRestart: true },
  { id: 2, name: 'Anarchy World', ip: 'anarchy.glux.host:25566', plan: 'DIAMOND', status: 'offline', players: '0/100', ram: 8192, version: '1.20.1', autoRestart: false },
];

const statusMap = {
  online: { label: 'Онлайн', color: 'text-primary', dot: 'bg-primary' },
  offline: { label: 'Выключен', color: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  restarting: { label: 'Перезагрузка', color: 'text-accent', dot: 'bg-accent animate-pulse' },
};

const Cabinet = () => {
  const [servers, setServers] = useState(initialServers);
  const [selected, setSelected] = useState<number>(1);
  const server = servers.find((s) => s.id === selected)!;

  const update = (id: number, patch: Partial<Server>) =>
    setServers((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const toggle = (s: Server) => {
    const next = s.status === 'online' ? 'offline' : 'online';
    update(s.id, { status: next });
    toast.success(next === 'online' ? `${s.name} запущен` : `${s.name} остановлен`);
  };

  const restart = (s: Server) => {
    update(s.id, { status: 'restarting' });
    toast.info(`Перезагрузка ${s.name}...`);
    setTimeout(() => {
      update(s.id, { status: 'online' });
      toast.success(`${s.name} перезагружен`);
    }, 2500);
  };

  return (
    <div className="pt-24 pb-20 container">
      <div className="mb-10">
        <h1 className="font-pixel text-2xl text-primary neon-text mb-2">ЛИЧНЫЙ КАБИНЕТ</h1>
        <p className="text-muted-foreground">Управляй своими серверами в одном месте</p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Server list */}
        <aside className="space-y-3">
          {servers.map((s) => {
            const st = statusMap[s.status];
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={`w-full text-left glass rounded-xl p-4 border transition-all ${
                  selected === s.id ? 'border-primary neon-border' : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold truncate">{s.name}</span>
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

        {/* Server panel */}
        <main className="space-y-6">
          <div className="glass rounded-2xl p-6 border border-border">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold">{server.name}</h2>
                  <span className="font-pixel text-[10px] px-2 py-1 rounded bg-secondary text-primary">{server.plan}</span>
                </div>
                <p className="text-sm text-muted-foreground font-mono">{server.ip}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => toggle(server)}
                  className={server.status === 'online' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}
                >
                  <Icon name={server.status === 'online' ? 'Power' : 'Play'} size={16} className="mr-2" />
                  {server.status === 'online' ? 'Стоп' : 'Запуск'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => restart(server)}
                  disabled={server.status === 'restarting'}
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon name="RotateCw" size={16} className="mr-2" /> Рестарт
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: 'Users', label: 'Игроки', value: server.players },
                { icon: 'MemoryStick', label: 'RAM', value: `${(server.ram / 1024).toFixed(0)} ГБ` },
                { icon: 'Tag', label: 'Версия', value: server.version },
                { icon: 'Activity', label: 'Статус', value: statusMap[server.status].label },
              ].map((m) => (
                <div key={m.label} className="bg-secondary/40 rounded-xl p-4">
                  <Icon name={m.icon} className="text-primary mb-2" size={18} />
                  <div className="text-xs text-muted-foreground">{m.label}</div>
                  <div className="font-semibold">{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="glass rounded-2xl p-6 border border-border">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Icon name="Settings" size={18} className="text-primary" /> Настройки сервера
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>Выделенная память (RAM)</span>
                  <span className="text-primary font-medium">{(server.ram / 1024).toFixed(0)} ГБ</span>
                </div>
                <Slider
                  value={[server.ram]}
                  min={2048}
                  max={8192}
                  step={1024}
                  onValueChange={([v]) => update(server.id, { ram: v })}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <div className="text-sm font-medium">Авто-перезагрузка</div>
                  <div className="text-xs text-muted-foreground">Перезапуск каждые 6 часов</div>
                </div>
                <Switch
                  checked={server.autoRestart}
                  onCheckedChange={(v) => {
                    update(server.id, { autoRestart: v });
                    toast.success(v ? 'Авто-перезагрузка включена' : 'Авто-перезагрузка выключена');
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant="outline" onClick={() => toast.info('Консоль откроется в следующей версии')} className="border-border">
                  <Icon name="Terminal" size={16} className="mr-2" /> Консоль
                </Button>
                <Button variant="outline" onClick={() => toast.success('Бэкап создаётся...')} className="border-border">
                  <Icon name="Database" size={16} className="mr-2" /> Создать бэкап
                </Button>
                <Button variant="outline" onClick={() => toast.info('Загрузка файлов скоро')} className="border-border">
                  <Icon name="FolderOpen" size={16} className="mr-2" /> Файлы
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Cabinet;
