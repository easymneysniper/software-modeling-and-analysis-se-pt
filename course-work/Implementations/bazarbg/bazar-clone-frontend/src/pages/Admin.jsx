import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  FileWarning,
  MessageSquare,
  ShieldCheck,
  Trash2,
  Users
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { currentUser } from "../auth";

const REPORT_REASON_LABELS = {
  fraud: "Измама / подвеждаща обява",
  wrong_category: "Грешна категория",
  forbidden_item: "Забранен артикул",
  duplicate: "Дублирана обява",
  spam: "Спам",
  other: "Друго"
};

const STATUS_LABELS = {
  active: "Активен",
  inactive: "Неактивен",
  blocked: "Блокиран"
};

const REPORT_STATUS_LABELS = {
  pending: "Чака преглед",
  reviewed: "Прегледан",
  resolved: "Решен",
  rejected: "Отхвърлен"
};

export default function Admin() {
  const navigate = useNavigate();
  const user = currentUser();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState("reports");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAdminData() {
    try {
      setLoading(true);
      setError("");

      const [statsData, usersData, reportsData] = await Promise.all([
        apiRequest("/admin/stats"),
        apiRequest("/admin/users"),
        apiRequest("/admin/reports")
      ]);

      setStats(statsData);
      setUsers(usersData);
      setReports(reportsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateReportStatus(reportId, status) {
    try {
      await apiRequest(`/admin/reports/${reportId}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });

      await loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteReportedAd(adId) {
    const confirmed = window.confirm(
      "Сигурен ли си, че искаш да изтриеш тази обява? Тя ще бъде маркирана със статус deleted."
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/admin/ads/${adId}`, {
        method: "DELETE"
      });

      await loadAdminData();
      alert("Обявата е изтрита.");
    } catch (err) {
      alert(err.message);
    }
  }

  async function updateUserStatus(userId, status) {
    try {
      await apiRequest(`/admin/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });

      await loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    if (!user?.is_admin) {
      navigate("/");
      return;
    }

    loadAdminData();
  }, []);

  if (!user?.is_admin) {
    return (
      <div className="state-box">
        Нямаш достъп до админ менюто.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="state-box">
        Зареждане на админ менюто...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-box">
        {error}
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div>
          <span className="admin-kicker">
            <ShieldCheck size={20} />
            Администраторски панел
          </span>

          <h1>Админ меню</h1>

          <p>
            Управление на потребители, сигнали за нередности и проблемни обяви.
          </p>
        </div>

        <button type="button" className="admin-refresh-button" onClick={loadAdminData}>
          Обнови данните
        </button>
      </div>

      <section className="admin-stats-grid">
        <article className="admin-stat-card">
          <Users size={30} />
          <div>
            <strong>{stats?.users_count || 0}</strong>
            <span>Потребители</span>
          </div>
        </article>

        <article className="admin-stat-card">
          <FileWarning size={30} />
          <div>
            <strong>{stats?.active_ads_count || 0}</strong>
            <span>Активни обяви</span>
          </div>
        </article>

        <article className="admin-stat-card warning">
          <AlertTriangle size={30} />
          <div>
            <strong>{stats?.pending_reports_count || 0}</strong>
            <span>Чакащи сигнали</span>
          </div>
        </article>

        <article className="admin-stat-card">
          <MessageSquare size={30} />
          <div>
            <strong>{stats?.messages_count || 0}</strong>
            <span>Съобщения</span>
          </div>
        </article>
      </section>

      <div className="admin-tabs">
        <button
          type="button"
          className={activeTab === "reports" ? "active" : ""}
          onClick={() => setActiveTab("reports")}
        >
          Сигнали
        </button>

        <button
          type="button"
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          Потребители
        </button>
      </div>

      {activeTab === "reports" && (
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Сигнали за нередности</h2>
            <p>Тук идват сигналите от бутона „Съобщи за нередност!“.</p>
          </div>

          {reports.length === 0 && (
            <div className="admin-empty-state">
              Няма изпратени сигнали.
            </div>
          )}

          {reports.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Обява</th>
                    <th>Подател</th>
                    <th>Причина</th>
                    <th>Описание</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>

                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td>#{report.id}</td>

                      <td>
                        <Link to={`/ads/${report.ad_id}`} className="admin-ad-link">
                          #{report.ad_id} {report.ad_title}
                        </Link>
                      </td>

                      <td>{report.reporter_username}</td>

                      <td>{REPORT_REASON_LABELS[report.reason] || report.reason}</td>

                      <td>
                        {report.description || "-"}
                      </td>

                      <td>
                        <span className={`admin-status-badge report-${report.status}`}>
                          {REPORT_STATUS_LABELS[report.status] || report.status}
                        </span>
                      </td>

                      <td>
                        <div className="admin-actions">
                          <button
                            type="button"
                            onClick={() => updateReportStatus(report.id, "reviewed")}
                          >
                            Прегледан
                          </button>

                          <button
                            type="button"
                            onClick={() => updateReportStatus(report.id, "resolved")}
                          >
                            Решен
                          </button>

                          <button
                            type="button"
                            onClick={() => updateReportStatus(report.id, "rejected")}
                          >
                            Отхвърли
                          </button>

                          <button
                            type="button"
                            className="danger"
                            onClick={() => deleteReportedAd(report.ad_id)}
                          >
                            <Trash2 size={15} />
                            Изтрий обява
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === "users" && (
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Потребители</h2>
            <p>Тук можеш да блокираш или активираш потребители.</p>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Потребител</th>
                  <th>Email</th>
                  <th>Телефон</th>
                  <th>Роля</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>

              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>

                    <td>{item.username}</td>

                    <td>{item.email}</td>

                    <td>{item.phone || "-"}</td>

                    <td>
                      {item.is_admin ? (
                        <span className="admin-role-badge">
                          <ShieldCheck size={14} />
                          Admin
                        </span>
                      ) : (
                        "User"
                      )}
                    </td>

                    <td>
                      <span className={`admin-status-badge user-${item.status}`}>
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                    </td>

                    <td>
                      <div className="admin-actions">
                        <button
                          type="button"
                          onClick={() => updateUserStatus(item.id, "active")}
                          disabled={item.status === "active"}
                        >
                          <CheckCircle2 size={15} />
                          Активирай
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={() => updateUserStatus(item.id, "blocked")}
                          disabled={item.status === "blocked" || item.id === user.id}
                        >
                          <Ban size={15} />
                          Блокирай
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}