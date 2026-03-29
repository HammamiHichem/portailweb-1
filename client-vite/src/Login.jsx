import axios from "axios";
import { useState } from "react";

// Récupération de l'URL depuis le .env de Vite
const API_URL = import.meta.env.VITE_API_URL;

function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Utilisation de la variable d'environnement
      const response = await axios.post(`${API_URL}/api/login`, {
        username: username,
        password: password,
      });

      const token = response.data.token;
      setToken(token);
      localStorage.setItem("token", token);
    } catch (err) {
      alert(err.response?.data?.error || "Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2 style={{ color: "#ed1c24", marginBottom: "20px" }}>
        Connexion Espace Agent
      </h2>
      <form
        onSubmit={handleLogin}
        style={{
          display: "inline-block",
          textAlign: "left",
          border: "1px solid #eee",
          padding: "25px",
          borderRadius: "12px",
          backgroundColor: "#f9f9f9",
          width: "100%",
          maxWidth: "320px",
        }}
      >
        <label style={{ fontWeight: "bold", color: "#555" }}>
          Utilisateur :
        </label>
        <br />
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "92%",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
          required
        />
        <br />
        <label style={{ fontWeight: "bold", color: "#555" }}>
          Mot de passe :
        </label>
        <br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "92%",
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
          required
        />
        <br />
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: "#ed1c24",
            color: "white",
            width: "100%",
            border: "none",
            padding: "12px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "0.3s",
          }}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

export default Login;
