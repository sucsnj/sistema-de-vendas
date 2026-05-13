import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from '@/styles/nav.module.css';

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
    <nav className={styles.nav}>
      <div className={styles.navLinks}>
        <Link href="/">Dashboard</Link>
        <span>·</span>
        <Link href="/resumo">Resumo Mensal</Link>
        <span>·</span>
        <Link href="/historico">Histórico</Link>
        <span>·</span>
        <Link href="/contas-a-pagar">Contas a pagar</Link>
        <span>·</span>
        <Link href="/tabela">Tabela</Link>
      </div>
      <button
        type="button"
        onClick={toggleThemeMode}
        className={styles.themeButton}
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