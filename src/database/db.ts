import Database from 'better-sqlite3';
import path from 'path';
import { now, getLastDayOfMonth } from '../utils/date';

// Conexão local com o banco de dados SQLite usado pelo aplicativo.
const dbPath = path.join(process.cwd(), 'db/vendas.db'); // caminho para o arquivo de banco de dados

let db: Database.Database;

try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = FULL');
  db.pragma('foreign_keys = ON');
} catch (error) {
  console.error('Erro ao conectar ao banco:', error);
  throw error;
}

// Cria as tabelas necessárias para o histórico de vendas, itens de venda e o resumo mensal caso ainda não existam.
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS vendas_diarias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      valor REAL NOT NULL,
      observacoes TEXT,
      carrinho_id INTEGER DEFAULT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS venda_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venda_id INTEGER NOT NULL,
      item_id INTEGER,
      tipo TEXT NOT NULL,
      nome TEXT NOT NULL,
      quantidade REAL NOT NULL DEFAULT 1,
      preco_unitario REAL NOT NULL DEFAULT 0,
      subtotal REAL NOT NULL DEFAULT 0,
      codigo_interno TEXT,
      referencia TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (venda_id) REFERENCES vendas_diarias(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vendas_mensais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mes INTEGER NOT NULL,
      ano INTEGER NOT NULL,
      ticketMedio REAL NOT NULL DEFAULT 0,
      mediaClientes INTEGER NOT NULL DEFAULT 0,
      mediaClientesEsp INTEGER NOT NULL DEFAULT 0,
      melhorDia TEXT NOT NULL DEFAULT 'N/A',
      melhorDiaValor REAL NOT NULL DEFAULT 0,
      maiorVenda REAL NOT NULL DEFAULT 0,
      qtdVendas INTEGER NOT NULL DEFAULT 0,
      qtdVendasEsp INTEGER NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      totalEsp REAL NOT NULL,
      UNIQUE(mes, ano)
    );
  `);

  // Migração segura para adicionar coluna carrinho_id caso vendas_diarias já exista
  const columns = db.pragma('table_info(vendas_diarias)') as { name: string }[];
  const hasCarrinhoId = columns.some((col) => col.name === 'carrinho_id');
  if (!hasCarrinhoId) {
    db.exec(`ALTER TABLE vendas_diarias ADD COLUMN carrinho_id INTEGER DEFAULT NULL;`);
  }
} catch (error) {
  console.error('Erro ao criar tabelas:', error);
}

// Interfaces para itens da venda
export interface VendaItemInput {
  item_id?: number;
  tipo: 'PRODUTO' | 'SERVICO';
  nome: string;
  quantidade: number;
  preco_unitario: number;
  subtotal?: number;
  codigo_interno?: string;
  referencia?: string;
}

export interface VendaItemData extends VendaItemInput {
  id: number;
  venda_id: number;
  subtotal: number;
  criado_em: string;
}

export interface DailySaleRow {
  id: number;
  data: string;
  valor: number;
  observacoes: string | null;
  carrinho_id: number | null;
  criado_em: string;
}

// Função local ou componente.
const getLocalTimestamp = () => {
  return now().format('YYYY-MM-DD HH:mm:ss');
};

// Funções de acesso ao banco de dados e operações de persistência.
export const insertDailySale = (
  data: string,
  amount: number,
  notes?: string,
  createdAt?: string,
  cartId?: number | null
) => {
  try {
    const criadoEm = createdAt || getLocalTimestamp();
    const stmt = db.prepare(
      'INSERT INTO vendas_diarias (data, valor, observacoes, carrinho_id, criado_em) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(data, amount, notes || null, cartId ?? null, criadoEm);
    return result;
  } catch (error) {
    console.error('Erro ao inserir venda:', error);
    throw error;
  }
};

// Inserção em lote dos itens associados a uma venda
export const insertSaleItems = (saleId: number, items: VendaItemInput[]) => {
  try {
    if (!items || items.length === 0) return;

    const stmt = db.prepare(`
      INSERT INTO venda_itens (
        venda_id,
        item_id,
        tipo,
        nome,
        quantidade,
        preco_unitario,
        subtotal,
        codigo_interno,
        referencia,
        criado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const createdAt = getLocalTimestamp();
    const insertMany = db.transaction((saleItems: VendaItemInput[]) => {
      for (const item of saleItems) {
        const subtotal = item.subtotal ?? Number((item.preco_unitario * item.quantidade).toFixed(2));
        stmt.run(
          saleId,
          item.item_id ?? null,
          item.tipo,
          item.nome,
          item.quantidade,
          item.preco_unitario,
          subtotal,
          item.codigo_interno ?? null,
          item.referencia ?? null,
          createdAt
        );
      }
    });

    insertMany(items);
  } catch (error) {
    console.error('Erro ao inserir itens da venda:', error);
    throw error;
  }
};

