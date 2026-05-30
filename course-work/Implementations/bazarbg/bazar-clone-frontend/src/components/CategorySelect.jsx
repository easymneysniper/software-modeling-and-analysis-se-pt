import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

function normalizeText(value) {
  return value.toLowerCase().trim();
}

export default function CategorySelect({
  categories,
  value,
  onChange,
  placeholder = "Избери категория"
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  const selectedCategory = categories.find((category) => String(category.id) === String(value));

  const categoryGroups = useMemo(() => {
    const mainCategories = categories
      .filter((category) => !category.parent_id)
      .sort((first, second) => {
        return (first.sort_order ?? 0) - (second.sort_order ?? 0) || first.name.localeCompare(second.name);
      });

    return mainCategories.map((category) => {
      const children = categories
        .filter((child) => child.parent_id === category.id)
        .sort((first, second) => {
          return (first.sort_order ?? 0) - (second.sort_order ?? 0) || first.name.localeCompare(second.name);
        });

      return {
        category,
        children
      };
    });
  }, [categories]);

  const filteredGroups = useMemo(() => {
    const query = normalizeText(search);

    if (!query) {
      return categoryGroups;
    }

    return categoryGroups
      .map((group) => {
        const mainMatches = normalizeText(group.category.name).includes(query);
        const children = mainMatches
          ? group.children
          : group.children.filter((child) => normalizeText(child.name).includes(query));

        if (!mainMatches && children.length === 0) {
          return null;
        }

        return {
          ...group,
          children,
          mainMatches
        };
      })
      .filter(Boolean);
  }, [categoryGroups, search]);

  function selectCategory(categoryId) {
    onChange(String(categoryId));
    setOpen(false);
    setSearch("");
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="category-select" ref={wrapperRef}>
      <button
        type="button"
        className={`category-select-trigger ${open ? "open" : ""} ${!selectedCategory ? "empty" : ""}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selectedCategory?.name || placeholder}</span>
        <ChevronDown size={20} />
      </button>

      {open && (
        <div className="category-select-popover">
          <div className="category-select-search">
            <Search size={18} />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Търси категория"
            />
          </div>

          <div className="category-select-list">
            {filteredGroups.length === 0 && (
              <div className="category-select-empty">Няма намерена категория.</div>
            )}

            {filteredGroups.map((group) => (
              <div className="category-select-group" key={group.category.id}>
                <button
                  type="button"
                  className={`category-select-option main-option ${
                    String(value) === String(group.category.id) ? "selected" : ""
                  }`}
                  onClick={() => selectCategory(group.category.id)}
                >
                  <span>
                    <strong>{group.category.name}</strong>
                    <small>Основна категория</small>
                  </span>

                  {String(value) === String(group.category.id) && <Check size={18} />}
                </button>

                {group.children.map((child) => (
                  <button
                    type="button"
                    className={`category-select-option child-option ${
                      String(value) === String(child.id) ? "selected" : ""
                    }`}
                    key={child.id}
                    onClick={() => selectCategory(child.id)}
                  >
                    <span>
                      <strong>{child.name}</strong>
                      <small>{group.category.name}</small>
                    </span>

                    {String(value) === String(child.id) && <Check size={18} />}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
