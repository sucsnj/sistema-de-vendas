import Database from 'better-sqlite3';
import path from 'path';
import { format } from 'date-fns-tz'

// Conexão local com o banco de dados SQLite usado pelo aplicativo.
// O arquivo `vendas.db` permanece fora do controle de versão e é mantido no diretório do projeto.
const dbPath = path.join(process.cwd(), 'vendas.db');

let db: Database.Database;

try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = FULL');
} catch (error) {
  console.error('Erro ao conectar ao banco:', error);
  throw error;
}

// Cria as tabelas necessárias para o histórico de vendas e o resumo mensal caso ainda não existam.
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS vendas_diarias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      valor REAL NOT NULL,
      observacoes TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vendas_mensais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mes INTEGER NOT NULL,
      ano INTEGER NOT NULL,
      ticketMedio REAL NOT NULL DEFAULT 0,
      mediaClientes INTEGER NOT NULL DEFAULT 0,
      melhorDia TEXT NOT NULL DEFAULT 'N/A',
      maiorVenda REAL NOT NULL DEFAULT 0,
      qtdVendas INTEGER NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      UNIQUE(mes, ano)
    );
  `);
} catch (error) {
  console.error('Erro ao criar tabelas:', error);
}

const getLocalTimestamp = () => {
  return format(new Date(), 'yyyy-MM-dd HH:mm:ss', { timeZone: 'America/Recife' });
};

// Funções de acesso ao banco de dados e operações de persistência.
export const insertDailySale = (data: string, valor: number, observacoes?: string) => {
  try {
    const criadoEm = getLocalTimestamp();
    const stmt = db.prepare('INSERT INTO vendas_diarias (data, valor, observacoes, criado_em) VALUES (?, ?, ?, ?)');
    const result = stmt.run(data, valor, observacoes || null, criadoEm);
    return result;
  } catch (error) {
    console.error('Erro ao inserir venda:', error);
    throw error;
  }
};

export const getDailySales = (mes: number, ano: number) => {
  try {
    const startDate = `${ano}-${String(mes).padStart(2, '0')}-01`;
    // Calcula o último dia do mês selecionado para limitar a consulta de vendas.
    const ultimoDia = new Date(ano, mes, 0).toISOString().split('T')[0];

    const stmt = db.prepare('SELECT * FROM vendas_diarias WHERE data >= ? AND data <= ? ORDER BY data DESC');
    const sales = stmt.all(startDate, ultimoDia) as any[];
    console.log(`Buscando vendas de ${startDate} a ${ultimoDia}:`, sales.length, 'registros');
    return sales;
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    throw error;
  }
};

export const getDailySaleById = (id: number) => {
  try {
    const stmt = db.prepare('SELECT * FROM vendas_diarias WHERE id = ?');
    return stmt.get(id);
  } catch (error) {
    console.error('Erro ao buscar venda por id:', error);
    throw error;
  }
};

export const updateDailySale = (id: number, data: string, valor: number, observacoes?: string) => {
  try {
    const stmt = db.prepare('UPDATE vendas_diarias SET data = ?, valor = ?, observacoes = ? WHERE id = ?');
    const result = stmt.run(data, valor, observacoes || null, id);
    console.log('Venda atualizada:', { id, data, valor, observacoes, result });
    return result;
  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    throw error;
  }
};

export const deleteDailySale = (id: number) => {
  try {
    const stmt = db.prepare('DELETE FROM vendas_diarias WHERE id = ?');
    const result = stmt.run(id);
    console.log('Venda excluída:', { id, result });
    return result;
  } catch (error) {
    console.error('Erro ao excluir venda:', error);
    throw error;
  }
};

export const getMonthlyTotal = (mes: number, ano: number) => {
  try {
    const stmt = db.prepare('SELECT total FROM vendas_mensais WHERE mes = ? AND ano = ?');
    return stmt.get(mes, ano);
  } catch (error) {
    console.error('Erro ao buscar total mensal:', error);
    throw error;
  }
};

const getTickerMedio = (vendas: { valor: number }[]) => {
  try {
    const total = vendas.reduce((acc, v) => acc + v.valor, 0);
    return vendas.length > 0 ? total / vendas.length : 0;
  } catch (error) {
    console.error('Erro ao calcular ticket médio:', error);
    throw error;
  }
};

const getMediaClientes = (vendas: { data: string; valor: number }[]) => {
  try {
    if (vendas.length === 0) return 0;

    const diasComVendas = [...new Set(vendas.map((venda) => venda.data))];
    const quantidadeVendas = vendas.length;
    const media = quantidadeVendas > 0 && diasComVendas.length > 0 ? quantidadeVendas / diasComVendas.length : 0;

    return media;
  } catch (error) {
    console.error('Erro ao calcular média de clientes:', error);
    throw error;
  }
};

const getMelhorDia = (vendas: { data: string; valor: number }[]) => {
  try {
    const agrupado = vendas.reduce((acc: Record<string, number>, v) => {
      acc[v.data] = (acc[v.data] || 0) + v.valor; // retorna o dia com o maior valor acumulado
      return acc;
    }, {});

    const melhor = Object.entries(agrupado).sort((a, b) => b[1] - a[1])[0];
    return melhor ? melhor[0] : null;
  } catch (error) {
    console.error('Erro ao calcular melhor dia:', error);
    throw error;
  }
};

const getMaiorVenda = (vendas: { valor: number }[]) => {
  try {
    const maiorVenda = vendas.reduce((acc, v) => acc > v.valor ? acc : v.valor, 0);
    return maiorVenda || 0;
  } catch (error) {
    console.error('Erro ao calcular maior venda:', error);
    throw error;
  }
};

const getQtdVendas = (vendas: { valor: number }[]) => {
  try {
    return vendas.length;
  } catch (error) {
    console.error('Erro ao calcular quantidade de vendas:', error);
    throw error;
  }
};

export const consolidateMonthly = (mes: number, ano: number) => {
  try {
    const sales = getDailySales(mes, ano) as { valor: number }[];
    const total = sales.reduce((sum, sale) => sum + sale.valor, 0);
    const ticketMedio = getTickerMedio(sales);
    const mediaClientes = getMediaClientes(sales as any);
    const melhorDia = getMelhorDia(sales as any);
    const maiorVenda = getMaiorVenda(sales);
    const qtdVendas = getQtdVendas(sales);

    const stmt = db.prepare(
      'INSERT OR REPLACE INTO vendas_mensais (mes, ano, ticketMedio, mediaClientes, melhorDia, maiorVenda, qtdVendas, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    return stmt.run(mes, ano, ticketMedio, mediaClientes, melhorDia, maiorVenda, qtdVendas, total);
  } catch (error) {
    console.error('Erro ao consolidar mensal:', error);
    throw error;
  }
};

export const getAllMonthly = () => {
  try {
    const stmt = db.prepare('SELECT * FROM vendas_mensais ORDER BY ano DESC, mes DESC');
    return stmt.all();
  } catch (error) {
    console.error('Erro ao buscar todos os mensais:', error);
    throw error;
  }
};

export const backupDatabase = () => {
  const backupPath = path.join(process.cwd(), `backup-${new Date().toISOString().split('T')[0]}.db`);
  db.backup(backupPath);
  return backupPath;
};

export default db;