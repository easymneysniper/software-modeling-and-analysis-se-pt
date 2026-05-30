import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  KeyRound,
  Mail,
  MapPin,
  Menu,
  Save,
  Settings as SettingsIcon,
  UserRound
} from "lucide-react";

import { apiRequest, getStoredUser, setStoredUser } from "../api";
import { logout } from "../auth";

const TABS = {
  profile: "Настройки на профила",
  email: "Смяна на e-mail",
  password: "Смяна на парола"
};

function toFormValue(value) {
  return value === null || value === undefined ? "" : String(value);
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [locations, setLocations] = useState([]);
  const [user, setUser] = useState(getStoredUser());

  const [profileForm, setProfileForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone: "",
    location_id: ""
  });

  const [emailForm, setEmailForm] = useState({
    email: "",
    current_password: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function syncUser(nextUser) {
    setUser(nextUser);
    setStoredUser(nextUser);

    setProfileForm({
      username: toFormValue(nextUser.username),
      first_name: toFormValue(nextUser.first_name),
      last_name: toFormValue(nextUser.last_name),
      phone: toFormValue(nextUser.phone),
      location_id: toFormValue(nextUser.location_id)
    });

    setEmailForm({
      email: toFormValue(nextUser.email),
      current_password: ""
    });
  }

  async function loadInitialData() {
    try {
      setLoading(true);
      setError("");

      const [locationsData, userData] = await Promise.all([
        apiRequest("/locations/"),
        apiRequest("/auth/me")
      ]);

      setLocations(locationsData);
      syncUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  function updateProfileField(field, value) {
    setMessage("");
    setError("");
    setProfileForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function updateEmailField(field, value) {
    setMessage("");
    setError("");
    setEmailForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function updatePasswordField(field, value) {
    setMessage("");
    setError("");
    setPasswordForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const updatedUser = await apiRequest("/users/me/profile", {
        method: "PUT",
        body: JSON.stringify({
          username: profileForm.username.trim(),
          first_name: profileForm.first_name.trim() || null,
          last_name: profileForm.last_name.trim() || null,
          phone: profileForm.phone.trim() || null,
          location_id: profileForm.location_id ? Number(profileForm.location_id) : null
        })
      });

      syncUser(updatedUser);
      setMessage("Профилът е обновен успешно.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveEmail(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const updatedUser = await apiRequest("/users/me/email", {
        method: "PUT",
        body: JSON.stringify({
          email: emailForm.email.trim(),
          current_password: emailForm.current_password
        })
      });

      syncUser(updatedUser);
      setMessage("E-mail адресът е сменен успешно.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError("Новата парола и потвърждението не съвпадат.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await apiRequest("/users/me/password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password
        })
      });

      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });
      setMessage("Паролата е сменена успешно.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="state-box">Зареждане на настройките...</div>;
  }

  return (
    <section className="settings-page classic-settings-page">
      <div className="settings-hero">
        <div className="settings-avatar-box">
          <div className="settings-avatar">
            <UserRound size={82} />
          </div>
        </div>

        <div className="settings-cover-info">
          <strong>{user?.username}</strong>
          <span>{user?.email}</span>
          <small>
            {user?.is_admin ? "Администратор" : "Потребител"} · статус: {user?.status || "active"}
          </small>
        </div>
      </div>

      <h1 className="settings-breadcrumb">Моят Bazar › Настройки</h1>

      <div className="settings-layout">
        <aside className="profile-sidebar">
          <div className="profile-menu-section">
            <h3>
              <Menu size={18} />
              Моят профил:
            </h3>

            <Link to="/my-ads">Моите обяви</Link>
            <Link to="/messages">Съобщения</Link>
            <Link to="/delivery">Доставка</Link>
          </div>

          <div className="profile-menu-section">
            <h3>
              <Heart size={19} />
              Любими:
            </h3>

            <Link to="/favorites">Обяви</Link>
          </div>

          <div className="profile-menu-section muted-section">
            <Link to="/settings" className="active">
              <SettingsIcon size={17} />
              Настройки
            </Link>

            <button type="button" onClick={logout}>
              Изход
            </button>
          </div>
        </aside>

        <div className="settings-content">
          <div className="settings-tabs">
            {Object.entries(TABS).map(([tabId, label]) => (
              <button
                key={tabId}
                type="button"
                className={activeTab === tabId ? "active" : ""}
                onClick={() => {
                  setActiveTab(tabId);
                  setMessage("");
                  setError("");
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {error && <div className="error-box">{error}</div>}
          {message && <div className="success-box">{message}</div>}

          {activeTab === "profile" && (
            <form className="settings-profile-form" onSubmit={saveProfile}>
              <div className="settings-readonly-row">
                <span>* E-mail:</span>
                <strong>{user?.email}</strong>
              </div>

              <label>
                * Потребителско име:
                <input
                  value={profileForm.username}
                  onChange={(event) => updateProfileField("username", event.target.value)}
                  required
                />
              </label>

              <div className="two-cols">
                <label>
                  Име:
                  <input
                    value={profileForm.first_name}
                    onChange={(event) => updateProfileField("first_name", event.target.value)}
                  />
                </label>

                <label>
                  Фамилия:
                  <input
                    value={profileForm.last_name}
                    onChange={(event) => updateProfileField("last_name", event.target.value)}
                  />
                </label>
              </div>

              <label>
                Телефон за връзка:
                <input
                  value={profileForm.phone}
                  onChange={(event) => updateProfileField("phone", event.target.value)}
                  placeholder="Например: 0888123456"
                />
              </label>

              <label>
                Населено място:
                <select
                  value={profileForm.location_id}
                  onChange={(event) => updateProfileField("location_id", event.target.value)}
                >
                  <option value="">--- Изберете град ---</option>

                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.city}
                    </option>
                  ))}
                </select>
              </label>

              <div className="settings-info-line">
                <MapPin size={17} />
                Тези данни се записват в таблицата users и се използват в профила, обявите и съобщенията.
              </div>

              <button className="primary-button settings-save-button" disabled={saving}>
                <Save size={18} />
                {saving ? "Запис..." : "Запис"}
              </button>
            </form>
          )}

          {activeTab === "email" && (
            <form className="settings-profile-form" onSubmit={saveEmail}>
              <label>
                Нов e-mail:
                <input
                  type="email"
                  value={emailForm.email}
                  onChange={(event) => updateEmailField("email", event.target.value)}
                  required
                />
              </label>

              <label>
                Текуща парола:
                <input
                  type="password"
                  value={emailForm.current_password}
                  onChange={(event) => updateEmailField("current_password", event.target.value)}
                  required
                />
              </label>

              <div className="settings-info-line">
                <Mail size={17} />
                E-mail адресът трябва да е уникален за всеки потребител.
              </div>

              <button className="primary-button settings-save-button" disabled={saving}>
                <Save size={18} />
                {saving ? "Запис..." : "Смени e-mail"}
              </button>
            </form>
          )}

          {activeTab === "password" && (
            <form className="settings-profile-form" onSubmit={savePassword}>
              <label>
                Текуща парола:
                <input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(event) => updatePasswordField("current_password", event.target.value)}
                  required
                />
              </label>

              <label>
                Нова парола:
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(event) => updatePasswordField("new_password", event.target.value)}
                  minLength={6}
                  required
                />
              </label>

              <label>
                Повтори новата парола:
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(event) => updatePasswordField("confirm_password", event.target.value)}
                  minLength={6}
                  required
                />
              </label>

              <div className="settings-info-line">
                <KeyRound size={17} />
                Паролата се записва хеширана в базата.
              </div>

              <button className="primary-button settings-save-button" disabled={saving}>
                <Save size={18} />
                {saving ? "Запис..." : "Смени парола"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