// Busca todos os itens associados a uma venda específica
export const getSaleItems = (saleId: number): VendaItemData[] => {
  try {
    const stmt = db.prepare('SELECT * FROM venda_itens WHERE venda_id = ? ORDER BY id ASC');
    return stmt.all(saleId) as VendaItemData[];
  } catch (error) {
    console.error('Erro ao buscar itens da venda:', error);
    throw error;
  }
};

// Exclui os itens associados a uma venda
export const deleteSaleItems = (saleId: number) => {
  try {
    const stmt = db.prepare('DELETE FROM venda_itens WHERE venda_id = ?');
    return stmt.run(saleId);
  } catch (error) {
    console.error('Erro ao excluir itens da venda:', error);
    throw error;
  }
};

// Constante exportada com função.
export const getDailySales = (month: number, year: number, filter?: 'positivas' | 'negativas' | 'todas') => {
  try {
    const mesAno = `${year}-${String(month).padStart(2, '0')}`;
    const startDate = `${mesAno}-01`;
    const ultimoDia = `${mesAno}-${String(getLastDayOfMonth(year, month)).padStart(2, '0')}`;

    let query = 'SELECT * FROM vendas_diarias WHERE data >= ? AND data <= ?';
    if (filter === 'positivas') {
      query += ' AND valor > 0';
    } else if (filter === 'negativas') {
      query += ' AND valor <= 0';
    }
    query += ' ORDER BY data DESC';

    const stmt = db.prepare(query);
    const sales = stmt.all(startDate, ultimoDia) as unknown as DailySaleRow[];
    console.log(`Buscando vendas de ${startDate} a ${ultimoDia} (${filter || 'todas'}):`, sales.length, 'registros');
    return sales;
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    throw error;
  }
};

// Constante exportada com função.
export const getDailySaleById = (id: number) => {
  try {
    const stmt = db.prepare('SELECT * FROM vendas_diarias WHERE id = ?');
    return stmt.get(id);
  } catch (error) {
    console.error('Erro ao buscar venda por id:', error);
    throw error;
  }
};

// Constante exportada com função.
export const updateDailySale = (id: number, data: string, amount: number, notes?: string) => {
  try {
    const stmt = db.prepare('UPDATE vendas_diarias SET data = ?, valor = ?, observacoes = ? WHERE id = ?');
    const result = stmt.run(data, amount, notes || null, id);
    console.log('Venda atualizada:', { id, data, valor: amount, observacoes: notes, result });
    return result;
  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    throw error;
  }
};

// Constante exportada com função.
export const deleteDailySale = (id: number) => {
  try {
    db.prepare('DELETE FROM venda_itens WHERE venda_id = ?').run(id);
    const stmt = db.prepare('DELETE FROM vendas_diarias WHERE id = ?');
    const result = stmt.run(id);
    console.log('Venda excluída:', { id, result });
    return result;
  } catch (error) {
    console.error('Erro ao excluir venda:', error);
    throw error;
  }
};

// Constante exportada com função.
export const getMonthlyTotal = (month: number, year: number) => {
  try {
    const stmt = db.prepare('SELECT total FROM vendas_mensais WHERE mes = ? AND ano = ?');
    return stmt.get(month, year);
  } catch (error) {
    console.error('Erro ao buscar total mensal:', error);
    throw error;
  }
};

// Função local ou componente.
const getAverageTicket = (sales: { valor: number }[]) => {
  try {
    const total = sales.reduce((acc, v) => acc + v.valor, 0);
    return sales.length > 0 ? total / sales.length : 0;
  } catch (error) {
    console.error('Erro ao calcular ticket médio:', error);
    throw error;
  }
};

// Função local ou componente.
const getAverageCustomers = (sales: { data: string; valor: number }[]) => {
  try {
    if (sales.length === 0) {
      return { media: 0, mediaNegativa: 0 };
    }

    const vendasPositivas = sales.filter((v) => v.valor > 0);
    const vendasNegativas = sales.filter((v) => v.valor <= 0);

    // Média para dias negativos
    const diasComVendasNegativos = [...new Set(vendasNegativas.map((sale) => sale.data))];
    const quantidadeVendasNegativas = vendasNegativas.length;
    const mediaNegativa =
      quantidadeVendasNegativas > 0 && diasComVendasNegativos.length > 0 ? quantidadeVendasNegativas / diasComVendasNegativos.length : 0;

    const diasComVendas = [...new Set(vendasPositivas.map((sale) => sale.data))];
    const quantidadeVendas = vendasPositivas.length;
    const media = quantidadeVendas > 0 && diasComVendas.length > 0 ? quantidadeVendas / diasComVendas.length : 0;

    return { media, mediaNegativa };
  } catch (error) {
    console.error('Erro ao calcular média de clientes:', error);
    throw error;
  }
};

