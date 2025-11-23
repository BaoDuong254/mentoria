import { create } from "zustand";
import { persist } from "zustand/middleware";
import { searchSkills } from "@/apis/search.mentorbrowse.api";
import type { SearchMentorState, resultsSkills } from "@/types";

const DEFAULT_SKILLS: resultsSkills[] = [
  { id: 101, name: "Python", type: "skill", super_category_id: null, mentor_count: 120 },
  { id: 102, name: "React", type: "skill", super_category_id: null, mentor_count: 402 },
  { id: 103, name: "Java", type: "skill", super_category_id: null, mentor_count: 202 },
  { id: 104, name: "JavaScript", type: "skill", super_category_id: null, mentor_count: 350 },
  { id: 105, name: "GoLang", type: "skill", super_category_id: null, mentor_count: 80 },
];

export const useSearchStore = create<SearchMentorState>()(
  persist(
    (set, get) => ({
      //initial state
      skills: [],
      selectedSkills: [],
      keywordSkills: "",
      isLoading: false,

      searchSkills: async (keywordInput, limit) => {
        set({ keywordSkills: keywordInput });
        if (!keywordInput || keywordInput.trim() === "") {
          // Không gọi API, lấy luôn dữ liệu mặc định đắp vào
          set({ skills: DEFAULT_SKILLS, isLoading: false });
          return; // Kết thúc hàm luôn
        }
        set({ isLoading: true });
        try {
          const res = await searchSkills(keywordInput, limit);
          if (!res.success) {
            throw new Error(res.message);
          }
          set({ skills: res.data?.results ?? [] });
        } catch (error) {
          console.log("Search skills error: ", error);
          set({ skills: [] });
        } finally {
          set({ isLoading: false });
        }
      },

      toggleSkill: (skill) => {
        const { selectedSkills } = get();
        const isExist = selectedSkills.find((s) => s.id === skill.id);

        if (isExist) {
          set({ selectedSkills: selectedSkills.filter((s) => s.id !== skill.id) });
        } else {
          set({ selectedSkills: [...selectedSkills, skill] });
        }
      },

      resetSearch: () => {
        set({ keywordSkills: "", skills: DEFAULT_SKILLS, isLoading: false });
      },
    }),
    {
      name: "search-storage",
      partialize: (state) => ({ skills: state.skills, isLoading: false, searchSkills: state.searchSkills }),
    }
  )
);
