import { useSearchStore } from "@/store/useSearchStore";
import { useEffect } from "react";
import SearchBox from "../SearchBox";
import type { SearchBoxItem } from "../SearchBox/SearchBox";

export default function SkillsFilter() {
  const { skills, isLoading, searchSkills } = useSearchStore();
  useEffect(() => {
    void searchSkills("", 5);
  }, [searchSkills]);

  const handleSearch = (keyword: string) => {
    void searchSkills(keyword, 5);
  };
  const formattedItems: SearchBoxItem[] = skills.map((skill) => ({
    id: skill.id,
    label: skill.name,
    count: skill.mentor_count,
  }));
  return (
    <SearchBox
      title='Skills'
      placeholder='Search for skills...'
      items={formattedItems}
      isLoading={isLoading}
      onSearch={handleSearch}
    />
  );
}
