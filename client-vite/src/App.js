import axios from "axios";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import Login from "./Login";
import Register from "./Register";

// --- RÉCUPÉRATION DE L'URL API ---
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [token, setToken] = useState(null);
  const [numero, setNumero] = useState("");
  const [client, setClient] = useState(null);
  const [message, setMessage] = useState("");
  const [prediction, setPrediction] = useState(null);

  // États pour la gestion de la liste
  const [vueListe, setVueListe] = useState(false);
  const [tousLesClients, setTousLesClients] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState("Tous");

  const [stats, setStats] = useState({
    total: 0,
    actifs: 0,
    resiliations: 0,
    nouveauxJour: 0,
  });

  // --- CALCUL DU RÔLE (Via useMemo pour éviter les rendus inutiles) ---
  const userRole = useMemo(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.role;
    } catch {
      return null;
    }
  }, [token]);

  // --- CONFIGURATION AXIOS ---
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // 1. Statistiques (Mémorisées)
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Erreur Stats:", err);
    }
  }, [token]);

  // --- EFFET POUR LES STATS (Correction de l'erreur cascading renders) ---
  useEffect(() => {
    let active = true;

    const loadInitialStats = async () => {
      if (token && active) {
        await fetchStats();
      }
    };

    loadInitialStats();

    const interval = setInterval(() => {
      if (token) fetchStats();
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [token, fetchStats]);

  // --- GÉNÉRATION DU RAPPORT PDF ---
  const genererPDF = () => {
    if (!client) return;
    const doc = new jsPDF();

    // --- DESIGN DU HEADER OOREDOO ---
    doc.setFillColor(237, 28, 36); // Rouge Ooredoo
    doc.rect(0, 0, 210, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("RAPPORT AGENT - OOREDOO PORTAIL", 15, 13);

    // --- INFOS DU DOSSIER ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Date du rapport : ${new Date().toLocaleDateString()}`, 15, 30);
    doc.text(`Identifiant Client : ${client.ID}`, 15, 40);

    // --- TABLEAU DES DONNÉES ---
    doc.autoTable({
      startY: 50,
      head: [["Champ", "Valeur"]],
      body: [
        ["Nom Complet", client.nom_complet],
        ["Numéro de Téléphone", client.num_telephone],
        ["Forfait Internet", client.forfait_internet],
        ["Statut du Contrat", client.statut],
        [
          "Risque Churn (IA)",
          prediction ? `${prediction.score}% (${prediction.niveau})` : "N/A",
        ],
      ],
      headStyles: { fillColor: [237, 28, 36] }, // En-tête rouge
    });

    // --- RECOMMANDATION IA ---
    if (prediction) {
      const finalY = doc.lastAutoTable.finalY;
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text("Recommandation Stratégique :", 15, finalY + 15);
      doc.setTextColor(0, 0, 0);
      doc.text(prediction.recommandation, 15, finalY + 22, { maxWidth: 180 });
    }

    // Téléchargement
    doc.save(`Rapport_Ooredoo_${client.num_telephone}.pdf`);
  };

  // 2. Récupérer la liste complète
  const afficherTousLesClients = async (statut = "Tous") => {
    try {
      const res = await axios.get(`${API_URL}/api/clients/liste`);
      setTousLesClients(res.data);
      setFiltreStatut(statut);
      setVueListe(true);
      setClient(null);
    } catch {
      alert("Erreur lors de la récupération de la liste.");
    }
  };

  // 3. Recherche Individuelle + IA
  const chercherClient = async () => {
    if (!numero) return setMessage("⚠️ Saisissez un numéro.");
    try {
      setMessage("");
      setPrediction(null);
      const res = await axios.get(`${API_URL}/api/client/${numero}`);
      setClient(res.data);

      try {
        const resIA = await axios.get(
          `${API_URL}/api/client/prediction/${numero}`,
        );
        setPrediction(resIA.data);
      } catch {
        console.warn("Module IA indisponible.");
      }
    } catch (err) {
      setClient(null);
      setMessage(
        err.response?.status === 404 ? "❌ Introuvable." : "❌ Erreur serveur.",
      );
    }
  };

  // 4. Résiliation (Admin)
  const resilierContrat = async (numTel) => {
    if (window.confirm("Résilier ce contrat ?")) {
      try {
        await axios.put(`${API_URL}/api/client/resilier/${numTel}`);
        fetchStats();
        if (client) setClient((prev) => ({ ...prev, statut: "Resilier" }));
        if (vueListe) afficherTousLesClients(filtreStatut);
        alert("✅ Contrat résilié.");
      } catch {
        alert("❌ Action non autorisée.");
      }
    }
  };

  const handleLogout = () => {
    setToken(null);
    setVueListe(false);
    setClient(null);
  };

  if (!token) {
    return (
      <div className="auth-wrapper">
        <div className="auth-container">
          <img
            src="https://www.ooredoo.tn/themes/ooredoo/img/logo.png"
            alt="Ooredoo"
            style={{ width: "120px" }}
          />
          <h2>Portail Agent</h2>
          <Login setToken={setToken} />
          <hr />
          <Register />
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="nav-bar">
        <p className="logo-text">
          Ooredoo <span>Portail</span>
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="role-badge">{userRole}</span>
          <button onClick={handleLogout} className="logout-btn">
            Déconnexion
          </button>
        </div>
      </header>

      <main className="main-container">
        {/* DASHBOARD STATS */}
        <section className="dashboard-container">
          <div
            className="stat-card"
            onClick={() => afficherTousLesClients("Tous")}
          >
            <h4>Total</h4>
            <p>{stats.total}</p>
          </div>
          <div
            className="stat-card actifs"
            onClick={() => afficherTousLesClients("Actif")}
          >
            <h4>Actifs</h4>
            <p>{stats.actifs}</p>
          </div>
          <div
            className="stat-card resilies"
            onClick={() => afficherTousLesClients("Resilier")}
          >
            <h4>Résiliés</h4>
            <p>{stats.resiliations}</p>
          </div>
        </section>

        {/* RECHERCHE */}
        <section className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Numéro client..."
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && chercherClient()}
            />
            <button onClick={chercherClient}>Rechercher</button>
          </div>
          {message && <p className="error-msg">{message}</p>}
        </section>

        {/* LISTE DES CLIENTS */}
        {vueListe && (
          <section className="liste-section">
            <div className="liste-header">
              <h3>📋 Clients : {filtreStatut}</h3>
              <button onClick={() => setVueListe(false)}>✖ Fermer</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Téléphone</th>
                  <th>Forfait</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tousLesClients
                  .filter((c) =>
                    filtreStatut === "Tous" ? true : c.statut === filtreStatut,
                  )
                  .map((c) => (
                    <tr key={c.ID}>
                      <td>{c.nom_complet}</td>
                      <td>{c.num_telephone}</td>
                      <td>{c.forfait_internet}</td>
                      <td>
                        <span className={`status ${c.statut}`}>{c.statut}</span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setNumero(c.num_telephone);
                            chercherClient();
                            setVueListe(false);
                          }}
                        >
                          👁️ Voir
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </section>
        )}

        {/* FICHE CLIENT + BOUTON PDF */}
        {client && (
          <div className="client-card animate-fade-in">
            <div className="card-header">
              <h3>📄 Dossier {client.ID}</h3>
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <button
                  onClick={genererPDF}
                  style={{
                    backgroundColor: "#57606f",
                    fontSize: "0.8rem",
                    padding: "5px 10px",
                  }}
                >
                  📥 Télécharger PDF
                </button>
                <span className={`badge ${client.statut}`}>
                  {client.statut}
                </span>
              </div>
            </div>
            <div className="card-body">
              <p>
                <strong>Nom:</strong> {client.nom_complet}
              </p>
              <p>
                <strong>Tel:</strong> {client.num_telephone}
              </p>
              <p>
                <strong>Forfait:</strong> {client.forfait_internet}
              </p>
            </div>

            {prediction && (
              <div className={`ia-box ${prediction.niveau}`}>
                <strong>🤖 Analyse EdiPredict:</strong>
                <p>
                  Risque Churn: {prediction.score}% ({prediction.niveau})
                </p>
                <small>💡 {prediction.recommandation}</small>
              </div>
            )}

            {userRole === "Admin" && client.statut === "Actif" && (
              <button
                className="btn-resilier"
                onClick={() => resilierContrat(client.num_telephone)}
              >
                Résilier le contrat
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
