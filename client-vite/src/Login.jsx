import axios from "axios";
import { useState } from "react";
// 1. On importe le composant ElectricBorder (vérifie bien le chemin du fichier)
import ElectricBorder from "./ElectricBorder";

const API_URL = import.meta.env.VITE_API_URL;

function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
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
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <h2 style={{ color: "#ed1c24", marginBottom: "20px" }}>
        Connexion Espace Agent
      </h2>

      {/* 2. On utilise ElectricBorder pour envelopper le formulaire */}
      <div
        style={{ display: "inline-block", width: "100%", maxWidth: "320px" }}
      >
        <ElectricBorder
          primaryColor="#ed1c24"
          thickness={3}
          style={{ borderRadius: 12 }}
        >
          <form
            onSubmit={handleLogin}
            style={{
              textAlign: "left",
              padding: "25px",
              backgroundColor: "#f9f9f9",
              borderRadius: "12px", // On garde le même arrondi que le bordure
              width: "100%",
              boxSizing: "border-box", // Important pour éviter les débordements
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
                width: "100%", // Modifié à 100% avec border-box
                padding: "10px",
                marginBottom: "15px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
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
                width: "100%", // Modifié à 100% avec border-box
                padding: "10px",
                marginBottom: "20px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
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
        </ElectricBorder>
      </div>
    </div>
  );
}

export default Login;
