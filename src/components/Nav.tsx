import Link from 'next/link';
import { useEffect, useState } from 'react';

const Nav: React.FC = () => {
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('themeMode');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      setThemeMode(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (themeMode === 'system') {
      document.documentElement.classList.remove('light', 'dark');
    } else {
      document.documentElement.classList.add(themeMode);
      document.documentElement.classList.remove(themeMode === 'light' ? 'dark' : 'light');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeMode', themeMode);
    }
  }, [themeMode]);

  const toggleThemeMode = () => {
    setThemeMode((current) =>
      current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system',
    );
  };

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <Link href="/">Dashboard</Link>
        <span>·</span>
        <Link href="/resumo">Resumo Mensal</Link>
        <span>·</span>
        <Link href="/historico">Histórico</Link>
        <span>·</span>
        <Link href="/contas-a-pagar">Contas a pagar</Link>
      </div>
      <button
        type="button"
        onClick={toggleThemeMode}
        style={{ marginLeft: 'auto', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.12)', color: 'inherit', padding: '8px 14px', cursor: 'pointer' }}
      >
        {themeMode === 'system'
          ? 'Modo: Sistema'
          : themeMode === 'light'
          ? 'Modo: Claro'
          : 'Modo: Escuro'}
      </button>
    </nav>
  );
};

export default Nav;