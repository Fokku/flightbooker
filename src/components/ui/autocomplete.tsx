import { useState, useEffect, useRef } from "react";
import { Input } from "./input";

interface AutocompleteProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  className?: string;
}

export function Autocomplete({
  options,
  value,
  onChange,
  placeholder,
  name,
  className,
}: AutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Filter options based on input value
    if (value) {
      const filtered = options
        .filter((option) => option.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 10); // Limit to 10 suggestions
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions([]);
    }
  }, [value, options]);

  useEffect(() => {
    // Handle click outside to close suggestions
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (option: string) => {
    onChange(option);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full" ref={suggestionsRef}>
      <Input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        name={name}
        className={className}
        autoComplete="off"
      />
      {showSuggestions && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full bg-white mt-1 rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200">
          <ul className="py-1">
            {filteredOptions.map((option, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-sky-50 cursor-pointer text-sm"
                onClick={() => handleSuggestionClick(option)}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
