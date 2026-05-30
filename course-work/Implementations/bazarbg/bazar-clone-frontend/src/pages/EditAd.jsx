import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest, getImageUrl, getStoredUser } from "../api";
import CategorySelect from "../components/CategorySelect";
import CustomSelect from "../components/CustomSelect";

const CONDITION_OPTIONS = [
  {
    value: "new",
    label: "Ново",
    description: "Неразопаковано или без следи от употреба"
  },
  {
    value: "used",
    label: "Използвано",
    description: "Запазено, но вече употребявано"
  },
  {
    value: "for_parts",
    label: "За части",
    description: "Подходящо за ремонт или резервни части"
  },
  {
    value: "not_specified",
    label: "Не е посочено",
    description: "Без конкретно състояние"
  }
];

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "Активна",
    description: "Обявата се вижда публично"
  },
  {
    value: "sold",
    label: "Продадена",
    description: "Обявата остава маркирана като приключена"
  },
  {
    value: "expired",
    label: "Изтекла",
    description: "Обявата вече не е активна"
  }
];

export default function EditAd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    category_id: "",
    location_id: "",
    title: "",
    description: "",
    price: "",
    currency: "BGN",
    is_negotiable: false,
    item_condition: "used",
    address_area: "",
    phone_visible: true,
    status: "active"
  });

  const locationOptions = locations.map((location) => ({
    value: location.id,
    label: location.city,
    description: location.region
  }));

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function loadCategories() {
    const data = await apiRequest("/categories");
    setCategories(data);
  }

  async function loadLocations() {
    const data = await apiRequest("/locations/");
    setLocations(data);
  }

  async function loadAd() {
    const ad = await apiRequest(`/ads/${id}`);

    if (ad.user?.id !== user?.id) {
      throw new Error("Можеш да редактираш само свои обяви.");
    }

    setExistingImages(ad.images || []);

    setForm({
      category_id: ad.category?.id || "",
      location_id: ad.location?.id || "",
      title: ad.title || "",
      description: ad.description || "",
      price: ad.price === null || ad.price === undefined ? "" : String(ad.price),
      currency: ad.currency || "BGN",
      is_negotiable: Boolean(ad.is_negotiable),
      item_condition: ad.item_condition || "not_specified",
      address_area: ad.address_area || "",
      phone_visible: Boolean(ad.phone_visible),
      status: ad.status || "active"
    });
  }

  async function loadInitialData() {
    try {
      setLoadingPage(true);
      setError("");

      await Promise.all([
        loadCategories(),
        loadLocations(),
        loadAd()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPage(false);
    }
  }

  function handleNewImagesChange(event) {
    const files = Array.from(event.target.files || []);

    if (existingImages.length + files.length > 10) {
      alert("Можеш да имаш максимум 10 снимки към една обява.");
      return;
    }

    setNewImages(files);
  }

  function removeNewImage(index) {
    setNewImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  async function deleteExistingImage(imageId) {
    const confirmed = window.confirm("Сигурен ли си, че искаш да изтриеш тази снимка?");

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/ads/${id}/images/${imageId}`, {
        method: "DELETE"
      });

      setExistingImages((current) => current.filter((image) => image.id !== imageId));
    } catch (err) {
      alert(err.message);
    }
  }

  async function uploadNewImages() {
    if (newImages.length === 0) {
      return;
    }

    const formData = new FormData();

    newImages.forEach((file) => {
      formData.append("files", file);
    });

    await apiRequest(`/ads/${id}/images`, {
      method: "POST",
      body: formData
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.category_id) {
      setError("Избери категория.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        category_id: Number(form.category_id),
        location_id: form.location_id ? Number(form.location_id) : null,
        title: form.title,
        description: form.description,
        price: form.price === "" ? null : Number(form.price),
        currency: form.currency,
        is_negotiable: Boolean(form.is_negotiable),
        item_condition: form.item_condition,
        address_area: form.address_area,
        phone_visible: Boolean(form.phone_visible),
        status: form.status
      };

      const updatedAd = await apiRequest(`/ads/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      await uploadNewImages();

      navigate(`/ads/${updatedAd.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, [id]);

  if (loadingPage) {
    return <div className="state-box">Зареждане на обявата...</div>;
  }

  return (
    <section className="form-page">
      <div className="form-card">
        <span className="eyebrow">Редакция</span>
        <h1>Редактирай обява</h1>
        <p>Можеш да променяш данните и да добавяш/премахваш снимки.</p>

        {error && <div className="error-box">{error}</div>}

        {error !== "Можеш да редактираш само свои обяви." && (
          <form className="form-stack" onSubmit={handleSubmit}>
            <label>
              Заглавие
              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Например: iPhone 13 128GB"
                required
              />
            </label>

            <label>
              Описание
              <textarea
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Опиши състояние, характеристики, забележки..."
                rows={6}
                required
              />
            </label>

            <div className="two-cols">
              <label>
                Категория
                <CategorySelect
                  categories={categories}
                  value={form.category_id}
                  onChange={(categoryId) => updateField("category_id", categoryId)}
                />
              </label>

              <label>
                Град
                <CustomSelect
                  value={form.location_id}
                  onChange={(locationId) => updateField("location_id", locationId)}
                  options={locationOptions}
                  placeholder="Без избран град"
                  searchable
                  searchPlaceholder="Търси град"
                />
              </label>
            </div>

            <div className="two-cols">
              <label>
                Цена
                <input
                  type="number"
                  value={form.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  placeholder="0.00"
                />
              </label>

              <label>
                Състояние
                <CustomSelect
                  value={form.item_condition}
                  onChange={(condition) => updateField("item_condition", condition)}
                  options={CONDITION_OPTIONS}
                  placeholder="Избери състояние"
                />
              </label>
            </div>

            <div className="two-cols">
              <label>
                Квартал / район
                <input
                  value={form.address_area}
                  onChange={(event) => updateField("address_area", event.target.value)}
                  placeholder="Например: Люлин, Център, Тракия..."
                />
              </label>

              <label>
                Статус
                <CustomSelect
                  value={form.status}
                  onChange={(status) => updateField("status", status)}
                  options={STATUS_OPTIONS}
                  placeholder="Избери статус"
                />
              </label>
            </div>

            <div className="images-manager">
              <h3>Снимки към обявата</h3>

              {existingImages.length > 0 ? (
                <div className="image-preview-grid">
                  {existingImages.map((image) => (
                    <div key={image.id} className="image-preview-item">
                      <img src={getImageUrl(image.image_url)} alt="Снимка към обява" />

                      <button
                        type="button"
                        className="remove-image-button"
                        onClick={() => deleteExistingImage(image.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="state-box">Тази обява все още няма снимки.</div>
              )}

              <label>
                Добави нови снимки
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  multiple
                  onChange={handleNewImagesChange}
                />
              </label>

              {newImages.length > 0 && (
                <div className="image-preview-grid">
                  {newImages.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="image-preview-item">
                      <img src={URL.createObjectURL(file)} alt={file.name} />

                      <button
                        type="button"
                        className="remove-image-button"
                        onClick={() => removeNewImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={form.is_negotiable}
                  onChange={(event) => updateField("is_negotiable", event.target.checked)}
                />
                Цената подлежи на договаряне
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={form.phone_visible}
                  onChange={(event) => updateField("phone_visible", event.target.checked)}
                />
                Покажи телефона
              </label>
            </div>

            <div className="two-cols">
              <button type="button" className="ghost-button full" onClick={() => navigate("/my-ads")}>
                Отказ
              </button>

              <button className="primary-button full" disabled={saving}>
                {saving ? "Запазване..." : "Запази промените"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
