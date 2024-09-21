const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion à la base de données MySQL
const db = mysql.createConnection({
  host: 'localhost', 
  user: 'root',      
  password: '',      
  database: 'usersdb'
});

// Vérifier la connexion
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à MySQL:', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

// Configuration de Multer pour stocker les images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.post('/api/user', upload.single('image'), (req, res) => {
    const { nom, prenom, email, phone, password } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  
    const query = `
      INSERT INTO users (nom, prenom, email, phone, password, imagePath)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
  
    db.query(query, [nom, prenom, email, phone, password, imagePath], (err, result) => {
      if (err) {
        console.error('Erreur lors de la création de l\'utilisateur:', err);
        res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
      } else {
        console.log('User saved:', { nom, prenom, email, phone, password, imagePath });
        res.status(201).json({ message: 'Utilisateur créé avec succès', userId: result.insertId });
      }
    });
  });

// Route GET pour récupérer les utilisateurs
app.get('/api/user', (req, res) => {
  const query = 'SELECT * FROM users';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
      return;
    }
    res.json(results);
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
