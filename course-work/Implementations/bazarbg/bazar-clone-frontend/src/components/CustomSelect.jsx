import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

function normalizeText(value) {
  return value.toLowerCase().trim();
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Избери",
  searchable = false,
  searchPlaceholder = "Търси"
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  const selectedOption = options.find((option) => String(option.value) === String(value));

  const filteredOptions = useMemo(() => {
    const query = normalizeText(search);

    if (!query) {
      return options;
    }

    return options.filter((option) => {
      return (
        normalizeText(option.label).includes(query) ||
        normalizeText(option.description || "").includes(query)
      );
    });
  }, [options, search]);

  function selectOption(optionValue) {
    onChange(String(optionValue));
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
    <div className="custom-select" ref={wrapperRef}>
      <button
        type="button"
        className={`custom-select-trigger ${open ? "open" : ""} ${!selectedOption ? "empty" : ""}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown size={20} />
      </button>

      {open && (
        <div className="custom-select-popover">
          {searchable && (
            <div className="custom-select-search">
              <Search size={18} />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
              />
            </div>
          )}

          <div className="custom-select-list">
            {filteredOptions.length === 0 && (
              <div className="custom-select-empty">Няма намерен резултат.</div>
            )}

            {filteredOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`custom-select-option ${
                  String(value) === String(option.value) ? "selected" : ""
                }`}
                onClick={() => selectOption(option.value)}
              >
                <span>
                  <strong>{option.label}</strong>
                  {option.description && <small>{option.description}</small>}
                </span>

                {String(value) === String(option.value) && <Check size={18} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
