import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import Login from "./Login";
import Register from "./Register";

// 1. IMPORT DES COMPOSANTS
import AgentReclamations from "./AgentReclamations"; // Import de la page des réclamations
import Factures from "./Factures";
import NotificationBell from "./NotificationBell";
import ReclamationForm from "./ReclamationForm";

// --- URL DE L'API ---
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// --- COMPOSANT : LOGIN CLIENT (OTP) ---
const LoginClient = ({ setToken }) => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/client/request-otp`, { phone });
      setStep(2);
    } catch {
      alert("Erreur : Numéro non reconnu ou problème réseau.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/client/verify-otp`, {
        phone,
        otp,
      });
      setToken(res.data.token);
    } catch {
      alert("Code incorrect ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="client-login-badge">Espace Personnel</div>
      <h2 className="auth-title">
        Connexion <span className="ooredoo-color">Client</span>
      </h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "20px" }}>
        {step === 1
          ? "Entrez votre numéro pour recevoir un code."
          : `Code envoyé au ${phone}`}
      </p>
      <form onSubmit={step === 1 ? handleRequestOTP : handleVerifyOTP}>
        <input
          type={step === 1 ? "tel" : "text"}
          placeholder={step === 1 ? "Ex: 22123456" : "Code à 6 chiffres"}
          required
          value={step === 1 ? phone : otp}
          onChange={(e) =>
            step === 1 ? setPhone(e.target.value) : setOtp(e.target.value)
          }
          className="client-input"
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
          style={{ width: "100%" }}
        >
          {loading
            ? "Patientez..."
            : step === 1
              ? "Recevoir le code"
              : "Se connecter"}
        </button>
      </form>
      {step === 2 && (
        <button onClick={() => setStep(1)} className="btn-back">
          Modifier le numéro
        </button>
      )}
    </div>
  );
};

