import { create } from "zustand";
import { persist } from "zustand/middleware";
import { searchSkills, searchJobTitles, searchCompanies } from "@/apis/search.mentorbrowse.api";
import type { SearchMentorState } from "@/types";
import { getMentor } from "@/apis/mentor.api";
import { getCompaniesList, getJobTitlesList, getSkillsList } from "@/apis/catalog.api";
import { getFilteredMentors } from "@/apis/filter.api";

export const useSearchStore = create<SearchMentorState>()(
  persist(
    (set, get) => ({
      //initial state
      skills: [],
      selectedSkills: [],
      keywordSkills: "",
      isLoading: false,
      defaultSkills: [],

      jobTitles: [],
      selectedJobTitles: [],
      keywordJobTitles: "",
      defaultJobTitles: [],

      companies: [],
      selectedCompanies: [],
      keywordCompanies: "",
      defaultCompanies: [],

      mentors: [],
      pageMentor: null,
      isFetchingMentors: false,

      selectedMentor: null,
      isLoadingProfile: false,

      //----------------ACTION SKILLS-------------------
      searchSkills: async (keywordInput, limit) => {
        set({ keywordSkills: keywordInput });
        if (!keywordInput || keywordInput.trim() === "") {
          // Không gọi API, lấy luôn dữ liệu mặc định đắp vào
          set({ skills: get().defaultSkills, isLoading: false });
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
        set({ keywordSkills: "", skills: get().defaultSkills, isLoading: false });
      },

      //----------------ACTION JOB TITLES-------------------
      searchJobTitles: async (keywordInput, limit) => {
        set({ keywordJobTitles: keywordInput });
        if (!keywordInput || keywordInput.trim() === "") {
          set({ jobTitles: get().defaultJobTitles });
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

      resetJobSearch: () => set({ keywordJobTitles: "", jobTitles: get().defaultJobTitles }),

      //----------------ACTION COMPANIES-------------------
      searchCompanies: async (keywordInput, limit) => {
        set({ keywordCompanies: keywordInput });
        if (!keywordInput || keywordInput.trim() === "") {
          set({ companies: get().defaultCompanies });
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

      resetCompanySearch: () => set({ keywordCompanies: "", companies: get().defaultCompanies }),

      //-----------------MENTOR------------------------------
      fetchMentors: async (page = 1, limit = 10) => {
        set({ isFetchingMentors: true });
        const { selectedSkills, selectedJobTitles, selectedCompanies } = get();

        const skillIds = selectedSkills.map((s) => s.id).join(",");
        const jobTitleIds = selectedJobTitles.map((j) => j.id).join(",");
        const companyIds = selectedCompanies.map((c) => c.id).join(",");

        try {
          const res = await getFilteredMentors(
            page,
            limit,
            skillIds.length > 0 ? skillIds : undefined,
            jobTitleIds.length > 0 ? jobTitleIds : undefined,
            companyIds.length > 0 ? companyIds : undefined
          );

          if (res.success) {
            set({
              mentors: res.data?.mentors,
              pageMentor: res.data?.pagination,
            });
          }
        } catch (error) {
          console.error("Failed to fetch mentors", error);
          set({ mentors: [] });
        } finally {
          set({ isFetchingMentors: false });
        }
      },

      fetchMentorById: async (id) => {
        set({ isLoadingProfile: true });
        try {
          const res = await getMentor(id);

          if (res.success) {
            set({
              selectedMentor: res.data,
            });
          }
        } catch (error) {
          console.log("Failed to fetch mentor by id", error);
        } finally {
          set({ isLoadingProfile: false });
        }
      },

      fetchInitialFilterData: async () => {
        const { defaultSkills, defaultJobTitles, defaultCompanies } = get();
        if (defaultSkills.length > 0 && defaultJobTitles.length > 0 && defaultCompanies.length > 0) {
          return;
        }

        set({ isLoading: true });
        try {
          const resSkills = await getSkillsList(1, 5);
          const resJobTitles = await getJobTitlesList(1, 5);
          const resCompanies = await getCompaniesList(1, 5);

          const rawSkills = resSkills.success ? (resSkills.data?.skills ?? []) : [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedSkills = rawSkills.map((item: any) => ({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            id: item.skill_id ?? item.id,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            name: item.skill_name ?? item.name,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            mentor_count: item.mentor_count,
            type: "skill",
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            super_category_id: item.super_category_id,
          }));

          const rawJobTitles = resJobTitles.success ? (resJobTitles.data?.jobTitles ?? []) : [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedJobTitles = rawJobTitles.map((item: any) => ({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            id: item.job_title_id ?? item.id,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            name: item.job_title_name ?? item.name,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            mentor_count: item.mentor_count,
          }));

          const rawCompanies = resCompanies.success ? (resCompanies.data?.companies ?? []) : [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedCompanies = rawCompanies.map((item: any) => ({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            id: item.company_id ?? item.id,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            name: item.company_name ?? item.name,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            mentor_count: item.mentor_count,
          }));

          set({
            defaultSkills: mappedSkills,
            defaultJobTitles: mappedJobTitles,
            defaultCompanies: mappedCompanies,

            skills: mappedSkills,
            jobTitles: mappedJobTitles,
            companies: mappedCompanies,
          });
        } catch (error) {
          console.log("Error fetching initial filter data:", error);
        } finally {
          set({ isLoading: false });
        }
      },
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
