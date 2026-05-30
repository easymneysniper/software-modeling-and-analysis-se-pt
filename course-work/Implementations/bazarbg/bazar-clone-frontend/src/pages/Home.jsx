import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";

import { apiRequest } from "../api";
import AdCard from "../components/AdCard";
import dostavkaEkont from "../assets/dostavka_ekont.png";

const CATEGORY_META = {
  auto: {
    icon: "car",
    color: "#1595d3"
  },
  imoti: {
    icon: "house",
    color: "#b33438"
  },
  elektronika: {
    icon: "monitor",
    color: "#3995a0"
  },
  moda: {
    icon: "heel",
    color: "#e91e63"
  },
  "dom-i-gradina": {
    icon: "sun",
    color: "#f6b800"
  },
  "detski-i-bebeshki": {
    icon: "shirt",
    color: "#f49cc4"
  },
  "sport-i-hobi": {
    icon: "sofa",
    color: "#a65091"
  },
  jivotni: {
    icon: "horse",
    color: "#5a332b"
  },
  rabota: {
    icon: "briefcase",
    color: "#ee7338"
  },
  uslugi: {
    icon: "cart",
    color: "#8cc63e"
  }
};

function BazarCategoryIcon({ type, color }) {
  if (type === "car") {
    return (
      <svg className="bazar-category-icon" viewBox="0 0 64 64" aria-hidden="true">
        <path
          fill={color}
          d="M11 29h4l6-11h26l6 11h3c3 0 5 2 5 5v13h-7v5h-9v-5H19v5h-9v-5H4V34c0-3 3-5 7-5Zm11-4-3 6h26l-3-6H22Zm-8 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm36 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
        />
      </svg>
    );
  }

  if (type === "house") {
    return (
      <svg className="bazar-category-icon" viewBox="0 0 64 64" aria-hidden="true">
        <path
          fill={color}
          d="M6 31 32 8l26 23-5 6-4-4v23H37V39H27v17H15V33l-4 4-5-6Z"
        />
        <path fill={color} d="M45 10h8v15l-8-7V10Z" />
      </svg>
    );
  }

  if (type === "heel") {
    return (
      <svg className="bazar-category-icon" viewBox="0 0 64 64" aria-hidden="true">
        <path
          fill={color}
          d="M42 5c4 11 5 22 2 35h9v8H19c-7 0-11-2-11-6 0-4 5-6 13-8 8-3 13-8 15-18 1-5 3-9 6-11Z"
        />
        <path fill={color} d="M42 43h9v15h-8l-1-15Z" />
      </svg>
    );
  }

  if (type === "monitor") {
    return (
      <svg className="bazar-category-icon" viewBox="0 0 64 64" aria-hidden="true">
        <path
          fill={color}
          d="M8 12h48v34H8V12Zm6 6v22h36V18H14Zm13 32h10v5h9v4H18v-4h9v-5Z"
        />
      </svg>
    );
  }

  if (type === "shirt") {
    return (
      <svg className="bazar-category-icon" viewBox="0 0 64 64" aria-hidden="true">
        <path
          fill={color}
          d="M22 9c3 4 7 6 10 6s7-2 10-6l15 8-8 14-5-3v27H20V28l-5 3-8-14 15-8Z"
        />
      </svg>
    );
  }

  if (type === "sofa") {
    return (
      <svg className="bazar-category-icon" viewBox="0 0 64 64" aria-hidden="true">
        <path
          fill={color}
          d="M17 17h30c5 0 8 3 8 8v9c4 1 6 4 6 8v11h-8v-5H11v5H3V42c0-4 2-7 6-8v-9c0-5 3-8 8-8Zm-1 8v12h32V25H16Zm-5 18v7h42v-7H11Z"
        />
        <circle cx="22" cy="28" r="3" fill="#ffffff" opacity="0.25" />
        <circle cx="32" cy="28" r="3" fill="#ffffff" opacity="0.25" />
        <circle cx="42" cy="28" r="3" fill="#ffffff" opacity="0.25" />
      </svg>
    );
  }

  if (type === "sun") {
    return (
      <svg className="bazar-category-icon" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="14" fill={color} />
        <path
          fill={color}
          d="M29 2h6v12h-6V2Zm0 48h6v12h-6V50ZM2 29h12v6H2v-6Zm48 0h12v6H50v-6ZM11 7l9 9-4 4-9-9 4-4Zm33 37 9 9-4 4-9-9 4-4Zm9-33-9 9-4-4 9-9 4 4ZM20 44l-9 9-4-4 9-9 4 4Z"
        />
      </svg>
    );
  }

  if (type === "horse") {
    return (
      <svg className="bazar-category-icon" viewBox="0 0 64 64" aria-hidden="true">
        <path
          fill={color}
          d="M22 7c6 5 13 9 24 11l7 12-6 7 5 14H24l-8-17-5 2 3-16 8-13Zm22 17a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
        />
        <path fill={color} d="M20 9 9 25l9-2 8-13-6-1Z" />
      </svg>
    );
  }

  if (type === "briefcase") {
    return (
      <svg className="bazar-category-icon" viewBox="0 0 64 64" aria-hidden="true">
        <path
          fill={color}
          d="M24 10h16v8h16v36H8V18h16v-8Zm5 5v3h6v-3h-6ZM14 28v7h36v-7H14Zm17 4h5v5h-5v-5Z"
        />
      </svg>
    );
  }

  if (type === "cart") {
    return (
      <svg className="bazar-category-icon" viewBox="0 0 64 64" aria-hidden="true">
        <path
          fill={color}
          d="M7 10h10l4 30h27l7-21H24l-1-7h37l-11 35H17L12 17H7v-7Z"
        />
        <circle cx="24" cy="53" r="5" fill={color} />
        <circle cx="46" cy="53" r="5" fill={color} />
      </svg>
    );
  }

  return (
    <svg className="bazar-category-icon" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="24" fill={color} />
    </svg>
  );
}

