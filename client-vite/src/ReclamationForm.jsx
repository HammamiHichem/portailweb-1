import axios from "axios";
import { useState } from "react";

const ReclamationForm = ({ phone }) => {
  const [objet, setObjet] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState({ type: "", msg: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setStatus({
        type: "error",
        msg: "❌ Session expirée. Reconnectez-vous.",
      });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/client/reclamation",
        {
          phone: phone,
          objet: objet,
          message: message,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status === 201 || response.status === 200) {
        setStatus({ type: "success", msg: "✅ Réclamation envoyée !" });
        setObjet("");
        setMessage("");
      }
    } catch (err) {
      console.error(
        "Détails de l'erreur d'envoi:",
        err.response?.data || err.message,
      );
      // Utilisation de guillemets doubles pour éviter le conflit avec l'apostrophe
      setStatus({ type: "error", msg: "❌ Erreur lors de l'envoi." });
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        marginTop: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ color: "#ed1c24" }}>📩 Envoyer une réclamation</h3>

      {status.msg && (
        <p
          style={{
            color: status.type === "success" ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {status.msg}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <select
          value={objet}
          onChange={(e) => setObjet(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
          }}
        >
          <option value="">-- Type de problème --</option>
          <option value="Débit lent">Débit lent / Coupure</option>
          <option value="Facture">Problème de Facture</option>
          <option value="Box">Problème Box 4G</option>
        </select>

        <textarea
          placeholder="Détails de votre demande..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          style={{
            width: "100%",
            height: "100px",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
          }}
        />

        <button
          type="submit"
          style={{
            background: "#ed1c24",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Envoyer au support Ooredoo
        </button>
      </form>
    </div>
  );
}; // Vérifie que cette accolade ferme bien la fonction ReclamationForm

export default ReclamationForm;
