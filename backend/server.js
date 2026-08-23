const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'sua_chave_secreta_aqui';

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./tarefas.db', (err) => {
    if (!err) console.log("Conectado ao banco de dados SQLite!");
});

// Inicialização da estrutura das tabelas
db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS tarefas`);
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL
        )
    `);

    db.run(`
    CREATE TABLE IF NOT EXISTS tarefas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'média',
      status TEXT DEFAULT 'pendente',
      dueDate TEXT,
      project TEXT,
      usuario_id INTEGER,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    )
  `);
});

// Middleware de autenticação por JWT
const autenticarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ erro: "Acesso negado." });

    jwt.verify(token, SECRET_KEY, (err, usuario) => {
        if (err) return res.status(403).json({ erro: "Token inválido." });
        req.usuarioId = usuario.id;
        next();
    });
};

// Rotas de Autenticação
app.post('/api/auth/register', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: "Preencha todos os campos." });

    const senhaHash = await bcrypt.hash(senha, 10);
    db.run("INSERT INTO usuarios (email, senha) VALUES (?, ?)", [email, senhaHash], function (err) {
        if (err) return res.status(400).json({ erro: "E-mail já cadastrado." });
        res.status(201).json({ mensagem: "Usuário criado com sucesso!" });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, senha } = req.body;
    db.get("SELECT * FROM usuarios WHERE email = ?", [email], async (err, usuario) => {
        if (err || !usuario || !(await bcrypt.compare(senha, usuario.senha))) {
            return res.status(400).json({ erro: "Credenciais inválidas." });
        }
        const token = jwt.sign({ id: usuario.id, email: usuario.email }, SECRET_KEY, { expiresIn: '8h' });
        res.json({ token, email: usuario.email });
    });
});

// Rotas de Tarefas
app.get('/api/tarefas', autenticarToken, (req, res) => {
    const query = `
        SELECT 
            id, 
            title, 
            description, 
            priority, 
            status, 
            dueDate, 
            project 
        FROM tarefas 
        WHERE usuario_id = ? 
        ORDER BY id DESC
    `;
    db.all(query, [req.usuarioId], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

app.post('/api/tarefas', autenticarToken, (req, res) => {
    const { title, description, priority, dueDate, project } = req.body;
    
    if (!title || !title.trim()) {
        return res.status(400).json({ erro: "O título da tarefa é obrigatório." });
    }

    const dataVencimento = dueDate || new Date().toISOString().split('T')[0];
    const nomeProjeto = project || 'Plataforma';
    const prioridadeTarefa = priority || 'média';

    const sql = `
        INSERT INTO tarefas (title, description, priority, status, dueDate, project, usuario_id) 
        VALUES (?, ?, ?, 'pendente', ?, ?, ?)
    `;

    db.run(
        sql,
        [title.trim(), description || '', prioridadeTarefa, dataVencimento, nomeProjeto, req.usuarioId],
        function (err) {
            if (err) {
                console.error("Erro ao inserir tarefa:", err.message);
                return res.status(500).json({ erro: err.message });
            }

            res.status(201).json({
                id: this.lastID,
                title: title.trim(),
                description: description || '',
                priority: prioridadeTarefa,
                status: 'pendente',
                dueDate: dataVencimento,
                project: nomeProjeto
            });
        }
    );
});

app.put('/api/tarefas/:id', autenticarToken, (req, res) => {
    const { id } = req.params;
    db.get("SELECT status FROM tarefas WHERE id = ? AND usuario_id = ?", [id, req.usuarioId], (err, row) => {
        if (err || !row) return res.status(404).json({ erro: "Tarefa não encontrada." });

        const novoStatus = row.status === 'concluída' ? 'pendente' : 'concluída';
        db.run("UPDATE tarefas SET status = ? WHERE id = ? AND usuario_id = ?", [novoStatus, id, req.usuarioId], (err) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ id: Number(id), status: novoStatus });
        });
    });
});

app.delete('/api/tarefas/:id', autenticarToken, (req, res) => {
    db.run("DELETE FROM tarefas WHERE id = ? AND usuario_id = ?", [req.params.id, req.usuarioId], function (err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Tarefa removida com sucesso!" });
    });
});

app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));