import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AgentReclamations = () => {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReclamations = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/reclamations/toutes`);
      setReclamations(res.data);
    } catch (err) {
      console.error("Erreur chargement réclamations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReclamations();
  }, []);

  const updateStatut = async (id, nouveauStatut) => {
    try {
      await axios.put(`${API_URL}/api/reclamations/statut/${id}`, {
        statut: nouveauStatut,
      });
      alert("✅ Statut mis à jour !");
      fetchReclamations(); // Rafraîchir la liste
    } catch (err) {
      alert("❌ Erreur lors de la mise à jour.");
    }
  };

  if (loading) return <p>Chargement des réclamations...</p>;

  return (
    <div
      className="agent-reclamations-container"
      style={{
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      }}
    >
      {reclamations.length === 0 ? (
        <p>Aucune réclamation en attente.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{ borderBottom: "2px solid #ed1c24", textAlign: "left" }}
            >
              <th style={{ padding: "10px" }}>Client</th>
              <th>Sujet</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reclamations.map((rec) => (
              <tr key={rec.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "12px" }}>
                  <strong>{rec.num_telephone}</strong>
                </td>
                <td>{rec.sujet}</td>
                <td>{new Date(rec.date_creation).toLocaleDateString()}</td>
                <td>
                  <span
                    className={`status-badge ${rec.statut}`}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      backgroundColor:
                        rec.statut === "En attente" ? "#fff3cd" : "#d4edda",
                      color:
                        rec.statut === "En attente" ? "#856404" : "#155724",
                    }}
                  >
                    {rec.statut}
                  </span>
                </td>
                <td>
                  <select
                    onChange={(e) => updateStatut(rec.id, e.target.value)}
                    value={rec.statut}
                    style={{ padding: "5px", borderRadius: "4px" }}
                  >
                    <option value="En attente">En attente</option>
                    <option value="En cours">En cours</option>
                    <option value="Traité">Traité</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AgentReclamations;
