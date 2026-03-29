const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// --- CONFIGURATION SÉCURISÉE (SPRINT 5) ---
const SECRET_KEY = process.env.JWT_SECRET || "ooredoo_key";

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- MIDDLEWARE DE SÉCURITÉ (SÉCURISATION DES SESSIONS) ---
const verifierToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: "Accès refusé. Token manquant." });
  }

  try {
    const decodé = jwt.verify(token, SECRET_KEY);
    req.user = decodé;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expirée ou invalide." });
  }
};

app.get("/", (req, res) => {
  res.send("🚀 Serveur Ooredoo Backend opérationnel et sécurisé !");
});

// --- ROUTES AUTHENTIFICATION (AGENTS) ---

// Inscription Agent
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Champs manquants" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO agents (username, password) VALUES (?, ?)", [
      username,
      hashedPassword,
    ]);
    res.status(201).json({ message: "Agent créé avec succès !" });
  } catch (err) {
    console.error("Erreur Register:", err);
    res
      .status(500)
      .json({ error: "L'utilisateur existe déjà ou erreur serveur" });
  }
});

// Login Agent (Génère la session utilisateur)
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT id, username, password, role FROM agents WHERE username = ?",
      [username],
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ error: "Accès refusé : Identifiants Ooredoo invalides." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Accès refusé : Identifiants Ooredoo invalides." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" },
    );

    res.json({ token });
  } catch (err) {
    console.error("Erreur SQL:", err);
    res.status(500).json({ error: "Erreur serveur lors de la connexion." });
  }
});

// --- ROUTES AUTHENTIFICATION (CLIENTS - OTP) ---

app.post("/api/auth/client/request-otp", async (req, res) => {
  const { phone } = req.body;

  try {
    const [client] = await db.query(
      "SELECT * FROM clients WHERE num_telephone = ?",
      [phone],
    );

    if (client.length === 0) {
      return res
        .status(404)
        .json({ message: "Ce numéro n'est pas enregistré chez Ooredoo." });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000);

    await db.query(
      "INSERT INTO otp_codes (phone, code, expires_at) VALUES (?, ?, ?)",
      [phone, otpCode, expiresAt],
    );

    console.log(`------------------------------------------`);
    console.log(`[SMS OOREDOO] Code pour ${phone} : ${otpCode}`);
    console.log(`------------------------------------------`);

    res.status(200).json({ message: "Code envoyé par SMS." });
  } catch (err) {
    console.error("Erreur Request OTP:", err);
    res.status(500).json({ error: "Erreur serveur lors de l'envoi de l'OTP." });
  }
});

app.post("/api/auth/client/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM otp_codes WHERE phone = ? AND code = ? AND used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1",
      [phone, otp],
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Code invalide ou expiré." });
    }

    await db.query("UPDATE otp_codes SET used = 1 WHERE id = ?", [rows[0].id]);

    const [client] = await db.query(
      "SELECT id, nom_complet FROM clients WHERE num_telephone = ?",
      [phone],
    );

    const token = jwt.sign(
      { id: client[0].id, role: "Client", nom: client[0].nom_complet },
      SECRET_KEY,
      { expiresIn: "24h" },
    );

    res.json({ token });
  } catch (err) {
    console.error("Erreur Verify OTP:", err);
    res.status(500).json({ error: "Erreur lors de la vérification." });
  }
});

// --- ROUTES DASHBOARD & STATS (PROTÉGÉES) ---