function getCategoryMeta(category) {
  return (
    CATEGORY_META[category.slug] || {
      icon: "default",
      color: "#3368b2"
    }
  );
}

export default function Home() {
  const [ads, setAds] = useState([]);
  const [allAds, setAllAds] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  const [q, setQ] = useState("");
  const [locationId, setLocationId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadMainCategories() {
    const data = await apiRequest("/categories/main");
    setMainCategories(data);
  }

  async function loadLocations() {
    const data = await apiRequest("/locations/");
    setLocations(data);
  }

  async function loadAllAdsForCounts() {
    const data = await apiRequest("/ads/?limit=100");
    setAllAds(data);
  }

  async function loadAds(filters = {}) {
    try {
      setLoading(true);
      setError("");

      const queryText = filters.queryText ?? q;
      const cityId = filters.locationId ?? locationId;
      const categoryId = filters.categoryId ?? selectedCategoryId;
      const params = new URLSearchParams();

      if (queryText.trim()) {
        params.append("q", queryText.trim());
      }

      if (cityId) {
        params.append("location_id", cityId);
      }

      if (categoryId) {
        params.append("category_id", categoryId);
      }

      params.append("limit", "100");

      const query = params.toString();
      const data = await apiRequest(`/ads/?${query}`);

      setAds(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadInitialData() {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadMainCategories(),
        loadLocations(),
        loadAllAdsForCounts()
      ]);

      await loadAds({
        queryText: "",
        locationId: "",
        categoryId: ""
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function countAdsForMainCategory(categoryId) {
    return allAds.filter((ad) => {
      return (
        ad.category?.id === categoryId ||
        ad.category?.parent_id === categoryId
      );
    }).length;
  }

  function handleSubmit(event) {
    event.preventDefault();
    loadAds();
  }

  function handleCategoryClick(categoryId) {
    setSelectedCategoryId(categoryId);
    loadAds({ categoryId });
  }

  function clearFilters() {
    setQ("");
    setLocationId("");
    setSelectedCategoryId("");
    loadAds({
      queryText: "",
      locationId: "",
      categoryId: ""
    });
  }

  const hasActiveFilters = Boolean(q.trim() || locationId || selectedCategoryId);

  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <div className="classic-home">
      <main className="classic-main classic-main-full">
        <form className="classic-search classic-search-full" onSubmit={handleSubmit}>
          <div className="classic-search-input">
            <Search size={26} />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder={`${allAds.length || 0} обяви от цяла България`}
            />
          </div>

          <select
            className="classic-location"
            value={locationId}
            onChange={(event) => setLocationId(event.target.value)}
          >
            <option value="">--- Цяла България ---</option>

            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.city}
              </option>
            ))}
          </select>

          <button className="classic-search-button">
            <Search size={25} />
            ТЪРСИ
          </button>
        </form>

        <section className="classic-categories classic-categories-full">
          {mainCategories.map((category) => {
            const meta = getCategoryMeta(category);
            const adsCount = countAdsForMainCategory(category.id);

            return (
              <button
                key={category.id}
                className={`classic-category ${
                  selectedCategoryId === category.id ? "selected" : ""
                }`}
                onClick={() => handleCategoryClick(category.id)}
                type="button"
              >
                <BazarCategoryIcon type={meta.icon} color={meta.color} />

                <div>
                  <h3>{category.name}</h3>
                  <p>{adsCount} обяви</p>
                </div>
              </button>
            );
          })}
        </section>

        <Link to="/delivery" className="delivery-banner-image">
          <img src={dostavkaEkont} alt="Доставки с Еконт" />
        </Link>

        <section className="classic-ads-section">
          <div className="section-title-row">
            <h2>
              {selectedCategoryId
                ? "ОБЯВИ В ИЗБРАНАТА КАТЕГОРИЯ"
                : "ОБЯВИ В BAZAR.BG"}
            </h2>

            {hasActiveFilters && (
              <button
                type="button"
                className="clear-filters-button"
                onClick={clearFilters}
              >
                <X size={17} />
                Изчисти филтри
              </button>
            )}
          </div>

          {loading && <div className="classic-state">Зареждане на обяви...</div>}

          {error && <div className="classic-error">{error}</div>}

          {!loading && !error && ads.length === 0 && (
            <div className="classic-state">Няма намерени обяви.</div>
          )}

          <div className="classic-ads-grid">
            {ads.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
