import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const TG_LINK = 'https://t.me/virtso';
const EMAIL = 'GluxHosting.official@yandex.ru';

const plans = [
  {
    name: 'STONE',
    price: '149',
    ram: '2 ГБ',
    color: 'text-muted-foreground',
    features: ['2 ГБ RAM', '2 ядра CPU', '10 GB SSD', 'До 10 игроков', 'Защита от DDoS'],
    popular: false,
  },
  {
    name: 'IRON',
    price: '349',
    ram: '4 ГБ',
    color: 'text-primary',
    features: ['4 ГБ RAM', '3 ядра CPU', '25 GB SSD', 'До 30 игроков', 'Защита от DDoS', 'Бэкапы каждый день'],
    popular: true,
  },
  {
    name: 'DIAMOND',
    price: '699',
    ram: '8 ГБ',
    color: 'text-accent',
    features: ['8 ГБ RAM', '4 ядра CPU', '60 GB SSD', 'Безлимит игроков', 'Защита от DDoS', 'Бэкапы + приоритет'],
    popular: false,
  },
];

const advantages = [
  { icon: 'Zap', title: 'Мгновенный запуск', text: 'Сервер готов к работе через 60 секунд после оплаты.' },
  { icon: 'ShieldCheck', title: 'Защита DDoS', text: 'Многоуровневая защита от атак на всех тарифах.' },
  { icon: 'Cpu', title: 'Мощное железо', text: 'Процессоры Ryzen и NVMe SSD-диски.' },
  { icon: 'Clock', title: 'Аптайм 99.9%', text: 'Ваш сервер всегда онлайн, без простоев.' },
];

interface LandingProps {
  onNavigate: (id: string) => void;
}

