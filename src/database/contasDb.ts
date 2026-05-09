import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'contas.db');

let db: Database.Database;

try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
} catch (error) {
  console.error('Erro ao conectar ao banco de contas:', error);
  throw error;
}

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS contas_detalhes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      distribuidora TEXT NOT NULL,
      valor REAL NOT NULL,
      vencimento TEXT NOT NULL,
      documento TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pendente',
      banco_observacoes TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (error) {
  console.error('Erro ao criar tabela de contas:', error);
}

export const insertConta = (
  distribuidora: string,
  valor: number,
  vencimento: string,
  documento: string,
  bancoObservacoes?: string,
) => {
  const stmt = db.prepare(
    'INSERT INTO contas_detalhes (distribuidora, valor, vencimento, documento, status, banco_observacoes) VALUES (?, ?, ?, ?, ?, ?)',
  );
  return stmt.run(distribuidora, valor, vencimento, documento, 'Pendente', bancoObservacoes || null);
};

export const getContasByPeriod = (ano: number, mes?: number) => {
  const startDate = `${ano}-${String(mes ?? 1).padStart(2, '0')}-01`;
  const endDate = mes
    ? new Date(ano, mes, 0).toISOString().split('T')[0]
    : `${ano}-12-31`;

  const stmt = mes
    ? db.prepare('SELECT * FROM contas_detalhes WHERE vencimento >= ? AND vencimento <= ? ORDER BY vencimento DESC, id DESC')
    : db.prepare('SELECT * FROM contas_detalhes WHERE vencimento >= ? AND vencimento <= ? ORDER BY vencimento DESC, id DESC');

  return stmt.all(startDate, endDate) as any[];
};

export const getContaById = (id: number) => {
  const stmt = db.prepare('SELECT * FROM contas_detalhes WHERE id = ?');
  return stmt.get(id);
};

export const updateConta = (
  id: number,
  distribuidora: string,
  valor: number,
  vencimento: string,
  documento: string,
  bancoObservacoes?: string,
) => {
  const stmt = db.prepare(
    'UPDATE contas_detalhes SET distribuidora = ?, valor = ?, vencimento = ?, documento = ?, banco_observacoes = ? WHERE id = ?',
  );
  return stmt.run(distribuidora, valor, vencimento, documento, bancoObservacoes || null, id);
};

export const deleteConta = (id: number) => {
  const stmt = db.prepare('DELETE FROM contas_detalhes WHERE id = ?');
  return stmt.run(id);
};

export const payConta = (id: number) => {
  const stmt = db.prepare('UPDATE contas_detalhes SET status = ? WHERE id = ?');
  return stmt.run('Pago', id);
};

export const cancelPaymentConta = (id: number) => {
  const stmt = db.prepare('UPDATE contas_detalhes SET status = ? WHERE id = ?');
  return stmt.run('Pendente', id);
};

export const backupContasDatabase = () => {
  const backupPath = path.join(process.cwd(), `contas-backup-${new Date().toISOString().split('T')[0]}.db`);
  db.backup(backupPath);
  return backupPath;
};

export default db;
