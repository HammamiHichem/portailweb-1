import axios from "axios";
import { useCallback, useEffect, useState } from "react";

// On récupère la fonction onOpenReclamations passée depuis App.js
const NotificationBell = ({ onOpenReclamations }) => {
  const [count, setCount] = useState(0);
  const [reclamations, setReclamations] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // On essaie de récupérer le token depuis le localStorage
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(
        "http://localhost:5000/api/agent/reclamations",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const enAttente = res.data.filter((r) => r.statut === "En attente");

      setReclamations(enAttente);
      setCount(enAttente.length);
    } catch (err) {
      console.error("Erreur chargement notifications", err);
    }
  }, []);

  useEffect(() => {
    const initFetch = async () => {
      await fetchData();
    };

    initFetch();

    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div style={{ position: "relative", marginRight: "20px" }}>
      {/* Bouton Cloche */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: "pointer", fontSize: "24px", position: "relative" }}
      >
        🔔
        {count > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "#ed1c24",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "10px",
              border: "1px solid white",
              fontWeight: "bold",
            }}
          >
            {count}
          </span>
        )}
      </div>

      {/* Menu Déroulant (Dropdown) */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "0",
            width: "300px",
            background: "white",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            borderRadius: "8px",
            zIndex: 1000,
            padding: "10px",
            border: "1px solid #eee",
          }}
        >
          <h4
            style={{
              margin: "0 0 10px 0",
              borderBottom: "1px solid #eee",
              paddingBottom: "5px",
              fontSize: "1rem",
              color: "#333",
            }}
          >
            Nouvelles Réclamations
          </h4>

          <div style={{ maxHeight: "250px", overflowY: "auto" }}>
            {reclamations.length > 0 ? (
              reclamations.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #f9f9f9",
                    fontSize: "0.85rem",
                  }}
                >
                  <div style={{ fontWeight: "bold", color: "#ed1c24" }}>
                    {r.nom_complet}
                  </div>
                  <div style={{ fontWeight: "600", marginTop: "2px" }}>
                    {r.objet}
                  </div>
                  <p
                    style={{
                      margin: "3px 0",
                      color: "#666",
                      fontSize: "0.8rem",
                    }}
                  >
                    {r.message.substring(0, 50)}...
                  </p>
                  <small style={{ color: "#999" }}>
                    {new Date(r.date_envoi).toLocaleString()}
                  </small>
                </div>
              ))
            ) : (
              <p
                style={{ textAlign: "center", color: "#999", padding: "10px" }}
              >
                Aucune réclamation en attente
              </p>
            )}
          </div>

          <button
            onClick={() => {
              onOpenReclamations(); // Change la vue dans App.js sans recharger
              setIsOpen(false); // Ferme le dropdown
            }}
            style={{
              width: "100%",
              marginTop: "10px",
              background: "#ed1c24",
              color: "white",
              border: "none",
              padding: "10px",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Gérer les réclamations
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
