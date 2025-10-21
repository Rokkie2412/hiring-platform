import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";

import { MOCK_COUNTRIES } from "../../mockData";

import type { Country, FormPhoneNumberProps } from "./types";

const FormPhoneNumber = ({
  label = "Phone number",
  required = false,
  value = "",
  onChange,
  placeholder = "81XXXXXXXXX",
  error,
}: FormPhoneNumberProps): ReactElement => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(
    MOCK_COUNTRIES[0]
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = useMemo(() => {
    if (!searchTerm) return MOCK_COUNTRIES;
    return MOCK_COUNTRIES.filter((country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
  };

  return (
    <span className="flex flex-col w-full text-black relative" ref={dropdownRef}>
      {label && (
        <label className="text-xs mb-2">
          {label}
          {required && <span className="text-red-700 text-xs ml-0.5">*</span>}
        </label>
      )}

      <div
        className={`flex items-center border-2 rounded-lg transition-colors ${error ? "border-red-500" : "border-gray-300 focus-within:border-teal-600"
          }`}
      >
        <div
          className="flex items-center gap-2 cursor-pointer px-4 py-2 border-r border-gray-200"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
        >
          <img
            src={selectedCountry.flag}
            alt={selectedCountry.name}
            width={16}
            height={16}
            className="rounded-full"
          />
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform ${isDropdownOpen ? "rotate-180" : ""
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        <span className="ml-3 text-sm text-gray-800">{selectedCountry.code}</span>
        <input
          type="tel"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className="flex-1 text-sm px-2 py-2 outline-none bg-transparent placeholder-gray-400"
        />
      </div>

      {isDropdownOpen && (
        <div className="absolute top-[70px] left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="w-full p-2 text-sm border rounded-md outline-none focus:border-yellow-400"
            />
          </div>

          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <div
                key={country.code}
                onClick={() => handleSelectCountry(country)}
                className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={country.flag}
                    alt={country.name}
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                  <span className="text-gray-800 text-sm">{country.name}</span>
                </div>
                <span className="text-sm text-gray-600">{country.code}</span>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-sm text-gray-500">
              No results found
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
    </span>
  );
};

export default FormPhoneNumber;
