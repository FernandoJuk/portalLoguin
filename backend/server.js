const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();
app.use(cors());
app.use(express.json());
//app.use('/uploads', express.static('uploads')); // servir arquivos estáticos

// Middleware para autenticar token
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) return res.sendStatus(403);
    req.usuario = usuario;
    next();
  });
}

// === Cadastro ===
app.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  const senhaHash = await bcrypt.hash(senha, 10);

  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING *',
      [nome, email, senhaHash]
    );
    res.status(201).json({ message: 'Usuário registrado', usuario: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao registrar usuário');
  }
});

// === Login ===
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).send('Credenciais inválidas');

    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) return res.status(401).send('Credenciais inválidas');

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, admin: usuario.admin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      usuario: {
        nome: usuario.nome,
        admin: usuario.admin
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao fazer login');
  }
});

// === Upload de arquivo (Admin) ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const nomeFinal = `${Date.now()}-${file.originalname}`;
    cb(null, nomeFinal);
  }
});
const upload = multer({ storage });

app.post('/upload', upload.array('arquivos'), async (req, res) => {
  const { usuario_id, tipo } = req.body;

  if (!usuario_id || !tipo || !req.files || req.files.length === 0) {
    return res.status(400).send('Faltando dados');
  }

  try {
    const inserts = [];

    for (const file of req.files) {
      const result = await pool.query(
        'INSERT INTO arquivos (nome_arquivo, caminho, tipo, usuario_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [file.originalname, file.filename, tipo, usuario_id]
      );
      inserts.push(result.rows[0]);
    }

    res.status(201).json({ message: 'Arquivos enviados com sucesso', arquivos: inserts });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao salvar arquivos');
  }
});

// === Listagem dos arquivos do usuário logado ===
app.get('/meus-arquivos', autenticarToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome_arquivo, tipo, data_envio FROM arquivos WHERE usuario_id = $1',
      [req.usuario.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar arquivos');
  }
});

// === Download de arquivo (se for do usuário) ===
app.get('/download/:id', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).send('Token ausente');

  try {
    const usuario = jwt.verify(token, process.env.JWT_SECRET);
    const idArquivo = req.params.id;

    const result = await pool.query(
      'SELECT * FROM arquivos WHERE id = $1 AND usuario_id = $2',
      [idArquivo, usuario.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).send('Acesso negado ou arquivo não encontrado');
    }

    const arquivo = result.rows[0];
    const caminho = path.join(__dirname, 'uploads', arquivo.caminho);
    res.download(caminho, arquivo.nome_arquivo);
  } catch (err) {
    console.error(err);
    return res.status(401).send('Token inválido');
  }
});

app.get('/usuarios', autenticarToken, async (req, res) => {
  if (!req.usuario.admin) {
    return res.status(403).send('Acesso negado');
  }

  try {
    const result = await pool.query('SELECT id, nome, email FROM usuarios ORDER BY nome');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar usuários');
  }
});

//Rota para listar todos os arquivos (admin)
app.get('/admin/arquivos', autenticarToken, async (req, res) => {
  if (!req.usuario.admin) return res.status(403).send('Acesso negado');

  try {
    const result = await pool.query(`
      SELECT a.id, a.nome_arquivo, a.tipo, a.data_envio, u.nome AS nome_usuario, u.email
      FROM arquivos a
      JOIN usuarios u ON a.usuario_id = u.id
      ORDER BY a.data_envio DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar arquivos');
  }
});

//Rota para excluir arquivo (admin)

app.delete('/admin/arquivo/:id', autenticarToken, async (req, res) => {
  if (!req.usuario.admin) return res.status(403).send('Acesso negado');
  
  const id = req.params.id;

  try {
    const result = await pool.query('SELECT * FROM arquivos WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).send('Arquivo não encontrado');

    const arquivo = result.rows[0];
    const caminho = path.join(__dirname, 'uploads', arquivo.caminho);

    // Apagar arquivo do disco
    fs.unlink(caminho, (err) => {
      if (err) console.warn('Erro ao apagar arquivo físico:', err);
    });

    await pool.query('DELETE FROM arquivos WHERE id = $1', [id]);

    res.send('Arquivo excluído com sucesso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir arquivo');
  }
});

//Rota para editar tipo do arquivo (admin)

app.put('/admin/arquivo/:id', autenticarToken, async (req, res) => {
  if (!req.usuario.admin) return res.status(403).send('Acesso negado');

  const id = req.params.id;
  const { tipo } = req.body;

  if (!['nota', 'boleto'].includes(tipo)) {
    return res.status(400).send('Tipo inválido');
  }

  try {
    const result = await pool.query(
      'UPDATE arquivos SET tipo = $1 WHERE id = $2 RETURNING *',
      [tipo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Arquivo não encontrado');
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar arquivo');
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});