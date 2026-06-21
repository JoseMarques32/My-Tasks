const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./tarefas.db', (err) => {
    if (err) {
        console.error("Erro ao conectar ao SQLite:", err.message);
    } else {
        console.log("Conectado ao banco de dados SQLite nativo!");
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS tarefas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        concluida INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

app.get('/api/tarefas', (req, res) => {
    db.all("SELECT * FROM tarefas ORDER BY createdAt DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        // Converte o campo concluida de 0/1 para false/true (para o frontend funcionar igual)
        const tarefas = rows.map(row => ({
            ...row,
            concluida: row.concluida === 1
        }));
        res.json(tarefas);
    });

    app.post('/api/tarefas', (req, res) => {
    const { titulo } = req.body;
    if (!titulo || titulo.trim() === "") {
        return res.status(400).json({ erro: "O título é obrigatório." });
    }

    const stmt = db.prepare("INSERT INTO tarefas (titulo) VALUES (?)");
    stmt.run(titulo, function (err) {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.status(201).json({ id: this.lastID, titulo, concluida: false });
    });
    stmt.finalize();
});

app.put('/api/tarefas/:id', (req, res) => {
    const { id } = req.params;

    
    db.get("SELECT concluida FROM tarefas WHERE id = ?", [id], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ erro: "Tarefa não encontrada." });
        }

        const novoStatus = row.concluida === 1 ? 0 : 1;

        db.run("UPDATE tarefas SET concluida = ? WHERE id = ?", [novoStatus, id], (err) => {
            if (err) {
                return res.status(500).json({ erro: err.message });
            }
            res.json({ id: parseInt(id), concluida: novoStatus === 1 });
        });
    });
});

app.delete('/api/tarefas/:id', (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM tarefas WHERE id = ?", [id], (err) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.json({ mensagem: "Removida com sucesso!" });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

});







