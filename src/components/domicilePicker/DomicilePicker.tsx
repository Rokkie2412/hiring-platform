import React, { useEffect, useMemo, useRef, useState } from "react";

import { MOCK_DOMICILE } from "../../mockData";

import type { CustomSelectProps } from "./types";

const DomicilePicker: React.FC<Omit<CustomSelectProps, "options">> = ({
  label,
  required = false,
  placeholder = "Choose your domicile",
  value,
  onChange,
  name,
  error,
  touched,
}) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredDomicile = useMemo(() => {
    if (!searchTerm) return MOCK_DOMICILE;
    return MOCK_DOMICILE.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleSelect = (option: string) => {
    onChange(name, option);
    setSearchTerm(option);
    setIsOpen(false);
  };

  return (
    <span className="flex flex-col w-full text-black" ref={containerRef}>
      {label && (
        <label className="text-xs mb-2">
          {label}
          {required && <span className="text-red-700 text-xs ml-0.5">*</span>}
        </label>
      )}

      <div
        className={`relative flex items-center w-full border-2 rounded-lg px-4 py-2 bg-white transition-colors
          ${error && touched
            ? "border-red-500"
            : isOpen
              ? "border-teal-600"
              : "border-gray-300"
          }`}
      >
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="flex-1 text-sm outline-none text-black placeholder-gray-400 bg-transparent"
        />

        <svg
          className={`w-5 h-5 text-gray-600 ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>

        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-10">
            {filteredDomicile.length > 0 ? (
              filteredDomicile.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(item.name)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`px-4 py-3 cursor-pointer text-sm transition-colors ${hoveredIndex === index
                      ? "bg-gray-100"
                      : value === item.name
                        ? "bg-white border-white"
                        : "bg-white"
                    }`}
                >
                  <span className="text-gray-900 font-medium">{item.name}</span>
                </div>
              ))
            ) : (
                <div className="px-4 py-3 text-gray-500 text-sm text-center">
                  No results found
                </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
    </span>
  );
};

export default DomicilePicker;
