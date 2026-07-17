import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db/produtos.db');

let db: Database.Database;

try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = FULL');
  db.pragma('foreign_keys = ON');
} catch (error) {
  console.error('Erro ao conectar ao banco de produtos:', error);
  throw error;
}

try {
  // Criação das tabelas
  db.exec(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      descricao TEXT
    );

    CREATE TABLE IF NOT EXISTS marcas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS unidades_medida (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sigla TEXT NOT NULL UNIQUE,
      descricao TEXT
    );

    CREATE TABLE IF NOT EXISTS itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL CHECK(tipo IN ('PRODUTO', 'SERVICO')),
      nome TEXT NOT NULL,
      descricao TEXT,
      categoria_id INTEGER NOT NULL REFERENCES categorias(id),
      unidade_medida_id INTEGER NOT NULL REFERENCES unidades_medida(id),
      marca_id INTEGER NOT NULL REFERENCES marcas(id),
      codigo_interno TEXT UNIQUE,
      ativo INTEGER NOT NULL DEFAULT 1 CHECK(ativo IN (0, 1)),
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS item_codigos_barras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
      codigo_barras TEXT NOT NULL UNIQUE,
      principal INTEGER NOT NULL DEFAULT 0 CHECK(principal IN (0, 1))
    );
  `);

  // Seeding inicial para Unidades de Medida
  const countUom = db.prepare('SELECT count(*) as count FROM unidades_medida').get() as { count: number };
  if (countUom.count === 0) {
    const seedUoms = [
      { sigla: 'UN', descricao: 'Unidade' },
      { sigla: 'KG', descricao: 'Quilograma' },
      { sigla: 'G', descricao: 'Grama' },
      { sigla: 'CX', descricao: 'Caixa' },
      { sigla: 'L', descricao: 'Litro' },
      { sigla: 'ML', descricao: 'Mililitro' },
      { sigla: 'MT', descricao: 'Metro' },
    ];
    const insertUom = db.prepare('INSERT INTO unidades_medida (sigla, descricao) VALUES (?, ?)');
    for (const uom of seedUoms) {
      insertUom.run(uom.sigla, uom.descricao);
    }
  }

  // Seeding inicial para Categoria Geral
  const countCat = db.prepare('SELECT count(*) as count FROM categorias').get() as { count: number };
  if (countCat.count === 0) {
    db.prepare('INSERT INTO categorias (nome, descricao) VALUES (?, ?)').run('Geral', 'Categoria padrão');
  }

  // Seeding inicial para Marca Padrão
  const countBrand = db.prepare('SELECT count(*) as count FROM marcas').get() as { count: number };
  if (countBrand.count === 0) {
    db.prepare('INSERT INTO marcas (nome) VALUES (?)').run('Sem Marca');
  }

} catch (error) {
  console.error('Erro ao inicializar tabelas e seeds de produtos:', error);
}

// Helpers para Categorias
export const getCategorias = () => {
  return db.prepare('SELECT * FROM categorias ORDER BY nome ASC').all() as any[];
};

export const getCategoriaById = (id: number) => {
  return db.prepare('SELECT * FROM categorias WHERE id = ?').get(id) as any;
};

export const insertCategoria = (nome: string, descricao?: string) => {
  const stmt = db.prepare('INSERT INTO categorias (nome, descricao) VALUES (?, ?)');
  return stmt.run(nome, descricao || null);
};

// Apaga uma categoria, se houver itens associados, renomeia para a categoria "Geral" (id=1)
export const deleteCategoria = (id: number) => {
  if (id === 1) {
    throw new Error('Não é possível apagar a categoria Geral.');
  }
  const countItens = db.prepare('SELECT COUNT(*) as count FROM itens WHERE categoria_id = ?').get(id) as { count: number };
  if (countItens.count > 0) {
    // Atualiza os itens para a categoria Geral
    db.prepare('UPDATE itens SET categoria_id = 1 WHERE categoria_id = ?').run(id);
  }
  return db.prepare('DELETE FROM categorias WHERE id = ?').run(id);
};

// Renomeia uma categoria e atualiza em todos os itens associados
export const updateCategoria = (id: number, nome: string, descricao?: string) => {
  if (id === 1) {
    throw new Error('Não é possível atualizar a categoria Geral.');
  }

  return db.prepare('UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?').run(nome, descricao || null, id);
};

// Helpers para Marcas
export const getMarcas = () => {
  return db.prepare('SELECT * FROM marcas ORDER BY nome ASC').all() as any[];
};

export const getMarcaById = (id: number) => {
  return db.prepare('SELECT * FROM marcas WHERE id = ?').get(id) as any;
};

export const insertMarca = (nome: string) => {
  const stmt = db.prepare('INSERT INTO marcas (nome) VALUES (?)');
  return stmt.run(nome);
};

// Helpers para Unidades de Medida
export const getUnidadesMedida = () => {
  return db.prepare('SELECT * FROM unidades_medida ORDER BY sigla ASC').all() as any[];
};

export const getUnidadeMedidaById = (id: number) => {
  return db.prepare('SELECT * FROM unidades_medida WHERE id = ?').get(id) as any;
};

// Validações de Unicidade
export const checkDuplicateCodigoInterno = (codigoInterno: string, excludeId?: number) => {
  if (!codigoInterno || !codigoInterno.trim()) return false;
  let query = 'SELECT id FROM itens WHERE codigo_interno = ?';
  const params: any[] = [codigoInterno.trim()];
  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }
  const row = db.prepare(query).get(...params);
  return !!row;
};

export const checkDuplicateBarcode = (barcodes: string[], excludeItemId?: number) => {
  const cleaned = barcodes.map(b => b.trim()).filter(Boolean);
  if (cleaned.length === 0) return null;

  let query = 'SELECT codigo_barras FROM item_codigos_barras WHERE codigo_barras IN (';
  query += cleaned.map(() => '?').join(',');
  query += ')';

  const params: any[] = [...cleaned];
  if (excludeItemId) {
    query += ' AND item_id != ?';
    params.push(excludeItemId);
  }

  const row = db.prepare(query).get(...params) as { codigo_barras: string } | undefined;
  return row ? row.codigo_barras : null;
};

// CRUD de Itens (Produtos e Serviços)
export interface BarcodeData {
  codigo_barras: string;
  principal: number;
}

export interface ItemInput {
  tipo: 'PRODUTO' | 'SERVICO';
  nome: string;
  descricao?: string;
  categoria_id: number;
  unidade_medida_id: number;
  marca_id: number;
  codigo_interno?: string;
  ativo?: number;
  codigos_barras?: BarcodeData[];
}

export const getItens = (options: {
  search?: string;
  tipo?: 'PRODUTO' | 'SERVICO' | 'TODOS';
  categoria_id?: number;
  marca_id?: number;
  ativo?: number; // 0 para Inativo, 1 para Ativo, undefined para Todos
  page?: number;
  pageSize?: number;
}) => {
  const page = options.page || 1;
  const pageSize = options.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const queryConditions: string[] = [];
  const params: any[] = [];

  if (options.tipo && options.tipo !== 'TODOS') {
    queryConditions.push('i.tipo = ?');
    params.push(options.tipo);
  }

  if (options.categoria_id) {
    queryConditions.push('i.categoria_id = ?');
    params.push(options.categoria_id);
  }

  if (options.marca_id) {
    queryConditions.push('i.marca_id = ?');
    params.push(options.marca_id);
  }

  if (options.ativo !== undefined) {
    queryConditions.push('i.ativo = ?');
    params.push(options.ativo);
  }

  if (options.search && options.search.trim()) {
    const searchLike = `%${options.search.trim()}%`;
    queryConditions.push(
      '(i.nome LIKE ? OR i.codigo_interno LIKE ? OR i.id IN (SELECT item_id FROM item_codigos_barras WHERE codigo_barras LIKE ?))'
    );
    params.push(searchLike, searchLike, searchLike);
  }

  const whereClause = queryConditions.length > 0 ? `WHERE ${queryConditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `SELECT COUNT(*) as count FROM itens i ${whereClause}`;
  const totalCount = (db.prepare(countQuery).get(...params) as { count: number }).count;

  // Get items list with joins
  const itemsQuery = `
    SELECT 
      i.id,
      i.tipo,
      i.nome,
      i.descricao,
      i.categoria_id,
      i.unidade_medida_id,
      i.marca_id,
      i.codigo_interno,
      i.ativo,
      i.data_criacao,
      i.data_atualizacao,
      c.nome as categoria_nome,
      m.nome as marca_nome,
      u.sigla as unidade_medida_sigla,
      u.descricao as unidade_medida_descricao
    FROM itens i
    JOIN categorias c ON i.categoria_id = c.id
    JOIN marcas m ON i.marca_id = m.id
    JOIN unidades_medida u ON i.unidade_medida_id = u.id
    ${whereClause}
    ORDER BY i.nome ASC
    LIMIT ? OFFSET ?
  `;

  const items = db.prepare(itemsQuery).all(...params, pageSize, offset) as any[];

  // Fetch barcodes for each item
  const barcodesStmt = db.prepare('SELECT codigo_barras, principal FROM item_codigos_barras WHERE item_id = ? ORDER BY principal DESC');
  for (const item of items) {
    item.codigos_barras = barcodesStmt.all(item.id);
  }

  return {
    items,
    total: totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
};

export const getItemById = (id: number) => {
  const item = db.prepare(`
    SELECT 
      i.id,
      i.tipo,
      i.nome,
      i.descricao,
      i.categoria_id,
      i.unidade_medida_id,
      i.marca_id,
      i.codigo_interno,
      i.ativo,
      i.data_criacao,
      i.data_atualizacao,
      c.nome as categoria_nome,
      m.nome as marca_nome,
      u.sigla as unidade_medida_sigla,
      u.descricao as unidade_medida_descricao
    FROM itens i
    JOIN categorias c ON i.categoria_id = c.id
    JOIN marcas m ON i.marca_id = m.id
    JOIN unidades_medida u ON i.unidade_medida_id = u.id
    WHERE i.id = ?
  `).get(id) as any;

  if (item) {
    item.codigos_barras = db.prepare('SELECT codigo_barras, principal FROM item_codigos_barras WHERE item_id = ? ORDER BY principal DESC').all(id);
  }
  return item;
};

export const insertItem = db.transaction((itemData: ItemInput) => {
  const itemStmt = db.prepare(`
    INSERT INTO itens (tipo, nome, descricao, categoria_id, unidade_medida_id, marca_id, codigo_interno, ativo, data_criacao, data_atualizacao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
  `);

  const result = itemStmt.run(
    itemData.tipo,
    itemData.nome,
    itemData.descricao || null,
    itemData.categoria_id,
    itemData.unidade_medida_id,
    itemData.marca_id,
    itemData.codigo_interno ? itemData.codigo_interno.trim() : null,
    itemData.ativo !== undefined ? itemData.ativo : 1
  );

  const itemId = result.lastInsertRowid as number;

  if (itemData.codigos_barras && itemData.codigos_barras.length > 0) {
    const barcodeStmt = db.prepare(`
      INSERT INTO item_codigos_barras (item_id, codigo_barras, principal)
      VALUES (?, ?, ?)
    `);
    for (const cb of itemData.codigos_barras) {
      barcodeStmt.run(itemId, cb.codigo_barras.trim(), cb.principal ? 1 : 0);
    }
  }

  return itemId;
});

export const updateItem = db.transaction((id: number, itemData: ItemInput) => {
  const itemStmt = db.prepare(`
    UPDATE itens 
    SET tipo = ?, nome = ?, descricao = ?, categoria_id = ?, unidade_medida_id = ?, marca_id = ?, codigo_interno = ?, ativo = ?, data_atualizacao = datetime('now', 'localtime')
    WHERE id = ?
  `);

  itemStmt.run(
    itemData.tipo,
    itemData.nome,
    itemData.descricao || null,
    itemData.categoria_id,
    itemData.unidade_medida_id,
    itemData.marca_id,
    itemData.codigo_interno ? itemData.codigo_interno.trim() : null,
    itemData.ativo !== undefined ? itemData.ativo : 1,
    id
  );

  // Delete existing barcodes
  db.prepare('DELETE FROM item_codigos_barras WHERE item_id = ?').run(id);

  // Insert new barcodes
  if (itemData.codigos_barras && itemData.codigos_barras.length > 0) {
    const barcodeStmt = db.prepare(`
      INSERT INTO item_codigos_barras (item_id, codigo_barras, principal)
      VALUES (?, ?, ?)
    `);
    for (const cb of itemData.codigos_barras) {
      barcodeStmt.run(id, cb.codigo_barras.trim(), cb.principal ? 1 : 0);
    }
  }

  return true;
});

export const deleteItem = (id: number) => {
  const stmt = db.prepare('DELETE FROM itens WHERE id = ?');
  return stmt.run(id);
};

export const toggleItemStatus = (id: number, ativo: number) => {
  const stmt = db.prepare(`
    UPDATE itens 
    SET ativo = ?, data_atualizacao = datetime('now', 'localtime') 
    WHERE id = ?
  `);
  return stmt.run(ativo, id);
};

export default db;