// --- COMPOSANT DASHBOARD CLIENT ---
const ClientDashboard = ({ token, setToken }) => {
  const [infos, setInfos] = useState(null);

  useEffect(() => {
    const fetchMyInfos = async () => {
      try {
        const decoded = jwtDecode(token);
        const res = await axios.get(
          `${API_URL}/api/client/${decoded.id || decoded.nom}`,
        );
        setInfos(res.data);
      } catch (err) {
        console.error("Erreur profil client", err);
      }
    };
    fetchMyInfos();
  }, [token]);

  return (
    <div className="App">
      <header className="nav-bar">
        <p className="logo-text">
          Espace Client <span className="ooredoo-color">Ooredoo</span>
        </p>
        <button onClick={() => setToken(null)} className="logout-btn">
          Déconnexion
        </button>
      </header>
      <main className="main-container">
        <div className="client-card animate-fade-in">
          <div className="card-header">
            <h3>Mon Contrat Ooredoo</h3>
          </div>
          {infos ? (
            <div className="card-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Nom</label>
                  <span>{infos.nom_complet}</span>
                </div>
                <div className="info-item">
                  <label>Numéro</label>
                  <span>{infos.num_telephone}</span>
                </div>
                <div className="info-item">
                  <label>Forfait</label>
                  <span>{infos.forfait_internet}</span>
                </div>
                <div className="info-item">
                  <label>Statut</label>
                  <span className={`status ${infos.statut}`}>
                    {infos.statut}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p>Chargement de vos informations...</p>
          )}
        </div>
        {infos && <Factures phone={infos.num_telephone} />}
        {infos && <ReclamationForm phone={infos.num_telephone} />}
      </main>
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---
function App() {
  const [token, setToken] = useState(null);
  const [loginMode, setLoginMode] = useState("agent");
  const [numero, setNumero] = useState("");
  const [client, setClient] = useState(null);
  const [message, setMessage] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [vueListe, setVueListe] = useState(false);
  const [vueReclamations, setVueReclamations] = useState(false); // NOUVEL ÉTAT POUR LA VUE RÉCLAMATIONS
  const [tousLesClients, setTousLesClients] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newClient, setNewClient] = useState({
    nom_complet: "",
    num_telephone: "",
    email: "",
    adresse: "",
    forfait_internet: "4G Box 25Go",
    statut: "Actif",
  });

  const [stats, setStats] = useState({
    total: 0,
    actifs: 0,
    resiliations: 0,
    nouveauxJour: 0,
  });

  const userRole = useMemo(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.role;
    } catch {
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const fetchStats = useCallback(
    async (isMounted) => {
      if (!token || userRole === "Client") return;
      try {
        const res = await axios.get(`${API_URL}/api/stats`);
        if (isMounted) {
          setStats(res.data);
        }
      } catch (error) {
        console.error("Erreur Stats:", error);
      }
    },
    [token, userRole],
  );

  useEffect(() => {
    let isMounted = true;
    const initStats = async () => {
      if (token && userRole !== "Client") {
        await fetchStats(isMounted);
      }
    };
    initStats();
    const interval = setInterval(() => {
      if (token && userRole !== "Client") {
        fetchStats(isMounted);
      }
    }, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token, fetchStats, userRole]);

  const ajouterClient = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/client/ajouter`, newClient);
      setShowAddModal(false);
      setNewClient({
        nom_complet: "",
        num_telephone: "",
        email: "",
        adresse: "",
        forfait_internet: "4G Box 25Go",
        statut: "Actif",
      });
      fetchStats();
      alert("✅ Client ajouté avec succès !");
      if (vueListe) afficherTousLesClients(filtreStatut);
    } catch (err) {
      console.error("Détails de l'erreur d'ajout :", err);
      alert("❌ Erreur lors de l'ajout.");
    }
  };

  const genererPDF = () => {
    if (!client) return;
    const doc = new jsPDF();
    doc.setFillColor(237, 28, 36);
    doc.rect(0, 0, 210, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.text("RAPPORT AGENT - OOREDOO PORTAIL", 15, 13);
    autoTable(doc, {
      startY: 30,
      head: [["Champ", "Valeur"]],
      body: [
        ["Nom Complet", client.nom_complet],
        ["Numéro", client.num_telephone],
        ["Forfait", client.forfait_internet],
        ["Statut", client.statut],
        ["Risque Churn", prediction ? `${prediction.score}%` : "N/A"],
      ],
      headStyles: { fillColor: [237, 28, 36] },
    });
    doc.save(`Rapport_${client.num_telephone}.pdf`);
  };

  const genererPDFListe = () => {
    const doc = new jsPDF();
    doc.text(`LISTE DES CLIENTS (${filtreStatut})`, 15, 13);
    const rows = tousLesClients
      .filter((c) =>
        filtreStatut === "Tous" ? true : c.statut === filtreStatut,
      )
      .map((c) => [
        c.nom_complet,
        c.num_telephone,
        c.forfait_internet,
        c.statut,
      ]);
    autoTable(doc, {
      startY: 20,
      head: [["Nom", "Tel", "Forfait", "Statut"]],
      body: rows,
    });
    doc.save(`Liste_Ooredoo.pdf`);
  };

  const afficherTousLesClients = async (statut = "Tous") => {
    try {
      const res = await axios.get(`${API_URL}/api/clients/liste`);
      setTousLesClients(res.data);
      setFiltreStatut(statut);
      setVueListe(true);
      setVueReclamations(false); // Fermer les réclamations si on ouvre la liste
      setClient(null);
    } catch {
      alert("Erreur liste.");
    }
  };

  const chercherClient = async () => {
    if (!numero) return setMessage("⚠️ Saisissez un numéro.");
    try {
      setMessage("");
      setPrediction(null);
      const res = await axios.get(`${API_URL}/api/client/${numero}`);
      setClient(res.data);
      setVueListe(false);
      setVueReclamations(false);
      try {
        const resIA = await axios.get(
          `${API_URL}/api/client/prediction/${numero}`,
        );
        setPrediction(resIA.data);
      } catch {
        console.warn("IA off.");
      }
    } catch (err) {
      setClient(null);
      setMessage(
        err.response?.status === 404 ? "❌ Introuvable." : "❌ Erreur.",
      );
    }
  };

  const resilierContrat = async (numTel) => {
    if (window.confirm("Résilier ?")) {
      try {
        await axios.put(`${API_URL}/api/client/resilier/${numTel}`);
        fetchStats();
        if (client) setClient((p) => ({ ...p, statut: "Resilier" }));
        alert("✅ Résilié.");
      } catch {
        alert("❌ Erreur.");
      }
    }
  };

  if (!token) {
    return (
      <div className="auth-wrapper">
        <div
          className="login-selector"
          style={{
            marginBottom: "20px",
            display: "flex",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          <button
            className={`mode-btn ${loginMode === "agent" ? "active" : ""}`}
            onClick={() => setLoginMode("agent")}
            style={{
              padding: "10px 20px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              background: loginMode === "agent" ? "#ed1c24" : "#ddd",
              color: loginMode === "agent" ? "white" : "black",
            }}
          >
            Accès Agent
          </button>
          <button
            className={`mode-btn ${loginMode === "client" ? "active" : ""}`}
            onClick={() => setLoginMode("client")}
            style={{
              padding: "10px 20px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              background: loginMode === "client" ? "#ed1c24" : "#ddd",
              color: loginMode === "client" ? "white" : "black",
            }}
          >
            Espace Client
          </button>
        </div>
        {loginMode === "agent" ? (
          <div className="auth-container">
            <h2 className="auth-title">
              Portail Agent <span className="ooredoo-color">Ooredoo</span>
            </h2>
            <Login setToken={setToken} />
            <hr className="auth-hr" />
            <Register />
          </div>
        ) : (
          <LoginClient setToken={setToken} />
        )}
      </div>
    );
  }

  if (userRole === "Client") {
    return <ClientDashboard token={token} setToken={setToken} />;
  }

  return (
    <div className="App">
      <header className="nav-bar">
        <p
          className="logo-text"
          onClick={() => {
            setVueListe(false);
            setVueReclamations(false);
            setClient(null);
          }}
          style={{ cursor: "pointer" }}
        >
          Portail Agent <span className="ooredoo-color">Ooredoo</span>
        </p>
        <div
          className="nav-actions"
          style={{ display: "flex", alignItems: "center", gap: "15px" }}
        >
          {/* On passe la fonction pour changer l'état au lieu de naviguer par URL */}
          <NotificationBell
            onOpenReclamations={() => {
              setVueReclamations(true);
              setVueListe(false);
              setClient(null);
            }}
          />
          <span className="role-badge">{userRole}</span>
          <button onClick={() => setToken(null)} className="logout-btn">
            Déconnexion
          </button>
        </div>
      </header>

      <main className="main-container">
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
          <div
            className="stat-card add-client-card"
            onClick={() => setShowAddModal(true)}
          >
            <h4>Actions</h4>
            <p>➕ Nouveau Client</p>
          </div>
        </section>

        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content animate-fade-in">
              <div className="modal-header">
                <h3>Nouveau client</h3>
                <button onClick={() => setShowAddModal(false)}>✖</button>
              </div>
              <form onSubmit={ajouterClient} className="add-form">
                <input
                  placeholder="Nom"
                  required
                  onChange={(e) =>
                    setNewClient({ ...newClient, nom_complet: e.target.value })
                  }
                />
                <input
                  placeholder="Téléphone"
                  required
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      num_telephone: e.target.value,
                    })
                  }
                />
                <input
                  placeholder="Email"
                  required
                  type="email"
                  onChange={(e) =>
                    setNewClient({ ...newClient, email: e.target.value })
                  }
                />
                <input
                  placeholder="Adresse"
                  required
                  onChange={(e) =>
                    setNewClient({ ...newClient, adresse: e.target.value })
                  }
                />
                <select
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      forfait_internet: e.target.value,
                    })
                  }
                >
                  <option>4G Box 25Go</option>
                  <option>Fiber 100M</option>
                </select>
                <button type="submit" className="btn-submit">
                  Enregistrer
                </button>
              </form>
            </div>
          </div>
        )}

        <section className="search-section">
          <div className="search-box">
            <input
              placeholder="Numéro client..."
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && chercherClient()}
            />
            <button onClick={chercherClient}>Rechercher</button>
          </div>
          {message && <p className="error-msg">{message}</p>}
        </section>

        {/* --- VUE RÉCLAMATIONS --- */}
        {vueReclamations && (
          <div className="animate-fade-in">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ margin: 0 }}>📋 Gestion des Réclamations</h3>
              <button
                onClick={() => setVueReclamations(false)}
                className="btn-close"
              >
                ✖ Fermer
              </button>
            </div>
            <AgentReclamations />
          </div>
        )}

        {vueListe && (
          <section className="liste-section">
            <div className="liste-header">
              <h3>📋 Clients : {filtreStatut}</h3>
              <div className="liste-actions">
                <button onClick={genererPDFListe} className="btn-export">
                  📥 Export PDF
                </button>
                <button
                  onClick={() => setVueListe(false)}
                  className="btn-close"
                >
                  ✖ Fermer
                </button>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Tel</th>
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

        {client && (
          <div className="client-card animate-fade-in">
            <div className="card-header">
              <h3>👤 Dossier n°{client.ID}</h3>
              <div className="card-header-actions">
                <button onClick={genererPDF} className="btn-pdf">
                  📥 Rapport PDF
                </button>
                <span className={`badge ${client.statut}`}>
                  {client.statut}
                </span>
              </div>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Titulaire</label>
                  <span>{client.nom_complet}</span>
                </div>
                <div className="info-item">
                  <label>Ligne</label>
                  <span>{client.num_telephone}</span>
                </div>
                <div className="info-item">
                  <label>Offre</label>
                  <span>{client.forfait_internet}</span>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <span>{client.email || "N/A"}</span>
                </div>
              </div>
            </div>
            {prediction && (
              <div className={`ia-box ${prediction.niveau}`}>
                <div className="ia-header">
                  <strong>🤖 Analyse EdiPredict</strong>
                  <span className="churn-score">{prediction.score}%</span>
                </div>
                <p>
                  Risque : <strong>{prediction.niveau}</strong>
                </p>
                <small>💡 {prediction.recommandation}</small>
              </div>
            )}
            {userRole === "Admin" && client.statut === "Actif" && (
              <button
                className="btn-resilier"
                onClick={() => resilierContrat(client.num_telephone)}
              >
                ⚠️ Résilier
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
export default App;
