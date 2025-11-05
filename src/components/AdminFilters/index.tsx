import { ChangeEventHandler, FormEventHandler } from "react";
import { FaFilter, FaXmark } from "react-icons/fa6";
import SearchBar from "../SearchBar";
import Select from "../Select";
import "./styles.scss";

export type FilterOption = {
  value: string | number;
  label: string;
};

export type AdminFiltersProps = {
  searchValue: string;
  onSearchChange: ChangeEventHandler<HTMLInputElement>;
  onSearchSubmit: FormEventHandler<HTMLFormElement>;
  searchPlaceholder?: string;
  sortOptions?: FilterOption[];
  sortValue?: string | number;
  onSortChange?: ChangeEventHandler<HTMLSelectElement>;
  filterOptions?: {
    label: string;
    options: FilterOption[];
    value: string | number;
    onChange: ChangeEventHandler<HTMLSelectElement>;
  }[];
  onClearFilters?: () => void;
};

export default function AdminFilters({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder,
  sortOptions,
  sortValue,
  onSortChange,
  filterOptions,
  onClearFilters,
}: AdminFiltersProps) {
  const hasFilters = filterOptions && filterOptions.length > 0;
  const hasSort = sortOptions && sortOptions.length > 0;

  return (
    <div className="admin-filters">
      <div className="filters-row">
        <div className="search-section">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
            placeholder={searchPlaceholder}
          />
        </div>

        {(hasSort || hasFilters) && (
          <div className="filters-section">
            {hasSort && onSortChange && (
              <div className="filter-group">
                <label htmlFor="sort-select">
                  <FaFilter /> Ordenar
                </label>
                <Select
                  className="filter-select"
                  value={sortValue || ""}
                  onChange={onSortChange}
                  options={sortOptions.map((opt) => ({
                    value: opt.value,
                    content: opt.label,
                  }))}
                  disabled={false}
                />
              </div>
            )}

            {hasFilters &&
              filterOptions?.map((filter, index) => (
                <div key={index} className="filter-group">
                  <label htmlFor={`filter-${index}`}>{filter.label}</label>
                  <Select
                    className="filter-select"
                    value={filter.value}
                    onChange={filter.onChange}
                    options={filter.options.map((opt) => ({
                      value: opt.value,
                      content: opt.label,
                    }))}
                    disabled={false}
                  />
                </div>
              ))}

            {onClearFilters && (
              <button onClick={onClearFilters} className="clear-filters-button">
                <FaXmark /> Limpar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
