import { useSearchStore } from "@/store/useSearchStore";
import { useEffect, useMemo } from "react";
import type { SearchBoxItem } from "../SearchBox/SearchBox";
import type { resultsCompanies } from "@/types";
import SearchBox from "../SearchBox/SearchBox";
export default function CompaniesFilter() {
  const { companies, selectedCompanies, keywordCompanies, toggleCompany, resetCompanySearch, searchCompanies } =
    useSearchStore();
  useEffect(() => {
    void searchCompanies("", 5);
  }, [searchCompanies]);

  const handleSearch = (val: string) => {
    void searchCompanies(val, 5);
  };

  const handleSelect = (item: SearchBoxItem) => {
    toggleCompany({
      id: Number(item.id),
      name: item.label,
      mentor_count: item.count ?? 0,
    });

    if (keywordCompanies.length > 0) {
      resetCompanySearch();
    }
  };

  const displayItems = useMemo(() => {
    let combinedList: resultsCompanies[] = [...companies];

    if (!keywordCompanies || keywordCompanies.trim() === "") {
      const missing = selectedCompanies.filter((sel) => !companies.some((s) => s.id === sel.id));
      combinedList = [...missing, ...companies];
    }

    combinedList.sort((a, b) => {
      const isA = selectedCompanies.some((s) => s.id === a.id);
      const isB = selectedCompanies.some((s) => s.id === b.id);
      if (isA && !isB) return -1;
      if (!isA && isB) return 1;
      return 0;
    });

    const uniqueItems = new Map();
    combinedList.forEach((item) => {
      if (!uniqueItems.has(item.id)) {
        uniqueItems.set(item.id, {
          id: item.id,
          label: item.name,
          count: item.mentor_count,
        });
      }
    });

    return Array.from(uniqueItems.values()) as SearchBoxItem[];
  }, [companies, selectedCompanies, keywordCompanies]);

  return (
    <SearchBox
      title='Companies'
      placeholder='Search for Company...'
      searchTerm={keywordCompanies}
      items={displayItems}
      selectedIds={selectedCompanies.map((s) => s.id)}
      onSearch={handleSearch}
      onSelect={handleSelect}
    />
  );
}
