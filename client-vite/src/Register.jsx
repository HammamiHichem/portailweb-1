import axios from "axios";
import { useState } from "react";

// Récupération de l'URL depuis le .env de Vite
const API_URL = import.meta.env.VITE_API_URL;

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Utilisation de la variable d'environnement
      const response = await axios.post(`${API_URL}/api/register`, {
        username: username,
        password: password,
      });

      alert("✅ " + response.data.message);
      setUsername("");
      setPassword("");
    } catch (err) {
      console.error("Erreur Inscription:", err);
      const messageErreur = err.response?.data?.error || "Serveur injoignable";
      alert("❌ Erreur : " + messageErreur);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "25px",
        border: "2px solid #ed1c24",
        borderRadius: "12px",
        maxWidth: "400px",
        margin: "20px auto",
        textAlign: "center",
        backgroundColor: "#fff",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ color: "#333", marginBottom: "20px" }}>
        Inscription Nouvel Agent Ooredoo
      </h3>

      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              padding: "10px",
              width: "90%",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "10px",
              width: "90%",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 25px",
            backgroundColor: loading ? "#ccc" : "#ed1c24",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            width: "100%",
          }}
        >
          {loading ? "Création en cours..." : "Créer le compte sécurisé"}
        </button>
      </form>
    </div>
  );
}

export default Register;
