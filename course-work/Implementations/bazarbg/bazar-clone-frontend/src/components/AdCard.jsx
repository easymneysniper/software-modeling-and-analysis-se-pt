import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { apiRequest, getImageUrl } from "../api";
import { isAuthenticated } from "../auth";

export default function AdCard({ ad, onFavoriteAdded }) {
  const mainImage =
    ad.images?.find((image) => image.is_main) ||
    ad.images?.[0] ||
    null;

  async function handleFavoriteClick(event) {
    event.preventDefault();

    if (!isAuthenticated()) {
      alert("Трябва да влезеш в профила си, за да добавяш любими.");
      return;
    }

    try {
      await apiRequest("/favorites/", {
        method: "POST",
        body: JSON.stringify({
          ad_id: ad.id
        })
      });

      if (onFavoriteAdded) {
        onFavoriteAdded(ad.id);
      }

      alert("Обявата е добавена в любими.");
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <Link to={`/ads/${ad.id}`} className="classic-ad-card">
      <div className="classic-ad-image">
        {mainImage ? (
          <img src={getImageUrl(mainImage.image_url)} alt={ad.title} />
        ) : (
          <span>{ad.category?.name || "Обява"}</span>
        )}

        <button className="classic-favorite" onClick={handleFavoriteClick}>
          <Heart size={19} />
        </button>
      </div>

      <div className="classic-ad-info">
        <h3>{ad.title}</h3>

        <p>
          {ad.description.length > 80
            ? `${ad.description.slice(0, 80)}...`
            : ad.description}
        </p>

        <div className="classic-ad-bottom">
          <strong>
            {Number(ad.price || 0).toFixed(2)} {ad.currency}
          </strong>

          <span>{ad.location?.city || "България"}</span>
        </div>
      </div>
    </Link>
  );
}