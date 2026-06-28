import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Landing from '@/components/Landing';
import Cabinet from '@/components/Cabinet';
import Admin from '@/components/Admin';

const Index = () => {
  const [page, setPage] = useState('home');

  const scrollTo = (id: string) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navigate = (id: string) => {
    if (id === 'cabinet' || id === 'admin') {
      setPage(id);
      window.scrollTo({ top: 0 });
      return;
    }
    if (page !== 'home') {
      setPage('home');
      setTimeout(() => scrollTo(id), 100);
    } else {
      scrollTo(id);
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar active={page} onNavigate={navigate} />
      {page === 'home' && <Landing onNavigate={navigate} />}
      {page === 'cabinet' && <Cabinet />}
      {page === 'admin' && <Admin />}
    </div>
  );
};

export default Index;
