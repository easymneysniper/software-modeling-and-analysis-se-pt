import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Паролите не съвпадат.");
      return;
    }

    if (!acceptedTerms) {
      setError("Трябва да приемеш условията.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const generatedUsername = email.trim().toLowerCase();

      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: generatedUsername,
          email: email.trim().toLowerCase(),
          password
        })
      });

      navigate("/login");
    } catch (err) {
      setError(err.message || "Грешка при регистрация.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="classic-auth-page classic-auth-page-register">
      <div className="classic-auth-register-wrap">
        <div className="classic-auth-register-frame">
          <div className="classic-auth-tabs classic-auth-tabs-register">
            <Link to="/login" className="classic-auth-tab">
              Вход
            </Link>

            <Link to="/register" className="classic-auth-tab active">
              Регистрация
            </Link>
          </div>

          <div className="classic-auth-inner classic-auth-inner-register">
            {error && <div className="classic-auth-error">{error}</div>}

            <form className="classic-auth-form" onSubmit={handleSubmit}>
              <input
                className="classic-auth-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="E-mail"
                required
              />

              <input
                className="classic-auth-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Парола"
                required
              />

              <input
                className="classic-auth-input"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Потвърдете паролата"
                required
              />

              <label className="classic-auth-checkbox-row">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                />

                <span>
                  Приемам <a href="#">условията за ползване</a> и{" "}
                  <a href="#">политиката за лични данни</a>
                </span>
              </label>

              <button className="classic-auth-primary" disabled={loading}>
                {loading ? "Регистрация..." : "Регистрация"}
              </button>

              <button type="button" className="classic-auth-google">
                <span className="classic-google-icon">G</span>
                Продължи с Google
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}