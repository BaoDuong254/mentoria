import { useSearchStore } from "@/store/useSearchStore";
import { useEffect, useMemo } from "react";
import SearchBox from "../SearchBox";
import type { SearchBoxItem } from "../SearchBox/SearchBox";
import type { resultsSkills } from "@/types";

export default function SkillsFilter() {
  const { skills, isLoading, selectedSkills, keywordSkills, toggleSkill, resetSkillSearch, searchSkills } =
    useSearchStore();
  useEffect(() => {
    void searchSkills("", 5);
  }, [searchSkills]);

  const handleSearch = (keyword: string) => {
    void searchSkills(keyword, 5);
  };

  const handleSelect = (item: SearchBoxItem) => {
    toggleSkill({
      id: Number(item.id),
      name: item.label,
      type: "skill",
      super_category_id: null,
      mentor_count: item.count ?? 0,
    });

    if (keywordSkills.length > 0) {
      resetSkillSearch();
    }
  };
  const displayItems = useMemo(() => {
    let combinedList: resultsSkills[] = [...skills];

    if (!keywordSkills || keywordSkills.trim() === "") {
      const missingSelectedItems = selectedSkills.filter((selected) => !skills.some((s) => s.id === selected.id));
      combinedList = [...missingSelectedItems, ...skills];
    }

    combinedList.sort((a, b) => {
      const isASelected = selectedSkills.some((s) => s.id === a.id);
      const isBSelected = selectedSkills.some((s) => s.id === b.id);

      if (isASelected && !isBSelected) return -1;
      if (!isASelected && isBSelected) return 1;
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
  }, [skills, selectedSkills, keywordSkills]);
  return (
    <SearchBox
      title='Skills'
      placeholder='Search for skills...'
      searchTerm={keywordSkills}
      items={displayItems}
      isLoading={isLoading}
      selectedIds={selectedSkills.map((s) => s.id)}
      onSearch={handleSearch}
      onSelect={handleSelect}
    />
  );
}
