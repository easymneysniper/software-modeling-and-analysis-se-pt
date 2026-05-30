import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Expand,
  Flag,
  Heart,
  Mail,
  MessageCircle,
  Phone,
  UserRound,
  X
} from "lucide-react";
import { apiRequest, getImageUrl } from "../api";
import { currentUser, isAuthenticated } from "../auth";

const REPORT_REASONS = [
  { value: "fraud", label: "Измама / подвеждаща обява" },
  { value: "wrong_category", label: "Грешна категория" },
  { value: "forbidden_item", label: "Забранен артикул" },
  { value: "duplicate", label: "Дублирана обява" },
  { value: "spam", label: "Спам" },
  { value: "other", label: "Друго" }
];

function formatPrice(value, currency = "BGN") {
  const number = Number(value || 0);

  if (!number) {
    return "По договаряне";
  }

  return new Intl.NumberFormat("bg-BG", {
    maximumFractionDigits: 2
  }).format(number) + ` ${currency === "EUR" ? "€" : "лв"}`;
}

function getSecondaryPrice(value, currency = "BGN") {
  const number = Number(value || 0);

  if (!number) {
    return "";
  }

  const rate = 1.95583;
  const converted = currency === "EUR" ? number * rate : number / rate;
  const label = currency === "EUR" ? "лв" : "€";

  return new Intl.NumberFormat("bg-BG", {
    maximumFractionDigits: 2
  }).format(converted) + ` ${label}`;
}