app.get("/api/stats", verifierToken, async (req, res) => {
  try {
    const [totalRows] = await db.query("SELECT COUNT(*) as count FROM clients");
    const [actifsRows] = await db.query(
      "SELECT COUNT(*) as count FROM clients WHERE statut = 'Actif'",
    );
    const [resiliesRows] = await db.query(
      "SELECT COUNT(*) as count FROM clients WHERE statut = 'Resilier'",
    );

    const result = {
      total: totalRows[0].count || 0,
      actifs: actifsRows[0].count || 0,
      resiliations: resiliesRows[0].count || 0,
      nouveauxJour: 0,
      nouveauxMois: 0,
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GESTION DES CLIENTS (PROTÉGÉES) ---

app.get("/api/client/:numero", verifierToken, async (req, res) => {
  const { numero } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM clients WHERE num_telephone = ?",
      [numero],
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Client non trouvé" });
    }
  } catch (err) {
    res.status(500).json({ error: "Erreur recherche" });
  }
});

app.put("/api/client/resilier/:numero", verifierToken, async (req, res) => {
  if (req.user.role !== "Admin") {
    return res
      .status(403)
      .json({ error: "Accès refusé : Droits Administrateur requis." });
  }

  const { numero } = req.params;
  try {
    await db.query(
      "UPDATE clients SET statut = 'Resilier' WHERE num_telephone = ?",
      [numero],
    );
    res.json({ message: "Contrat résilié avec succès" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/api/client/ajouter", verifierToken, async (req, res) => {
  const { nom_complet, num_telephone, email, adresse, forfait_internet } =
    req.body;

  try {
    const [exist] = await db.query("SELECT * FROM clients WHERE ID = ?", [
      num_telephone,
    ]);
    if (exist.length > 0) {
      return res
        .status(400)
        .json({ error: "Ce numéro (ID) est déjà enregistré." });
    }

    const query = `
      INSERT INTO clients (ID, num_telephone, nom_complet, email, adresse, forfait_internet, statut, date_creation) 
      VALUES (?, ?, ?, ?, ?, ?, 'Actif', NOW())
    `;

    await db.query(query, [
      num_telephone,
      num_telephone,
      nom_complet,
      email || "",
      adresse || "",
      forfait_internet,
    ]);

    res.status(201).json({ message: "Dossier Ooredoo créé !" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur technique : " + (err.sqlMessage || err.message) });
  }
});

// --- SPRINT 4 : MODULE D'INTELLIGENCE ARTIFICIELLE (SIMULATION) ---

app.get("/api/client/prediction/:numero", verifierToken, async (req, res) => {
  const { numero } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM clients WHERE num_telephone = ?",
      [numero],
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Client non trouvé" });

    const client = rows[0];

    if (client.statut === "Resilier") {
      return res.json({
        score: 100,
        niveau: "Cessé",
        recommandation:
          "Dossier clôturé. Le client a déjà quitté nos services.",
        dejaResilie: true,
      });
    }

    let scoreRisque = 10;
    if (client.forfait_internet === "Fixe Jdid") scoreRisque += 30;

    const ancienneteJours =
      (new Date() - new Date(client.date_creation)) / (1000 * 60 * 60 * 24);
    if (ancienneteJours < 30) scoreRisque += 25;

    if (!client.email) scoreRisque += 15;

    let niveau = "Faible";
    if (scoreRisque > 50) niveau = "Élevé";
    else if (scoreRisque > 30) niveau = "Modéré";

    res.json({
      score: scoreRisque,
      niveau: niveau,
      recommandation:
        niveau === "Élevé"
          ? "Appeler le client pour une offre de fidélisation"
          : "RAS",
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'analyse IA" });
  }
});

app.get("/api/clients/liste", verifierToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM clients ORDER BY date_creation DESC",
    );
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de la liste" });
  }
});

// --- ROUTE FACTURES ---
app.get("/api/client/factures/:phone", verifierToken, async (req, res) => {
  const { phone } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM factures WHERE client_phone = ? ORDER BY id DESC",
      [phone],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.put("/api/client/facture/payer/:id", verifierToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      "UPDATE factures SET statut = 'Payée' WHERE id = ?",
      [id],
    );

    if (result.affectedRows > 0) {
      res.json({ message: "Paiement validé avec succès !" });
    } else {
      res.status(404).json({ error: "Facture non trouvée" });
    }
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du paiement" });
  }
});

// --- MODULE RÉCLAMATIONS (NOUVEAU) ---

app.post("/api/client/reclamation", verifierToken, async (req, res) => {
  const { phone, objet, message } = req.body;

  try {
    const query = `
      INSERT INTO reclamations (client_phone, objet, message, statut, date_envoi) 
      VALUES (?, ?, ?, 'En attente', NOW())
    `;

    await db.query(query, [phone, objet, message]);

    res.status(201).json({ message: "Réclamation enregistrée avec succès !" });
  } catch (err) {
    console.error("Erreur SQL réclamation:", err);
    res
      .status(500)
      .json({ error: "Erreur lors de l'insertion en base de données." });
  }
});

// Compter les réclamations non traitées (Portail Agent)
app.get("/api/agent/reclamations/count", verifierToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT COUNT(*) as count FROM reclamations WHERE statut = 'En attente'",
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: "Erreur compteur" });
  }
});

// Récupérer toutes les réclamations avec le nom du client (Espace Agent)
app.get("/api/agent/reclamations", verifierToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, c.nom_complet 
      FROM reclamations r 
      LEFT JOIN clients c ON r.client_phone = c.num_telephone 
      ORDER BY r.date_envoi DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erreur SQL lors de la récupération des réclamations:", err);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des données." });
  }
});

// Marquer une réclamation comme traitée
app.put(
  "/api/agent/reclamation/traiter/:id",
  verifierToken,
  async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await db.query(
        "UPDATE reclamations SET statut = 'Traité' WHERE id = ?",
        [id],
      );

      if (result.affectedRows > 0) {
        res.json({ message: "Réclamation marquée comme traitée !" });
      } else {
        res.status(404).json({ error: "Réclamation non trouvée" });
      }
    } catch (err) {
      console.error("Erreur mise à jour réclamation:", err);
      res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
  },
);

// --- LANCEMENT ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("------------------------------------------");
  console.log(`🚀 Serveur Ooredoo lancé : http://localhost:${PORT}`);
  console.log(`🔒 Sécurité : Sessions JWT & IA Filtrée`);
  console.log("------------------------------------------");
});
