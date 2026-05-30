import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import AdCard from "../components/AdCard";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadFavorites() {
    try {
      setLoading(true);
      const data = await apiRequest("/favorites/me");
      setFavorites(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(favoriteId) {
    try {
      await apiRequest(`/favorites/${favoriteId}`, {
        method: "DELETE"
      });

      setFavorites((current) => current.filter((item) => item.id !== favoriteId));
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <div>
      <section className="page-title">
        <span className="eyebrow">Любими</span>
        <h1>Запазени обяви</h1>
      </section>

      {loading && <div className="state-box">Зареждане...</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && favorites.length === 0 && (
        <div className="state-box">Нямаш любими обяви.</div>
      )}

      <section className="ads-grid">
        {favorites.map((favorite) => (
          <div key={favorite.id} className="favorite-wrap">
            <AdCard ad={favorite.ad} />

            <button
              className="danger-button full"
              onClick={() => removeFavorite(favorite.id)}
            >
              Премахни от любими
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}