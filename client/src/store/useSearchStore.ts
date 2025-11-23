import { create } from "zustand";
import { persist } from "zustand/middleware";
import { searchSkills, searchJobTitles, searchCompanies } from "@/apis/search.mentorbrowse.api";
import type { SearchMentorState, resultsSkills, resultsJobTitles, resultsCompanies } from "@/types";

const DEFAULT_SKILLS: resultsSkills[] = [
  { id: 101, name: "Python", type: "skill", super_category_id: null, mentor_count: 120 },
  { id: 102, name: "React", type: "skill", super_category_id: null, mentor_count: 402 },
  { id: 103, name: "Java", type: "skill", super_category_id: null, mentor_count: 202 },
  { id: 104, name: "JavaScript", type: "skill", super_category_id: null, mentor_count: 350 },
  { id: 105, name: "GoLang", type: "skill", super_category_id: null, mentor_count: 80 },
];

const DEFAULT_JOBS: resultsJobTitles[] = [
  { id: 201, name: "Senior Software Engineer", mentor_count: 50 },
  { id: 202, name: "Product Manager", mentor_count: 30 },
  { id: 203, name: "Data Scientist", mentor_count: 40 },
];

const DEFAULT_COMPANIES: resultsCompanies[] = [
  { id: 301, name: "Google", mentor_count: 120 },
  { id: 302, name: "Microsoft", mentor_count: 90 },
  { id: 303, name: "Amazon", mentor_count: 85 },
];
export const useSearchStore = create<SearchMentorState>()(
  persist(
    (set, get) => ({
      //initial state
      skills: [],
      selectedSkills: [],
      keywordSkills: "",
      isLoading: false,

      jobTitles: [],
      selectedJobTitles: [],
      keywordJobTitles: "",

      companies: [],
      selectedCompanies: [],
      keywordCompanies: "",

      //----------------ACTION SKILLS-------------------
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

      resetSkillSearch: () => {
        set({ keywordSkills: "", skills: DEFAULT_SKILLS, isLoading: false });
      },

      //----------------ACTION JOB TITLES-------------------
      searchJobTitles: async (keywordInput, limit) => {
        set({ keywordJobTitles: keywordInput });
        if (!keywordInput || keywordInput.trim() === "") {
          set({ jobTitles: DEFAULT_JOBS });
          return;
        }

        try {
          const res = await searchJobTitles(keywordInput, limit);
          if (!res.success) {
            throw new Error(res.message);
          }
          set({ jobTitles: res.data?.results ?? [] });
        } catch (error) {
          console.log("Search Job Titles error: ", error);
          set({ skills: [] });
        }
      },

      toggleJobTitle: (job) => {
        const { selectedJobTitles } = get();
        const isExist = selectedJobTitles.find((j) => j.id === job.id);
        if (isExist) {
          set({ selectedJobTitles: selectedJobTitles.filter((j) => j.id !== job.id) });
        } else {
          set({ selectedJobTitles: [...selectedJobTitles, job] });
        }
      },

      resetJobSearch: () => set({ keywordJobTitles: "", jobTitles: DEFAULT_JOBS }),

      //----------------ACTION COMPANIES-------------------
      searchCompanies: async (keywordInput, limit) => {
        set({ keywordCompanies: keywordInput });
        if (!keywordInput || keywordInput.trim() === "") {
          set({ companies: DEFAULT_COMPANIES });
          return;
        }

        try {
          const res = await searchCompanies(keywordInput, limit);
          if (!res.success) {
            throw new Error(res.message);
          }
          set({ companies: res.data?.results ?? [] });
        } catch (error) {
          console.log("Search Companies error: ", error);
          set({ skills: [] });
        }
      },

      toggleCompany: (company) => {
        const { selectedCompanies } = get();
        const isExist = selectedCompanies.find((c) => c.id === company.id);
        if (isExist) {
          set({ selectedCompanies: selectedCompanies.filter((c) => c.id !== company.id) });
        } else {
          set({ selectedCompanies: [...selectedCompanies, company] });
        }
      },

      resetCompanySearch: () => set({ keywordCompanies: "", companies: DEFAULT_JOBS }),
    }),
    {
      name: "search-storage",
      partialize: (state) => ({
        skills: state.skills,
        selectedSkills: state.selectedSkills,
        keywordSkills: state.keywordSkills,
        jobTitles: state.jobTitles,
        selectedJobTitles: state.selectedJobTitles,
        keywordJobTitles: state.keywordJobTitles,
        companies: state.companies,
        selectedCompanies: state.selectedCompanies,
        keywordCompanies: state.keywordCompanies,
      }),
    }
  )
);
