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

const Nav: React.FC = () => {
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');

  // Pega o tema salvo no localStorage.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('themeMode');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      setThemeMode(saved);
    }
  }, []);

  // Controla o tema.
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

  // Alterna o tema.
  const toggleThemeMode = () => {
    setThemeMode((current) =>
      current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system',
    );
  };

  return (
    <nav className={styles.nav}>
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

      <div className={styles.rightSide}>
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
              <span className="responsive-icon">
                <TuneIcon />
              </span>
              <span className="text-responsive">Sistema</span>
            </>
          ) : themeMode === 'light' ? (
            <>
              <span className="responsive-icon">
                <Brightness7Icon />
              </span>
              <span className="text-responsive">&nbsp;&nbsp;Claro&nbsp;&nbsp;</span>
            </>
          ) : (
            <>
              <span className="responsive-icon">
                <Brightness4Icon />
              </span>
              <span className="text-responsive">Escuro&nbsp;&nbsp;</span>
            </>
          )}
        </button>
      </div>
    </nav>

  );
};

export default Nav;
