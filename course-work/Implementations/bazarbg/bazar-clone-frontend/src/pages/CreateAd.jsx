import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
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

export default function CreateAd() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

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

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const locationOptions = locations.map((location) => ({
    value: location.id,
    label: location.city,
    description: location.region
  }));

  async function loadCategories() {
    const data = await apiRequest("/categories");
    setCategories(data);
  }

  async function loadLocations() {
    const data = await apiRequest("/locations/");
    setLocations(data);

    setForm((current) => ({
      ...current,
      location_id: current.location_id || data[0]?.id || ""
    }));
  }

  async function loadInitialData() {
    try {
      setError("");

      await Promise.all([
        loadCategories(),
        loadLocations()
      ]);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleImagesChange(event) {
    const files = Array.from(event.target.files || []);

    if (files.length > 10) {
      alert("Можеш да качиш максимум 10 снимки.");
      return;
    }

    setSelectedImages(files);
  }

  function removeSelectedImage(index) {
    setSelectedImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  async function uploadImages(adId) {
    if (selectedImages.length === 0) {
      return;
    }

    const formData = new FormData();

    selectedImages.forEach((file) => {
      formData.append("files", file);
    });

    await apiRequest(`/ads/${adId}/images`, {
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
      setLoading(true);
      setError("");

      const payload = {
        ...form,
        category_id: Number(form.category_id),
        location_id: form.location_id ? Number(form.location_id) : null,
        price: form.price === "" ? null : Number(form.price)
      };

      const createdAd = await apiRequest("/ads/", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      await uploadImages(createdAd.id);

      navigate(`/ads/${createdAd.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="form-page">
      <div className="form-card">
        <span className="eyebrow">Нова обява</span>
        <h1>Публикувай обява</h1>
        <p>Добави информация за обявата и качи до 10 снимки.</p>

        {error && <div className="error-box">{error}</div>}

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
                placeholder="Избери град"
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

          <label>
            Квартал / район
            <input
              value={form.address_area}
              onChange={(event) => updateField("address_area", event.target.value)}
              placeholder="Например: Люлин, Център, Тракия..."
            />
          </label>

          <label>
            Снимки към обявата
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              multiple
              onChange={handleImagesChange}
            />
          </label>

          {selectedImages.length > 0 && (
            <div className="image-preview-grid">
              {selectedImages.map((file, index) => (
                <div key={`${file.name}-${index}`} className="image-preview-item">
                  <img src={URL.createObjectURL(file)} alt={file.name} />

                  <button
                    type="button"
                    className="remove-image-button"
                    onClick={() => removeSelectedImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

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

          <button className="primary-button full" disabled={loading}>
            {loading ? "Публикуване..." : "Публикувай обява"}
          </button>
        </form>
      </div>
    </section>
  );
}
