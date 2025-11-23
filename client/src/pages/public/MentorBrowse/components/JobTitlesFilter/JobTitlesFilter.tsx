import { useSearchStore } from "@/store/useSearchStore";
import { useEffect, useMemo } from "react";
import type { SearchBoxItem } from "../SearchBox/SearchBox";
import type { resultsJobTitles } from "@/types";
import SearchBox from "../SearchBox/SearchBox";
export default function JobTitlesFilter() {
  const { jobTitles, selectedJobTitles, keywordJobTitles, toggleJobTitle, resetJobSearch, searchJobTitles } =
    useSearchStore();
  useEffect(() => {
    void searchJobTitles("", 5);
  }, [searchJobTitles]);

  const handleSearch = (val: string) => {
    void searchJobTitles(val, 5);
  };

  const handleSelect = (item: SearchBoxItem) => {
    toggleJobTitle({
      id: Number(item.id),
      name: item.label,
      mentor_count: item.count ?? 0,
    });

    if (keywordJobTitles.length > 0) {
      resetJobSearch();
    }
  };

  const displayItems = useMemo(() => {
    let combinedList: resultsJobTitles[] = [...jobTitles];

    if (!keywordJobTitles || keywordJobTitles.trim() === "") {
      const missing = selectedJobTitles.filter((sel) => !jobTitles.some((s) => s.id === sel.id));
      combinedList = [...missing, ...jobTitles];
    }

    combinedList.sort((a, b) => {
      const isA = selectedJobTitles.some((s) => s.id === a.id);
      const isB = selectedJobTitles.some((s) => s.id === b.id);
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
  }, [jobTitles, selectedJobTitles, keywordJobTitles]);

  return (
    <SearchBox
      title='Job Titles'
      placeholder='Search job titles...'
      searchTerm={keywordJobTitles}
      items={displayItems}
      selectedIds={selectedJobTitles.map((s) => s.id)}
      onSearch={handleSearch}
      onSelect={handleSelect}
    />
  );
}
