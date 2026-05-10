import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'notas.db');

let db: Database.Database;

try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = FULL');
} catch (error) {
  console.error('Erro ao conectar ao banco de notas:', error);
  throw error;
}

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS notas_detalhes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_emissao TEXT NOT NULL,
      valor_nota REAL NOT NULL
    );
  `);
} catch (error) {
  console.error('Erro ao criar tabela de notas:', error);
}

export const insertNota = (
  dataEmissao: string,
  valorNota: number,
) => {
  const stmt = db.prepare(
    'INSERT INTO notas_detalhes (data_emissao, valor_nota) VALUES (?, ?)',
  );
  return stmt.run(dataEmissao, valorNota);
};

export const getNotasById = (id: number) => {
  const stmt = db.prepare('SELECT * FROM notas_detalhes WHERE id = ?');
  return stmt.get(id);
};

// soma notas de um determinado ano
export const getSumNotasByYear = (ano: number) => {
  const stmt = db.prepare(`
    SELECT SUM(valor_nota) AS total
    FROM notas_detalhes
    WHERE date(data_emissao) >= ? AND date(data_emissao) <= ?
  `);
  const row = stmt.get(`${ano}-01-01`, `${ano}-12-31`) as { total: number | null };
  return row?.total ?? 0;
};

export const getNotasByValor = (valor: number) => {
  if (valor < 0) {
    return null;
  }

  const stmt = db.prepare('SELECT * FROM notas_detalhes WHERE valor_nota = ?');
  return stmt.get(valor);
};

export const getNotasByPeriod = (ano: number, mes?: number) => {
  const startDate = `${ano}-${String(mes ?? 1).padStart(2, '0')}-01`;
  const endDate = mes
    ? `${ano}-${String(mes).padStart(2, '0')}-${new Date(ano, mes, 0).getDate()}`
    : `${ano}-12-31`;

  const stmt = db.prepare(
    'SELECT * FROM notas_detalhes WHERE date(data_emissao) >= ? AND date(data_emissao) <= ? ORDER BY data_emissao DESC, id DESC'
  );

  return stmt.all(startDate, endDate) as any[];
};

export const deleteNota = (id: number) => {
  const stmt = db.prepare('DELETE FROM notas_detalhes WHERE id = ?');
  return stmt.run(id);
};

export const backupNotasDatabase = () => {
  const backupPath = path.join(process.cwd(), `notas-backup-${new Date().toISOString().split('T')[0]}.db`);
  db.backup(backupPath);
  return backupPath;
};

export default db;
