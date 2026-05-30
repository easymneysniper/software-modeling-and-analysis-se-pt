import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Edit3, Trash2 } from "lucide-react";
import { apiRequest, getStoredUser } from "../api";
import AdCard from "../components/AdCard";

export default function MyAds() {
  const user = getStoredUser();

  const [ads, setAds] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadMyAds() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(`/ads/user/${user.id}/list`);
      setAds(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAd(adId) {
    const confirmed = window.confirm("Сигурен ли си, че искаш да изтриеш тази обява?");

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/ads/${adId}`, {
        method: "DELETE"
      });

      setAds((current) => current.filter((ad) => ad.id !== adId));
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    loadMyAds();
  }, []);

  return (
    <div>
      <section className="page-title">
        <span className="eyebrow">Моите обяви</span>
        <h1>Обяви, публикувани от теб</h1>
      </section>

      {loading && <div className="state-box">Зареждане...</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && ads.length === 0 && (
        <div className="state-box">Все още нямаш публикувани обяви.</div>
      )}

      <section className="ads-grid">
        {ads.map((ad) => (
          <div key={ad.id} className="favorite-wrap">
            <AdCard ad={ad} />

            <div className="two-cols">
              <Link to={`/edit-ad/${ad.id}`} className="ghost-button full">
                <Edit3 size={17} />
                Редактирай
              </Link>

              <button className="danger-button full" onClick={() => deleteAd(ad.id)}>
                <Trash2 size={17} />
                Изтрий
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}