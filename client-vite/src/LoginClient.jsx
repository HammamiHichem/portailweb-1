import axios from "axios";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LoginClient = ({ setToken }) => {
  const [step, setStep] = useState(1); // 1: Numéro, 2: Code OTP
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Étape 1 : Envoyer le code OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ton endpoint backend pour générer l'OTP
      await axios.post(`${API_URL}/api/auth/client/request-otp`, { phone });
      setStep(2);
    } catch {
      // Pas besoin de 'err' ici si on affiche juste un message générique
      alert("Erreur : Numéro non reconnu ou problème réseau.");
    } finally {
      setLoading(false);
    }
  };

  // Étape 2 : Vérifier le code et se connecter
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/client/verify-otp`, {
        phone,
        otp,
      });
      setToken(res.data.token); // On stocke le JWT
      alert("Bienvenue sur votre espace Ooredoo !");
    } catch {
      // Pas besoin de 'err' ici si on affiche juste un message générique
      alert("Erreur : Numéro non reconnu ou problème réseau.");
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

      <p
        style={{
          color: "var(--text-light)",
          fontSize: "0.9rem",
          marginBottom: "20px",
        }}
      >
        {step === 1
          ? "Entrez votre numéro Ooredoo pour recevoir votre code d'accès."
          : `Code envoyé au +216 ${phone}`}
      </p>

      <form onSubmit={step === 1 ? handleRequestOTP : handleVerifyOTP}>
        {step === 1 ? (
          <div className="form-group">
            <input
              type="tel"
              placeholder="Ex: 22 123 456"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="client-input"
            />
          </div>
        ) : (
          <div className="form-group">
            <input
              type="text"
              placeholder="Entrez les 6 chiffres"
              required
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="client-input otp-field"
            />
          </div>
        )}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading
            ? "Chargement..."
            : step === 1
              ? "Recevoir mon code"
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

export default LoginClient;