function formatDate(date) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("bg-BG", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

export default function AdDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ad, setAd] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [messageBoxOpen, setMessageBoxOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("fraud");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSending, setReportSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const images = useMemo(() => ad?.images || [], [ad]);
  const activeImage = images[activeImageIndex] || null;
  const currentUserData = currentUser();

  const isOwnAd =
    currentUserData?.id &&
    ad?.user?.id &&
    Number(currentUserData.id) === Number(ad.user.id);

  async function loadAd() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(`/ads/${id}`);
      setAd(data);

      const mainIndex = data.images?.findIndex((image) => image.is_main);
      setActiveImageIndex(mainIndex > -1 ? mainIndex : 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function showPreviousImage() {
    if (images.length === 0) return;

    setActiveImageIndex((current) => {
      if (current === 0) {
        return images.length - 1;
      }

      return current - 1;
    });
  }

  function showNextImage() {
    if (images.length === 0) return;

    setActiveImageIndex((current) => {
      if (current === images.length - 1) {
        return 0;
      }

      return current + 1;
    });
  }

  function openGallery() {
    if (images.length > 0) {
      setGalleryOpen(true);
    }
  }

  function closeGallery() {
    setGalleryOpen(false);
  }

  async function addToFavorites() {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    try {
      await apiRequest("/favorites/", {
        method: "POST",
        body: JSON.stringify({
          ad_id: Number(id)
        })
      });

      alert("Обявата е добавена в любими.");
    } catch (err) {
      alert(err.message);
    }
  }

  function handleMessageButtonClick() {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    setMessageBoxOpen((current) => !current);
  }

  async function sendMessage(event) {
    event.preventDefault();

    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (!messageText.trim()) {
      alert("Напиши съобщение.");
      return;
    }

    try {
      setSending(true);

      await apiRequest("/messages/", {
        method: "POST",
        body: JSON.stringify({
          receiver_id: ad.user.id,
          ad_id: ad.id,
          message_text: messageText
        })
      });

      setMessageText("");
      setMessageBoxOpen(false);
      alert("Съобщението е изпратено.");
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  }

  function openReportModal() {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    setReportOpen(true);
  }

  function closeReportModal() {
    setReportOpen(false);
    setReportReason("fraud");
    setReportDescription("");
  }

  async function sendReport(event) {
    event.preventDefault();

    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    try {
      setReportSending(true);

      await apiRequest("/reports/", {
        method: "POST",
        body: JSON.stringify({
          ad_id: Number(id),
          reason: reportReason,
          description: reportDescription.trim() || null
        })
      });

      closeReportModal();
      alert("Сигналът е изпратен успешно.");
    } catch (err) {
      alert(err.message);
    } finally {
      setReportSending(false);
    }
  }

  useEffect(() => {
    loadAd();
  }, [id]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (!galleryOpen) return;

      if (event.key === "Escape") {
        closeGallery();
      }

      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }

      if (event.key === "ArrowRight") {
        showNextImage();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [galleryOpen, images.length]);

  if (loading) {
    return <div className="state-box">Зареждане на обявата...</div>;
  }

  if (error) {
    return <div className="error-box">{error}</div>;
  }

  if (!ad) {
    return <div className="state-box">Обявата не е намерена.</div>;
  }

  return (
    <div className="bazar-ad-view">
      <button className="back-button" onClick={() => navigate(-1)} type="button">
        <ArrowLeft size={18} />
        Назад
      </button>

      <div className="bazar-ad-title-row">
        <div>
          <h1>{ad.title}</h1>
          <p>Обява {ad.id}</p>
        </div>

        <button className="bazar-favorite-button" onClick={addToFavorites} type="button">
          <Heart size={21} />
          Добави в любими
        </button>
      </div>

      <section className="bazar-details-layout">
        <main className="bazar-gallery-column">
          <div className="bazar-gallery-frame">
            {images.length > 1 && (
              <button
                className="bazar-gallery-nav left"
                onClick={showPreviousImage}
                type="button"
                aria-label="Предишна снимка"
              >
                <ChevronLeft size={35} />
              </button>
            )}

            <div
              className={`bazar-main-photo ${activeImage ? "has-image" : ""}`}
              onClick={openGallery}
              role={activeImage ? "button" : undefined}
              tabIndex={activeImage ? 0 : undefined}
            >
              {activeImage ? (
                <img src={getImageUrl(activeImage.image_url)} alt={ad.title} />
              ) : (
                <span>{ad.category?.name || "Обява"}</span>
              )}
            </div>

            {images.length > 1 && (
              <button
                className="bazar-gallery-nav right"
                onClick={showNextImage}
                type="button"
                aria-label="Следваща снимка"
              >
                <ChevronRight size={35} />
              </button>
            )}

            {images.length > 0 && (
              <div className="bazar-photo-counter">
                {activeImageIndex + 1}/{images.length}
              </div>
            )}

            {activeImage && (
              <button
                className="bazar-expand-button"
                onClick={openGallery}
                type="button"
                aria-label="Голям преглед"
              >
                <Expand size={28} />
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div className="bazar-thumbs-row">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  className={`bazar-thumb ${activeImageIndex === index ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={getImageUrl(image.image_url)} alt="Снимка към обява" />
                </button>
              ))}
            </div>
          )}

          <article className="bazar-description-box">
            <h2>Описание</h2>
            <p>{ad.description}</p>

            <div className="bazar-ad-meta-line">
              <span>Категория: {ad.category?.name || "-"}</span>
              <span>Град: {ad.location?.city || "България"}</span>
              {ad.address_area && <span>Район: {ad.address_area}</span>}
              <span>Преглеждания: {ad.views_count}</span>
              <span>Състояние: {ad.item_condition}</span>
            </div>
          </article>
        </main>

        <aside className="bazar-side-panel">
          <div className="bazar-price-label">Цена:</div>

          <div className="bazar-price-ticket">
            <strong>{formatPrice(ad.price, ad.currency)}</strong>
            {getSecondaryPrice(ad.price, ad.currency) && (
              <span>{getSecondaryPrice(ad.price, ad.currency)}</span>
            )}
          </div>

          {!isOwnAd && (
            <>
              <button
                className="bazar-action-button"
                type="button"
                onClick={handleMessageButtonClick}
              >
                <Mail size={31} />
                Изпрати съобщение
              </button>

              {ad.phone_visible && ad.user?.phone && (
                <button
                  className="bazar-phone-button"
                  type="button"
                  onClick={() => setPhoneVisible(true)}
                >
                  <Phone size={30} />
                  {phoneVisible ? ad.user.phone : "08XX XXX XXX"}
                  {!phoneVisible && <span>(покажи)</span>}
                </button>
              )}
            </>
          )}

          {messageBoxOpen && !isOwnAd && (
            <form className="bazar-message-form" onSubmit={sendMessage}>
              <h3>
                <MessageCircle size={18} />
                Съобщение до продавача
              </h3>

              <textarea
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder="Здравейте, обявата още ли е актуална?"
                rows={5}
              />

              <button className="primary-button full" disabled={sending} type="submit">
                {sending ? "Изпращане..." : "Изпрати"}
              </button>
            </form>
          )}

          <div className="bazar-seller-card">
            <div className="bazar-seller-logo">
              {ad.user?.profile_image ? (
                <img src={getImageUrl(ad.user.profile_image)} alt={ad.user?.username} />
              ) : (
                <UserRound size={46} />
              )}
            </div>

            <div className="bazar-seller-content">
              <h3>{ad.user?.username}</h3>

              <p>
                В Bazar.BG от {formatDate(ad.user?.created_at)}
                <br />
                Последно активен днес
              </p>

              <div className="bazar-seller-separator" />

              <button type="button">43 обяви на потребителя</button>

              <div className="bazar-seller-separator" />

              <button type="button">
                <Heart size={25} />
                Следвай потребителя
              </button>
            </div>
          </div>

          {!isOwnAd && (
            <button className="bazar-report-link" type="button" onClick={openReportModal}>
              <Flag size={15} />
              Съобщи за нередност!
            </button>
          )}
        </aside>
      </section>

      {galleryOpen && activeImage && (
        <div className="gallery-modal">
          <button className="gallery-close" onClick={closeGallery} type="button">
            <X size={30} />
          </button>

          {images.length > 1 && (
            <button
              className="gallery-arrow gallery-arrow-left"
              onClick={showPreviousImage}
              type="button"
            >
              <ChevronLeft size={44} />
            </button>
          )}

          <div className="gallery-image-wrap">
            <img src={getImageUrl(activeImage.image_url)} alt={ad.title} />
          </div>

          {images.length > 1 && (
            <button
              className="gallery-arrow gallery-arrow-right"
              onClick={showNextImage}
              type="button"
            >
              <ChevronRight size={44} />
            </button>
          )}

          <div className="gallery-counter">
            {activeImageIndex + 1} / {images.length}
          </div>

          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  className={`gallery-thumb ${activeImageIndex === index ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={getImageUrl(image.image_url)} alt="Снимка към обява" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {reportOpen && (
        <div className="bazar-report-modal-backdrop">
          <form className="bazar-report-modal" onSubmit={sendReport}>
            <button className="bazar-report-close" type="button" onClick={closeReportModal}>
              <X size={22} />
            </button>

            <h2>Съобщи за нередност</h2>

            <p>
              Изпрати сигнал за обява №{ad.id}. Сигналът ще бъде записан в
              таблицата reports със статус pending.
            </p>

            <label>
              Причина
              <select
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
              >
                {REPORT_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Описание
              <textarea
                value={reportDescription}
                onChange={(event) => setReportDescription(event.target.value)}
                placeholder="Опиши накратко какъв е проблемът..."
                rows={5}
              />
            </label>

            <button className="primary-button full" disabled={reportSending} type="submit">
              {reportSending ? "Изпращане..." : "Изпрати сигнал"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}