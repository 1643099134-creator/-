import express from 'express';
import cors from 'cors';
import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, 'kaige.db');

const app = express();
const PORT = process.env.PORT || 3016;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

let db;

async function initDB() {
  const SQL = await initSqlJs();
  if (existsSync(DB_PATH)) {
    db = new SQL.Database(readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    时间 TEXT DEFAULT '', 行业 TEXT DEFAULT '', 客户名称 TEXT DEFAULT '',
    培训内容 TEXT DEFAULT '', 服务时间 TEXT DEFAULT '', 客户周期 TEXT DEFAULT '待跟进',
    后续跟进 TEXT DEFAULT '', 渠道 TEXT DEFAULT '', 企业对接人 TEXT DEFAULT '',
    负责人 TEXT DEFAULT '', 项目开展时间 TEXT DEFAULT '', 机构端备注 TEXT DEFAULT ''
  )`);
  saveDB();
}

function saveDB() { writeFileSync(DB_PATH, Buffer.from(db.export())); }

function queryToObjects(sql, params = []) {
  const results = db.exec(sql, params);
  if (results.length === 0) return [];
  return results[0].values.map(row => {
    const obj = {};
    results[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

// SSE
const sseClients = new Set();
function broadcastSSE(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) res.write(msg);
}

app.get('/api/events', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'Access-Control-Allow-Origin': '*' });
  res.write('event: connected\ndata: {"status":"ok"}\n\n');
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

app.get('/api/customers', (req, res) => {
  try {
    const data = queryToObjects('SELECT * FROM customers ORDER BY id ASC');
    res.json({ data, total: data.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/customers/sync', (req, res) => {
  try {
    const { customers } = req.body;
    if (!Array.isArray(customers)) return res.status(400).json({ error: 'must be array' });
    for (const c of customers) {
      db.run(`INSERT OR REPLACE INTO customers (id,时间,行业,客户名称,培训内容,服务时间,客户周期,后续跟进,渠道,企业对接人,负责人,项目开展时间,机构端备注) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [c.id||null, c.时间||'', c.行业||'', c.客户名称||'', c.培训内容||'', c.服务时间||'', c.客户周期||'待跟进', c.后续跟进||'', c.渠道||'', c.企业对接人||'', c.负责人||'', c.项目开展时间||'', c.机构端备注||'']
      );
    }
    saveDB();
    const total = queryToObjects('SELECT COUNT(*) as c FROM customers')[0].c;
    broadcastSSE('customers_updated', { total });
    res.json({ success: true, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/customers', (req, res) => {
  try {
    const c = req.body;
    db.run(`INSERT INTO customers (时间,行业,客户名称,培训内容,服务时间,客户周期,后续跟进,渠道,企业对接人,负责人,项目开展时间,机构端备注) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [c.时间||'', c.行业||'', c.客户名称||'', c.培训内容||'', c.服务时间||'', c.客户周期||'待跟进', c.后续跟进||'', c.渠道||'', c.企业对接人||'', c.负责人||'', c.项目开展时间||'', c.机构端备注||'']
    );
    saveDB();
    const lastId = queryToObjects('SELECT last_insert_rowid() as id')[0].id;
    const newC = queryToObjects(`SELECT * FROM customers WHERE id = ${lastId}`)[0];
    broadcastSSE('customers_updated', { action: 'add', customer: newC });
    res.json({ success: true, data: newC });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/customers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const c = req.body;
    db.run(`UPDATE customers SET 时间=?,行业=?,客户名称=?,培训内容=?,服务时间=?,客户周期=?,后续跟进=?,渠道=?,企业对接人=?,负责人=?,项目开展时间=?,机构端备注=? WHERE id=?`,
      [c.时间||'', c.行业||'', c.客户名称||'', c.培训内容||'', c.服务时间||'', c.客户周期||'待跟进', c.后续跟进||'', c.渠道||'', c.企业对接人||'', c.负责人||'', c.项目开展时间||'', c.机构端备注||'', id]
    );
    saveDB();
    const updated = queryToObjects(`SELECT * FROM customers WHERE id = ${id}`)[0];
    broadcastSSE('customers_updated', { action: 'update', customer: updated });
    res.json({ success: true, data: updated });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/customers/:id', (req, res) => {
  try {
    db.run(`DELETE FROM customers WHERE id = ${Number(req.params.id)}`);
    saveDB();
    broadcastSSE('customers_updated', { action: 'delete', id: Number(req.params.id) });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 凯格管理系统 API 服务已启动`);
    console.log(`   http://localhost:${PORT}/api/customers`);
    console.log(`   SSE: http://localhost:${PORT}/api/events\n`);
  });
}).catch(err => { console.error('初始化失败:', err); process.exit(1); });