const Landing = ({ onNavigate }: LandingProps) => {
  return (
    <div className="pt-16">
      {/* HERO */}
      <section className="relative overflow-hidden grid-bg">
        <div className="container py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 text-primary text-xs mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Серверы онлайн 24/7
            </div>
            <h1 className="font-pixel text-3xl md:text-5xl leading-tight mb-6">
              <span className="text-foreground">GLUX</span>
              <span className="text-primary neon-text">-HOSTING</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              Мощный хостинг для серверов Minecraft. Запусти свой мир за минуту и собери друзей онлайн.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => onNavigate('pricing')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow font-semibold"
              >
                <Icon name="Rocket" size={18} className="mr-2" /> Выбрать тариф
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('cabinet')}
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              >
                <Icon name="LayoutDashboard" size={18} className="mr-2" /> Личный кабинет
              </Button>
            </div>
            <div className="flex gap-8 mt-12">
              {[['2000+', 'серверов'], ['99.9%', 'аптайм'], ['24/7', 'поддержка']].map(([n, t]) => (
                <div key={t}>
                  <div className="font-pixel text-lg text-primary">{n}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-float">
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
            <img
              src="https://cdn.poehali.dev/projects/047c577a-2254-42a2-8328-da8db51a3c38/files/9c9a4879-9203-418d-acfd-7dad77220417.jpg"
              alt="Glux Hosting"
              className="relative rounded-2xl neon-border w-full"
            />
          </div>
        </div>
      </section>

      {/* ADVANTAGES */}
      <section className="container py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((a) => (
            <div key={a.title} className="glass rounded-xl p-6 border border-border glow-on-hover">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon name={a.icon} className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold mb-2">{a.title}</h3>
              <p className="text-sm text-muted-foreground">{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="container py-20">
        <div className="text-center mb-14">
          <h2 className="font-pixel text-2xl md:text-3xl mb-4 text-primary neon-text">ТАРИФЫ</h2>
          <p className="text-muted-foreground">Выбери подходящий план для своего сервера</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative glass rounded-2xl p-8 border transition-all hover:-translate-y-2 ${
                p.popular ? 'border-primary neon-border' : 'border-border'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  ХИТ
                </div>
              )}
              <div className={`font-pixel text-lg mb-4 ${p.color}`}>{p.name}</div>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-muted-foreground mb-1">₽/мес</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => window.open(TG_LINK, '_blank')}
                className={`w-full font-semibold ${
                  p.popular
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                <Icon name="Send" size={16} className="mr-2" /> Купить через ТГ
              </Button>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">
          Покупка и активация через Telegram <span className="text-accent">@virtso</span>
        </p>
      </section>

      {/* ABOUT */}
      <section id="about" className="container py-20">
        <div className="glass rounded-2xl p-10 md:p-14 border border-border grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-pixel text-xl md:text-2xl mb-6 text-accent neon-text-cyan">О НАС</h2>
            <p className="text-muted-foreground mb-4">
              Glux-Hosting — это команда геймеров и инженеров, которые создали хостинг своей мечты.
              Мы знаем, что важно для сервера Minecraft: скорость, стабильность и удобство.
            </p>
            <p className="text-muted-foreground">
              Наша инфраструктура построена на современном железе с защитой от DDoS и круглосуточным
              мониторингом. Тысячи игроков уже выбрали нас.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[['Server', '2000+', 'активных серверов'], ['Users', '15k+', 'игроков'], ['MapPin', '3', 'дата-центра'], ['Star', '4.9', 'рейтинг']].map(([icon, n, t]) => (
              <div key={t} className="bg-secondary/50 rounded-xl p-5 text-center">
                <Icon name={icon} className="text-primary mx-auto mb-2" size={24} />
                <div className="font-pixel text-base text-foreground">{n}</div>
                <div className="text-xs text-muted-foreground mt-1">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPORT */}
      <section id="support" className="container py-20">
        <div className="text-center mb-12">
          <h2 className="font-pixel text-2xl md:text-3xl mb-4 text-primary neon-text">ПОДДЕРЖКА</h2>
          <p className="text-muted-foreground">Мы на связи в любое время суток</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: 'MessageCircle', title: 'Telegram', text: 'Самый быстрый ответ — пиши в наш ТГ.', action: () => window.open(TG_LINK, '_blank'), btn: '@virtso' },
            { icon: 'Mail', title: 'Email', text: 'Опиши проблему детально на почту.', action: () => window.open(`mailto:${EMAIL}`), btn: 'Написать' },
            { icon: 'BookOpen', title: 'База знаний', text: 'Инструкции по настройке сервера.', action: () => onNavigate('cabinet'), btn: 'Открыть' },
          ].map((s) => (
            <div key={s.title} className="glass rounded-xl p-6 border border-border text-center glow-on-hover">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon name={s.icon} className="text-primary" size={26} />
              </div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{s.text}</p>
              <Button variant="outline" onClick={s.action} className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground">
                {s.btn}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="container py-20">
        <div className="glass rounded-2xl p-10 md:p-14 border border-border max-w-3xl mx-auto text-center">
          <h2 className="font-pixel text-xl md:text-2xl mb-6 text-accent neon-text-cyan">КОНТАКТЫ</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.open(TG_LINK, '_blank')}
              className="flex items-center gap-3 bg-secondary/50 rounded-xl px-6 py-4 hover:bg-secondary transition-colors"
            >
              <Icon name="Send" className="text-primary" size={22} />
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Telegram</div>
                <div className="font-medium">@virtso</div>
              </div>
            </button>
            <button
              onClick={() => window.open(`mailto:${EMAIL}`)}
              className="flex items-center gap-3 bg-secondary/50 rounded-xl px-6 py-4 hover:bg-secondary transition-colors"
            >
              <Icon name="Mail" className="text-accent" size={22} />
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="font-medium text-sm">{EMAIL}</div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border mt-10">
        <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <Icon name="Box" className="text-primary-foreground" size={16} />
            </div>
            <span className="font-pixel text-xs text-primary">GLUX-HOSTING</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Glux-Hosting. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
