import { useState, useEffect } from 'react';

interface AutoCompleteInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  storageKey: string;
  disabled?: boolean;
}

export function AutoCompleteInput({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  storageKey,
  disabled = false 
}: AutoCompleteInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Load previous entries from localStorage
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSuggestions(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setSuggestions([]);
      }
    }
  }, [storageKey]);

  const saveToPrevious = (newValue: string) => {
    if (!newValue.trim()) return;
    
    const updated = [newValue, ...suggestions.filter(s => s !== newValue)].slice(0, 5);
    setSuggestions(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleInputFocus = () => {
    setShowSuggestions(suggestions.length > 0);
  };

  const handleInputBlur = () => {
    // Delay hiding to allow click on suggestions
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      saveToPrevious(value.trim());
    }
  };

  return (
    <div className="autocomplete-container">
      <label className="input-label">{label}</label>
      <div className="input-wrapper">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="autocomplete-input"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
