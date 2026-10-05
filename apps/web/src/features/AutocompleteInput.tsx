import { useState } from "react";
import { type Area } from "@xe/shared";
import { fetchAreas } from "../api/areas";
import { useQuery } from "@tanstack/react-query";
import FadeBanner from "../components/FadeBanner";
import DropDownItem from "../components/DropDownItem";
import InputContainer from "../components/InputContainer";

const AutocompleteInput = ({
  onChange,
  onSelect,
  searchTerm,
  error,
  errorText,
}: AutocompleteInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const {
    data,
    isFetching,
    isError,
    error: apiError,
  } = useQuery({
    queryKey: ["places", searchTerm],
    enabled: searchTerm.trim().length > 2,
    retry: false,
    queryFn: ({ signal }) => fetchAreas({ searchTerm, signal }),
  });

  const places = data?.places ?? [];
  const showDropdown = isOpen && searchTerm.trim().length >= 3;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const selectArea = (area: Area) => {
    onSelect(area);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || places.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % places.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? places.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectArea(places[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <InputContainer type="area" label="Area*">
      <div style={{ position: "relative" }}>
        <input
          className="input"
          id="area"
          type="text"
          autoComplete="off"
          value={searchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="area-listbox"
          style={{ width: "100%", boxSizing: "border-box" }}
        />
        {error && <span className="errorText">{errorText}</span>}
        {showDropdown && (
          <ul id="area-listbox" role="listbox" className="dropdown">
            {isFetching ? (
              <li className="dropdownStateItem">Loading…</li>
            ) : places.length === 0 ? (
              <li className="dropdownStateItem">No results</li>
            ) : (
              places.map((item: Area, index: number) => (
                <DropDownItem
                  key={item.placeId}
                  item={item}
                  index={index}
                  activeIndex={activeIndex}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectArea(item);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                />
              ))
            )}
          </ul>
        )}
      </div>
      {isError && (
        <FadeBanner
          message={
            apiError.message || "Error fetching places. Please try again."
          }
          state={"fail"}
        />
      )}
    </InputContainer>
  );
};

export default AutocompleteInput;

interface AutocompleteInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (area: Area) => void;
  searchTerm: string;
  error: boolean;
  errorText?: string;
}
