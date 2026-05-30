import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest, setStoredUser, setToken } from "../api";

export default function Login() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await loginRequest(identifier, password);

      setToken(data.access_token);
      setStoredUser(data.user);

      window.dispatchEvent(new Event("authChanged"));

      navigate("/");
    } catch (err) {
      setError(err.message || "Грешка при вход.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="classic-auth-page classic-auth-page-login">
      <div className="classic-auth-modal">
        <div className="classic-auth-top-note">
          Пълният достъп до всички функции на сайта
          <br />
          е технически възможен само след Регистрация.
        </div>

        <div className="classic-auth-close">✕</div>

        <div className="classic-auth-frame">
          <div className="classic-auth-tabs">
            <Link to="/login" className="classic-auth-tab active">
              Вход
            </Link>

            <Link to="/register" className="classic-auth-tab">
              Регистрация
            </Link>
          </div>

          <div className="classic-auth-inner">
            {error && <div className="classic-auth-error">{error}</div>}

            <form className="classic-auth-form" onSubmit={handleSubmit}>
              <input
                className={`classic-auth-input ${error ? "has-error" : ""}`}
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="E-mail / Потребителско име"
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

              <Link to="#" className="classic-auth-forgot">
                Забравена парола?
              </Link>

              <button className="classic-auth-primary" disabled={loading}>
                {loading ? "Вход..." : "Вход"}
              </button>

              <button type="button" className="classic-auth-google">
                <span className="classic-google-icon">G</span>
                Продължи с Google
              </button>

              <p className="classic-auth-footnote">
                Влизайки в профила си приемам{" "}
                <a href="#">общите условия</a> на сайта.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}