// Função local ou componente.
const getBestDay = (sales: { data: string; valor: number }[], month: number, year: number) => {
  try {
    const agrupado = sales.reduce((acc: Record<string, number>, v) => {
      acc[v.data] = (acc[v.data] || 0) + v.valor; // retorna o dia com o maior valor acumulado
      return acc;
    }, {});

    let melhor = Object.entries(agrupado).sort((a, b) => b[1] - a[1])[0];
    // se melhor for vazio, retorna o primeiro dia do mês
    if (!melhor) {
      melhor = [`${year}-${month}-01`, 0];
    }
    return { dia: melhor[0], valor: melhor[1] }
  } catch (error) {
    console.error('Erro ao calcular melhor dia:', error);
    throw error;
  }
};

// Função local ou componente.
const getLargestSale = (sales: { valor: number }[]) => {
  try {
    const maiorVenda = sales.reduce((acc, v) => acc > v.valor ? acc : v.valor, 0);
    return maiorVenda || 0;
  } catch (error) {
    console.error('Erro ao calcular maior venda:', error);
    throw error;
  }
};

// Função local ou componente.
const getSalesCount = (sales: { valor: number }[]) => {
  try {
    return sales.length;
  } catch (error) {
    console.error('Erro ao calcular quantidade de vendas:', error);
    throw error;
  }
};

const getSpecialSales = (month: number, year: number) => {
  try {
    // Retorna a quantidade e total de vendas negativas no mês
    const vendasEspeciais = getDailySales(month, year, 'negativas') as { valor: number }[];
    const totalEspeciais = vendasEspeciais.reduce((sum, sale) => sum + sale.valor, 0);

    return [vendasEspeciais.length, totalEspeciais];
  } catch (error) {
    console.error('Erro ao calcular quantidade de vendas espéciais:', error);
    throw error;
  }
};

// Constante exportada com função.
export const consolidateMonthly = (month: number, year: number) => {
  try {
    // Vendas Especiais
    const vendasEspeciais = getSpecialSales(month, year);
    const qtdVendasEspeciais = vendasEspeciais[0];

    // Vendas Diárias
    const sales = getDailySales(month, year);
    const total = sales.reduce((sum, sale) => sum + sale.valor, 0);
    const ticketMedio = getAverageTicket(sales);
    const { media, mediaNegativa } = getAverageCustomers(sales);
    const mediaClientes = media;
    const melhorDia = getBestDay(sales, month, year);
    const maiorVenda = getLargestSale(sales);
    const qtdVendas = getSalesCount(sales) - qtdVendasEspeciais;

    const mediaClientesEsp = mediaNegativa;
    const qtdVendasEsp = qtdVendasEspeciais;
    const totalEsp = vendasEspeciais[1];

    const stmt = db.prepare(
      'INSERT OR REPLACE INTO vendas_mensais (mes, ano, ticketMedio, mediaClientes, mediaClientesEsp, melhorDia, melhorDiaValor, maiorVenda, qtdVendas, qtdVendasEsp, total, totalEsp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    return stmt.run(month, year, ticketMedio, mediaClientes, mediaClientesEsp, melhorDia.dia, melhorDia.valor, maiorVenda, qtdVendas, qtdVendasEsp, total, totalEsp);
  } catch (error) {
    console.error('Erro ao consolidar mensal:', error);
    throw error;
  }
};

// Constante exportada com função.
export const deleteMonthly = (id: number) => {
  try {
    const stmt = db.prepare('DELETE FROM vendas_mensais WHERE id = ?');
    return stmt.run(id);
  } catch (error) {
    console.error('Erro ao excluir mensal:', error);
    throw error;
  }
};

// Constante exportada com função.
export const getAllMonthly = () => {
  try {
    const stmt = db.prepare('SELECT * FROM vendas_mensais ORDER BY ano DESC, mes DESC');
    return stmt.all();
  } catch (error) {
    console.error('Erro ao buscar todos os mensais:', error);
    throw error;
  }
};

// Constante exportada com função.
export const backupDatabase = () => {
  const backupPath = path.join(process.cwd(), `backup-${now().format('YYYY-MM-DD')}.db`);
  db.backup(backupPath);
  return backupPath;
};

export default db;
