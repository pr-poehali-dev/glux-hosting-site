import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AUTH_API = 'https://functions.poehali.dev/1fbe82fa-e88f-4f52-b46b-1e9bf6dce83d';

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  tg_username: string;
  token: string;
}

interface AuthPageProps {
  onAuth: (user: UserInfo) => void;
}

const AuthPage = ({ onAuth }: AuthPageProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [regForm, setRegForm] = useState({ username: '', email: '', password: '', password2: '', tg_username: '' });

  const doLogin = async () => {
    if (!loginForm.login || !loginForm.password) {
      toast.error('Введите логин и пароль');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${AUTH_API}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Добро пожаловать, ${data.user.username}!`);
        onAuth({ ...data.user, token: data.token });
      } else {
        toast.error(data.error || 'Ошибка входа');
      }
    } catch {
      toast.error('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const doRegister = async () => {
    if (!regForm.username || !regForm.email || !regForm.password) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    if (regForm.password !== regForm.password2) {
      toast.error('Пароли не совпадают');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${AUTH_API}?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Аккаунт создан! Добро пожаловать!');
        onAuth({ ...data.user, token: data.token });
      } else {
        toast.error(data.error || 'Ошибка регистрации');
      }
    } catch {
      toast.error('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 container flex justify-center">
      <div className="w-full max-w-md mt-6">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <Icon name="Box" className="text-primary" size={28} />
          </div>
          <h1 className="font-pixel text-base text-primary neon-text mb-2">ЛИЧНЫЙ КАБИНЕТ</h1>
          <p className="text-sm text-muted-foreground">Войди или создай аккаунт Glux-Hosting</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-xl p-1 border border-border mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'login' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="LogIn" size={14} className="inline mr-1" /> Вход
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'register' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="UserPlus" size={14} className="inline mr-1" /> Регистрация
          </button>
        </div>

        <div className="glass rounded-2xl p-7 border border-border neon-border">
          {mode === 'login' ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm mb-1.5 block">Логин или Email</Label>
                <Input
                  value={loginForm.login}
                  onChange={(e) => setLoginForm({ ...loginForm, login: e.target.value })}
                  placeholder="username или email@mail.ru"
                  className="bg-secondary/50 border-border"
                  onKeyDown={(e) => e.key === 'Enter' && doLogin()}
                />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Пароль</Label>
                <Input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Введите пароль"
                  className="bg-secondary/50 border-border"
                  onKeyDown={(e) => e.key === 'Enter' && doLogin()}
                />
              </div>
              <Button
                onClick={doLogin}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold mt-2"
              >
                {loading ? <Icon name="Loader2" size={16} className="mr-2 animate-spin" /> : <Icon name="LogIn" size={16} className="mr-2" />}
                Войти
              </Button>
              <p className="text-center text-xs text-muted-foreground pt-1">
                Нет аккаунта?{' '}
                <button onClick={() => setMode('register')} className="text-primary hover:underline">
                  Зарегистрироваться
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm mb-1.5 block">Никнейм <span className="text-destructive">*</span></Label>
                <Input
                  value={regForm.username}
                  onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                  placeholder="Минимум 3 символа"
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Email <span className="text-destructive">*</span></Label>
                <Input
                  type="email"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  placeholder="your@email.ru"
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Telegram (необязательно)</Label>
                <Input
                  value={regForm.tg_username}
                  onChange={(e) => setRegForm({ ...regForm, tg_username: e.target.value })}
                  placeholder="@username"
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Пароль <span className="text-destructive">*</span></Label>
                <Input
                  type="password"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  placeholder="Минимум 4 символа"
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Повторите пароль <span className="text-destructive">*</span></Label>
                <Input
                  type="password"
                  value={regForm.password2}
                  onChange={(e) => setRegForm({ ...regForm, password2: e.target.value })}
                  placeholder="Повторите пароль"
                  className="bg-secondary/50 border-border"
                  onKeyDown={(e) => e.key === 'Enter' && doRegister()}
                />
              </div>
              <Button
                onClick={doRegister}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold mt-2"
              >
                {loading ? <Icon name="Loader2" size={16} className="mr-2 animate-spin" /> : <Icon name="UserPlus" size={16} className="mr-2" />}
                Создать аккаунт
              </Button>
              <p className="text-center text-xs text-muted-foreground pt-1">
                Уже есть аккаунт?{' '}
                <button onClick={() => setMode('login')} className="text-primary hover:underline">
                  Войти
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
