import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from '@/styles/nav.module.css';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import TuneIcon from '@mui/icons-material/Tune';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TableChartIcon from '@mui/icons-material/TableChart';

interface NavProps {
  orientation?: 'horizontal' | 'vertical';
}

// Componente React.
const Nav: React.FC<NavProps> = ({ orientation = 'horizontal' }) => {
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');
  const [navOrientation, setNavOrientation] = useState<'horizontal' | 'vertical'>(orientation);

  // Carregar orientação da nav
  useEffect(() => {
    const savedOrientation = localStorage.getItem('navOrientation');
    if (savedOrientation === 'horizontal' || savedOrientation === 'vertical') {
      setNavOrientation(savedOrientation);
    }
  }, []);

  // Salvar quando mudar
  useEffect(() => {
    localStorage.setItem('navOrientation', navOrientation);
  }, [navOrientation]);

  const toggleOrientation = () => {
    setNavOrientation((current) => (current === 'horizontal' ? 'vertical' : 'horizontal'));
  };

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
    <>
      {navOrientation === 'vertical' && (
        <div className={styles.topBar}>
          <button className={styles.menuButton}>
            ☰
          </button>
          <div className={styles.rightSideTopBar}>
            <div className={styles.logo}>
              <Link href="/">
                <img src="/favicon.png" alt="logo" width={40} height={36} />
              </Link>
            </div>
            <button
              type="button"
              onClick={toggleThemeMode}
              className={styles.themeButton}
            >
              {themeMode === 'system' ? (
                <>
                  <span className="responsive-icon"><TuneIcon /></span>
                  <span className="text-responsive">Sistema</span>
                </>
              ) : themeMode === 'light' ? (
                <>
                  <span className="responsive-icon"><Brightness7Icon /></span>
                  <span className="text-responsive">Claro</span>
                </>
              ) : (
                <>
                  <span className="responsive-icon"><Brightness4Icon /></span>
                  <span className="text-responsive">Escuro</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <nav className={`${styles.nav} ${navOrientation === 'vertical' ? styles.vertical : ''}`}>
        <div className={styles.navLinks}>
          <div className={styles.navItem}>
            <span className="icon"><Link href="/"><DashboardIcon /></Link></span>
            <span className="text-responsive"><Link href="/">Dashboard</Link></span>
          </div>
          <span>·</span>
          <div className={styles.navItem}>
            <span className="icon"><Link href="/resumo"><BarChartIcon /></Link></span>
            <span className="text-responsive"><Link href="/resumo">Resumo Mensal</Link></span>
          </div>
          <span>·</span>
          <div className={styles.navItem}>
            <span className="icon"><Link href="/historico"><HistoryIcon /></Link></span>
            <span className="text-responsive"><Link href="/historico">Histórico</Link></span>
          </div>
          <span>·</span>
          <div className={styles.navItem}>
            <span className="icon"><Link href="/contas-a-pagar"><AccountBalanceIcon /></Link></span>
            <span className="text-responsive"><Link href="/contas-a-pagar">Contas a pagar</Link></span>
          </div>
          <span>·</span>
          <div className={styles.navItem}>
            <span className="icon"><Link href="/tabela"><TableChartIcon /></Link></span>
            <span className="text-responsive"><Link href="/tabela">Tabela</Link></span>
          </div>
        </div>

        <div className={`${styles.rightSide} ${navOrientation === 'vertical' ? styles.vertical : ''}`}>
          <button onClick={toggleOrientation} className="hidden">
            {navOrientation === 'horizontal' ? 'Vertical' : 'Horizontal'}
          </button>
          <div className={styles.logo}>
            <Link href="/">
              <img src="/favicon.png" alt="logo" width={40} height={36} />
            </Link>
          </div>
          <button
            type="button"
            onClick={toggleThemeMode}
            className={styles.themeButton}
          >
            {themeMode === 'system' ? (
              <>
                <span className="responsive-icon"><TuneIcon /></span>
                <span className="text-responsive">Sistema</span>
              </>
            ) : themeMode === 'light' ? (
              <>
                <span className="responsive-icon"><Brightness7Icon /></span>
                <span className="text-responsive">Claro</span>
              </>
            ) : (
              <>
                <span className="responsive-icon"><Brightness4Icon /></span>
                <span className="text-responsive">Escuro</span>
              </>
            )}
          </button>
        </div>

      </nav>
    </>
  );
};

export default Nav;
