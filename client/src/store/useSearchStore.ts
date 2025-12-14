import { create } from "zustand";
import { persist } from "zustand/middleware";
import { searchSkills, searchJobTitles, searchCompanies } from "@/apis/search.mentorbrowse.api";
import type { SearchMentorState } from "@/types";
import { getMentor } from "@/apis/mentor.api";
import { getCompaniesList, getJobTitlesList, getSkillsList } from "@/apis/catalog.api";
import { getFilteredMentors } from "@/apis/filter.api";
import { getAvailableFilters } from "@/apis/available-filters.api";

type SearchStoreType = SearchMentorState;

export const useSearchStore = create<SearchStoreType>()(
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

      // Additional filters
      searchKeyword: "",
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      selectedCountries: [],
      selectedLanguages: [],
      status: undefined,
      experienceLevel: undefined,
      availability: undefined,
      sortColumn: "user_id",
      sortDirection: "ASC",

      // Available filter options from database
      availableCountries: [],
      availableLanguages: [],
      isLoadingFilters: false,

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
        const {
          selectedSkills,
          selectedJobTitles,
          selectedCompanies,
          searchKeyword,
          minPrice,
          maxPrice,
          minRating,
          selectedCountries,
          selectedLanguages,
          status,
          sortColumn,
          sortDirection,
        } = get();

        const skillIds: string | undefined =
          selectedSkills.length > 0 ? selectedSkills.map((s: { id: number }) => s.id).join(",") : undefined;
        const jobTitleIds: string | undefined =
          selectedJobTitles.length > 0 ? selectedJobTitles.map((j: { id: number }) => j.id).join(",") : undefined;
        const companyIds: string | undefined =
          selectedCompanies.length > 0 ? selectedCompanies.map((c: { id: number }) => c.id).join(",") : undefined;
        const countries: string | undefined = selectedCountries.length > 0 ? selectedCountries.join(",") : undefined;
        const languages: string | undefined = selectedLanguages.length > 0 ? selectedLanguages.join(",") : undefined;

        try {
          // Parse searchKeyword to support searching by first name, last name, or full name
          const trimmedSearch = searchKeyword.trim();
          let firstNameParam: string | undefined = undefined;
          let lastNameParam: string | undefined = undefined;
          let searchNameParam: string | undefined = undefined;

          if (trimmedSearch) {
            const parts = trimmedSearch.split(/\s+/);
            if (parts.length === 1) {
              // Single word - use SearchName so SP will match either first or last name
              searchNameParam = trimmedSearch;
            } else {
              // Multiple words - assume first token is first name and the rest is last name
              firstNameParam = parts[0] ?? "";
              lastNameParam = parts.slice(1).join(" ");
              // also provide full search string to SearchName for full-name matching
              searchNameParam = trimmedSearch;
            }
          }

          const res = await getFilteredMentors(
            page,
            limit,
            skillIds,
            jobTitleIds,
            companyIds,
            countries,
            languages,
            minPrice !== undefined ? String(minPrice) : undefined,
            maxPrice !== undefined ? String(maxPrice) : undefined,
            minRating !== undefined ? String(minRating) : undefined,
            searchNameParam,
            firstNameParam,
            lastNameParam,
            undefined, // categoryName
            status, // status
            sortColumn,
            sortDirection
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
      fetchAvailableFilters: async () => {
        const { availableCountries, availableLanguages } = get();
        if (
          Array.isArray(availableCountries) &&
          availableCountries.length > 0 &&
          Array.isArray(availableLanguages) &&
          availableLanguages.length > 0
        ) {
          return; // Already fetched
        }

        set({ isLoadingFilters: true });
        try {
          const res = await getAvailableFilters();

          if (res.success && res.data) {
            set({
              availableCountries: res.data.countries,
              availableLanguages: res.data.languages,
            });
          }
        } catch (error) {
          console.error("Error fetching available filters:", error);
        } finally {
          set({ isLoadingFilters: false });
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
          interface SkillItem {
            skill_id?: number;
            id?: number;
            skill_name?: string;
            name?: string;
            mentor_count?: number;
            super_category_id?: number;
          }
          const mappedSkills = (rawSkills as SkillItem[]).map((item) => ({
            id: item.skill_id ?? item.id ?? 0,

            name: item.skill_name ?? item.name ?? "",

            mentor_count: item.mentor_count ?? 0,
            type: "skill" as const,

            super_category_id: item.super_category_id ?? null,
          }));

          const rawJobTitles = resJobTitles.success ? (resJobTitles.data?.jobTitles ?? []) : [];
          interface JobTitleItem {
            job_title_id?: number;
            id?: number;
            job_title_name?: string;
            name?: string;
            mentor_count?: number;
          }
          const mappedJobTitles = (rawJobTitles as JobTitleItem[]).map((item) => ({
            id: item.job_title_id ?? item.id ?? 0,

            name: item.job_title_name ?? item.name ?? "",

            mentor_count: item.mentor_count ?? 0,
          }));

          const rawCompanies = resCompanies.success ? (resCompanies.data?.companies ?? []) : [];
          interface CompanyItem {
            company_id?: number;
            id?: number;
            company_name?: string;
            name?: string;
            mentor_count?: number;
          }
          const mappedCompanies = (rawCompanies as CompanyItem[]).map((item) => ({
            id: item.company_id ?? item.id ?? 0,

            name: item.company_name ?? item.name ?? "",

            mentor_count: item.mentor_count ?? 0,
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

      //----------------ADDITIONAL FILTER ACTIONS-------------------
      setPriceRange: (min: number | undefined, max: number | undefined) => set({ minPrice: min, maxPrice: max }),

      setMinRating: (rating: number | undefined) => set({ minRating: rating }),

      setSorting: (column: string, direction: "ASC" | "DESC") => set({ sortColumn: column, sortDirection: direction }),

      setSearchKeyword: (keyword: string) => set({ searchKeyword: keyword }),

      setSelectedCountries: (countries: string[]) => set({ selectedCountries: countries }),

      setSelectedLanguages: (languages: string[]) => set({ selectedLanguages: languages }),

      setStatus: (status: string | undefined) => set({ status }),

      resetAllFilters: () =>
        set({
          searchKeyword: "",
          selectedSkills: [],
          selectedJobTitles: [],
          selectedCompanies: [],
          selectedCountries: [],
          selectedLanguages: [],
          status: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          minRating: undefined,
          experienceLevel: undefined,
          availability: undefined,
          sortColumn: "user_id",
          sortDirection: "ASC",
        }),

      setExperienceLevel: (level: string | undefined) => set({ experienceLevel: level }),

      setAvailability: (availability: string | undefined) => set({ availability }),
    }),
    {
      name: "search-storage",
      partialize: (state): Partial<SearchMentorState> => ({
        skills: state.skills,
        selectedSkills: state.selectedSkills,
        keywordSkills: state.keywordSkills,
        jobTitles: state.jobTitles,
        selectedJobTitles: state.selectedJobTitles,
        keywordJobTitles: state.keywordJobTitles,
        companies: state.companies,
        selectedCompanies: state.selectedCompanies,
        keywordCompanies: state.keywordCompanies,
        selectedMentor: state.selectedMentor,
      }),
    }
  )
);
