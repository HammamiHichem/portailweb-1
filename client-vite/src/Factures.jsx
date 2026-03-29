import axios from "axios";
import { useEffect, useState } from "react";

const Factures = ({ phone }) => {
  const [list, setList] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // --- FONCTION DE PAIEMENT MISE À JOUR ---
  const handlePay = async (factureId) => {
    // On récupère le token avant de lancer la requête
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Session expirée. Veuillez vous reconnecter.");
      return;
    }

    try {
      const res = await axios.put(
        `${API_URL}/api/client/facture/payer/${factureId}`,
        {}, // Le corps de la requête reste vide
        {
          headers: { Authorization: `Bearer ${token}` }, // Très important !
        },
      );

      if (res.status === 200) {
        alert("✅ Paiement Ooredoo validé !");
        window.location.reload(); // Rafraîchit pour voir le statut "Payée"
      }
    } catch (err) {
      console.error("Détail de l'erreur :", err.response?.data || err.message);
      alert("Erreur lors du paiement. Vérifie la console (F12).");
    }
  };

  useEffect(() => {
    const fetchFactures = async () => {
      try {
        // --- MISE À JOUR SÉCURITÉ : Récupération du token ---
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_URL}/api/client/factures/${phone}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Envoi du badge de sécurité au backend
          },
        });

        console.log("Factures reçues du backend:", res.data);
        setList(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des factures", err);
      }
    };

    if (phone) fetchFactures();
  }, [phone, API_URL]);

  return (
    <div className="factures-container" style={{ marginTop: "30px" }}>
      {/* --- NOUVEAU : BARRE DE CONSOMMATION DATA --- */}
      <div
        className="usage-card"
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <span style={{ fontWeight: "bold" }}>Consommation Data</span>
          <span style={{ color: "#ed1c24", fontWeight: "bold" }}>
            18.5 Go / 25 Go
          </span>
        </div>
        <div
          style={{
            width: "100%",
            background: "#eee",
            height: "12px",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{ width: "74%", background: "#ed1c24", height: "100%" }}
          ></div>
        </div>
        <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "10px" }}>
          Il vous reste 6.5 Go jusqu'au renouvellement le 01/04.
        </p>
      </div>

      <h3 style={{ borderBottom: "2px solid #ed1c24", paddingBottom: "10px" }}>
        📑 Mes Factures à payer
      </h3>

      {list.length > 0 ? (
        <div
          className="factures-grid"
          style={{ display: "grid", gap: "15px", marginTop: "20px" }}
        >
          {list.map((f) => (
            <div
              key={f.id}
              className="facture-card"
              style={{
                background: "#fff",
                padding: "15px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderLeft:
                  f.statut === "Payée"
                    ? "5px solid #4CAF50"
                    : "5px solid #ed1c24",
              }}
            >
              <div>
                <strong style={{ fontSize: "1.1rem" }}>{f.mois}</strong>
                <p style={{ margin: "5px 0", color: "#666" }}>
                  Échéance : {new Date(f.date_echeance).toLocaleDateString()}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    display: "block",
                  }}
                >
                  {f.montant} DT
                </span>
                {f.statut === "En attente" ? (
                  <button
                    className="btn-pay"
                    style={{
                      background: "#ed1c24",
                      color: "white",
                      border: "none",
                      padding: "8px 15px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginTop: "5px",
                    }}
                    onClick={() => handlePay(f.id)}
                  >
                    Payer maintenant
                  </button>
                ) : (
                  <span style={{ color: "#4CAF50", fontWeight: "bold" }}>
                    ✓ Payée
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "#888", fontStyle: "italic" }}>
          Aucune facture trouvée pour ce numéro.
        </p>
      )}
    </div>
  );
};

export default Factures;
