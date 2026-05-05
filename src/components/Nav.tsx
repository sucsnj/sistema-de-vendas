import Link from 'next/link';

const Nav: React.FC = () => {
  return (
    <nav style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
      <Link href="/">Dashboard</Link> | 
      <Link href="/resumo"> Resumo Mensal</Link> | 
      <Link href="/historico"> Histórico</Link>
    </nav>
  );
};

export default Nav;