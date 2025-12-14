import Card from "./components/Card";
import { Search, ChevronDown } from "lucide-react";
import SkillsFilter from "./components/SkillsFilter";
import JobTitlesFilter from "./components/JobTitlesFilter";
import CompaniesFilter from "./components/CompaniesFilter";
import PriceRangeFilter from "./components/Filter/PriceRangeFilter";
import RatingFilter from "./components/Filter/RatingFilter";
import SortingControls from "./components/Filter/SortingControls";
import { useSearchStore } from "@/store/useSearchStore";
import { useEffect, useState, useCallback } from "react";
import Pagination from "@/components/Pagination";

// Status options
const STATUS_OPTIONS = ["Active", "Inactive"];

// Validation luc nhap tu khoa tim kiem
const validateSearchKeyword = (keyword: string): { isValid: boolean; error: string } => {
  // Empty is valid (no search)
  if (!keyword || keyword.trim() === "") {
    return { isValid: true, error: "" };
  }

  const trimmedKeyword = keyword.trim();

  // Length check
  if (trimmedKeyword.length > 100) {
    return { isValid: false, error: "Search keyword must be less than 100 characters" };
  }

  if (trimmedKeyword.length < 2) {
    return { isValid: false, error: "Search keyword must be at least 2 characters" };
  }

  // XSS prevention - block HTML/script tags va related characters
  const xssPattern = /[<>{}]/g;
  if (xssPattern.test(trimmedKeyword)) {
    return { isValid: false, error: "Search keyword contains invalid characters (< > { })" };
  }

  // SQL Injection tranh co ban
  const sqlInjectionPatterns = [
    /[";]/g, // Double quotes and semicolons (single quote allowed for names)
    /--/g, // SQL comment
    /\/\*/g, // Block comment start
    /\*\//g, // Block comment end
    /'\s*OR\s+/i, // ' OR pattern (SQL injection)
    /'\s*AND\s+/i, // ' AND pattern (SQL injection)
    /'\s*=/i, // '= pattern (SQL injection)
    /\bUNION\s+SELECT\b/i, // UNION SELECT
    /\bDROP\s+TABLE\b/i, // DROP TABLE
    /\bDELETE\s+FROM\b/i, // DELETE FROM
    /\bINSERT\s+INTO\b/i, // INSERT INTO
    /\bUPDATE\s+.*\s+SET\b/i, // UPDATE SET
    /\bEXEC\s*\(/i, // EXEC(
  ];

  for (const pattern of sqlInjectionPatterns) {
    if (pattern.test(trimmedKeyword)) {
      return { isValid: false, error: "Search keyword contains invalid patterns" };
    }
  }

  // Allow only safe characters for name search:
  // - Letters
  // - Numbers
  // - Spaces
  // - Common name punctuation: hyphen (-), apostrophe ('), period (.)
  const safeNamePattern = /^[\p{L}\p{N}\s\-'.]+$/u;
  if (!safeNamePattern.test(trimmedKeyword)) {
    return {
      isValid: false,
      error: "Search keyword can only contain letters, numbers, spaces, hyphens, and apostrophes",
    };
  }

  // Check for excessive whitespace (more than 2 consecutive spaces)
  if (/\s{3,}/.test(trimmedKeyword)) {
    return { isValid: false, error: "Search keyword contains too many consecutive spaces" };
  }

  return { isValid: true, error: "" };
};

function MentorBrowse() {
  const {
    mentors,
    fetchMentors,
    pageMentor,
    isFetchingMentors,
    fetchInitialFilterData,
    fetchAvailableFilters,
    availableCountries,
    availableLanguages,
    isLoadingFilters,
    selectedSkills,
    selectedJobTitles,
    selectedCompanies,
    searchKeyword,
    setSearchKeyword,
    minPrice,
    maxPrice,
    minRating,
    selectedCountries,
    setSelectedCountries,
    selectedLanguages,
    setSelectedLanguages,
    status,
    setStatus,
    sortColumn,
    sortDirection,
    resetAllFilters,
  } = useSearchStore();

  const ITEMS_PER_PAGE = 6;

  const [localSearchKeyword, setLocalSearchKeyword] = useState<string>(searchKeyword);
  const [searchError, setSearchError] = useState("");
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Track total items for display - update whenever pageMentor changes
  const totalMentorsCount = pageMentor?.totalItems ?? mentors.length;

  useEffect(() => {
    void fetchInitialFilterData();
    void fetchAvailableFilters();
  }, [fetchInitialFilterData, fetchAvailableFilters]);

  // Memoize fetchMentors call to prevent unnecessary re-renders
  const triggerFetch = useCallback(() => {
    void fetchMentors(1, ITEMS_PER_PAGE);
  }, [fetchMentors]);

  useEffect(() => {
    triggerFetch();
  }, [
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
    triggerFetch,
  ]);

  useEffect(() => {
    setLocalSearchKeyword(searchKeyword);
  }, [searchKeyword]);

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    void fetchMentors(page, ITEMS_PER_PAGE);
  };

  const handleSearchInputChange = (value: string) => {
    setLocalSearchKeyword(value);
    // Validate on change
    const validation = validateSearchKeyword(value);
    setSearchError(validation.error);
  };

  const handleSearch = () => {
    const trimmedKeyword = localSearchKeyword.trim();
    const validation = validateSearchKeyword(trimmedKeyword);

    if (!validation.isValid) {
      setSearchError(validation.error);
      return;
    }

    setSearchError("");
    setSearchKeyword(trimmedKeyword);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Country selection handled inline in the dropdown (single-select)

  const toggleLanguage = (language: string) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== language));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  const handleResetAll = () => {
    setLocalSearchKeyword("");
    setSearchError("");
    resetAllFilters();
  };

  return (
    <>
      <div className='flex w-full justify-center bg-(--secondary)'>
        <div className='my-20 flex w-10/12 justify-between text-white'>
          {/* Search Box */}
          <div className='flex w-1/4 flex-col gap-10'>
            <SkillsFilter />
            <JobTitlesFilter />
            <CompaniesFilter />
          </div>
          {/* The right side */}
          <div className='flex w-3/4 flex-col'>
            {/* Filter and Search Input */}
            <div className='flex flex-col gap-5'>
              <div>
                <h2 className='text-[36px] font-bold'>Find Your Perfect Mentor</h2>
                <p className='mt-2 text-gray-300'>Browse through our curated list of expert mentors</p>
              </div>
              <div className='flex flex-col gap-2'>
                <p className='text-sm text-gray-300'>Looking for</p>
                <div className='flex w-2/3 gap-2'>
                  <div className='flex flex-1 flex-col'>
                    <div
                      className={`flex flex-1 items-center rounded-lg border px-3 py-2 text-gray-300 focus-within:border-purple-500 ${
                        searchError ? "border-red-500" : "border-gray-700"
                      } bg-gray-800`}
                    >
                      <input
                        type='text'
                        placeholder='Search by mentor name...'
                        className='flex-1 bg-transparent placeholder-gray-500 outline-none'
                        value={localSearchKeyword}
                        onChange={(e) => {
                          handleSearchInputChange(e.target.value);
                        }}
                        onKeyDown={handleKeyPress}
                        maxLength={100}
                        aria-label='Search mentors by name'
                        aria-invalid={searchError ? true : false}
                        aria-describedby={searchError ? "search-error" : undefined}
                      />
                      <Search className='h-5 w-5 text-gray-300' />
                    </div>
                    {searchError && (
                      <p id='search-error' className='mt-1 text-xs text-red-400'>
                        {searchError}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={!!searchError}
                    className={`cursor-pointer rounded-lg px-4 py-2 ${
                      searchError
                        ? "cursor-not-allowed bg-gray-600 text-gray-400"
                        : "bg-(--primary) hover:bg-purple-600"
                    }`}
                  >
                    Search
                  </button>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex flex-wrap items-center gap-2'>
                  {/* Country Filter */}
                  <div className='relative'>
                    <button
                      onClick={() => {
                        setIsCountryOpen(!isCountryOpen);
                      }}
                      className={`flex items-center gap-2 rounded-full px-3 py-1 text-gray-300 transition-colors ${
                        selectedCountries.length > 0 ? "bg-purple-600 text-white" : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      Country {selectedCountries.length > 0 ? `: ${selectedCountries[0] ?? ""}` : ""}
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform ${isCountryOpen ? "-rotate-180" : ""}`}
                      />
                    </button>
                    {isCountryOpen && (
                      <>
                        <div
                          className='fixed inset-0 z-10'
                          onClick={() => {
                            setIsCountryOpen(false);
                          }}
                        />
                        <div className='absolute top-full left-0 z-20 mt-2 w-56 rounded-lg border border-gray-700 bg-gray-800 p-3 shadow-xl'>
                          <h3 className='mb-2 font-semibold text-white'>Select Countries</h3>
                          <div className='max-h-48 space-y-1 overflow-y-auto'>
                            {isLoadingFilters ? (
                              <div className='px-3 py-2 text-sm text-gray-400'>Loading...</div>
                            ) : availableCountries.length === 0 ? (
                              <div className='px-3 py-2 text-sm text-gray-400'>No countries available</div>
                            ) : (
                              availableCountries.map((country) => (
                                <button
                                  key={country}
                                  onClick={() => {
                                    // single-select behavior: set the clicked country or clear
                                    if (selectedCountries.includes(country)) {
                                      setSelectedCountries([]);
                                    } else {
                                      setSelectedCountries([country]);
                                    }
                                    setIsCountryOpen(false);
                                  }}
                                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                                    selectedCountries.includes(country)
                                      ? "bg-purple-600 text-white"
                                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                  }`}
                                >
                                  {country}
                                </button>
                              ))
                            )}
                          </div>
                          {selectedCountries.length > 0 && (
                            <button
                              onClick={() => {
                                setSelectedCountries([]);
                              }}
                              className='mt-2 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-600'
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Language Filter */}
                  <div className='relative'>
                    <button
                      onClick={() => {
                        setIsLanguageOpen(!isLanguageOpen);
                      }}
                      className={`flex items-center gap-2 rounded-full px-3 py-1 text-gray-300 transition-colors ${
                        selectedLanguages.length > 0 ? "bg-purple-600 text-white" : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      Language {selectedLanguages.length > 0 && `(${String(selectedLanguages.length)})`}
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform ${isLanguageOpen ? "-rotate-180" : ""}`}
                      />
                    </button>
                    {isLanguageOpen && (
                      <>
                        <div
                          className='fixed inset-0 z-10'
                          onClick={() => {
                            setIsLanguageOpen(false);
                          }}
                        />
                        <div className='absolute top-full left-0 z-20 mt-2 w-56 rounded-lg border border-gray-700 bg-gray-800 p-3 shadow-xl'>
                          <h3 className='mb-2 font-semibold text-white'>Select Languages</h3>
                          <div className='max-h-48 space-y-1 overflow-y-auto'>
                            {isLoadingFilters ? (
                              <div className='px-3 py-2 text-sm text-gray-400'>Loading...</div>
                            ) : availableLanguages.length === 0 ? (
                              <div className='px-3 py-2 text-sm text-gray-400'>No languages available</div>
                            ) : (
                              availableLanguages.map((language) => (
                                <button
                                  key={language}
                                  onClick={() => {
                                    toggleLanguage(language);
                                  }}
                                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                                    selectedLanguages.includes(language)
                                      ? "bg-purple-600 text-white"
                                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                  }`}
                                >
                                  {language}
                                </button>
                              ))
                            )}
                          </div>
                          {selectedLanguages.length > 0 && (
                            <button
                              onClick={() => {
                                setSelectedLanguages([]);
                              }}
                              className='mt-2 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-600'
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div className='relative'>
                    <button
                      onClick={() => {
                        setIsStatusOpen(!isStatusOpen);
                      }}
                      className={`flex items-center gap-2 rounded-full px-3 py-1 text-gray-300 transition-colors ${
                        status ? "bg-purple-600 text-white" : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      Status {status ? `(${status})` : ""}
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform ${isStatusOpen ? "-rotate-180" : ""}`}
                      />
                    </button>
                    {isStatusOpen && (
                      <>
                        <div
                          className='fixed inset-0 z-10'
                          onClick={() => {
                            setIsStatusOpen(false);
                          }}
                        />
                        <div className='absolute top-full left-0 z-20 mt-2 w-56 rounded-lg border border-gray-700 bg-gray-800 p-3 shadow-xl'>
                          <h3 className='mb-2 font-semibold text-white'>Select Status</h3>
                          <div className='max-h-48 space-y-1 overflow-y-auto'>
                            {STATUS_OPTIONS.map((statusOption) => (
                              <button
                                key={statusOption}
                                onClick={() => {
                                  setStatus(status === statusOption ? undefined : statusOption);
                                  setIsStatusOpen(false);
                                }}
                                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                                  status === statusOption
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                              >
                                {statusOption}
                              </button>
                            ))}
                          </div>
                          {status && (
                            <button
                              onClick={() => {
                                setStatus(undefined);
                                setIsStatusOpen(false);
                              }}
                              className='mt-2 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-600'
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <PriceRangeFilter
                    key={`${minPrice !== undefined ? String(minPrice) : ""}-${maxPrice !== undefined ? String(maxPrice) : ""}`}
                  />
                  <RatingFilter />
                  <button onClick={handleResetAll} className='cursor-pointer text-green-500 hover:text-green-400'>
                    Reset All
                  </button>
                </div>
                <div className='flex items-center gap-4'>
                  <SortingControls />
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <h2 className='text-2xl font-bold'>
                  {isFetchingMentors ? (
                    <span className='inline-block h-8 w-32 animate-pulse rounded bg-gray-700'></span>
                  ) : (
                    `${String(totalMentorsCount)} Mentors Available for Mentoring`
                  )}
                </h2>
                {/* Active filters summary */}
                {(selectedSkills.length > 0 ||
                  selectedJobTitles.length > 0 ||
                  selectedCompanies.length > 0 ||
                  selectedCountries.length > 0 ||
                  selectedLanguages.length > 0 ||
                  status !== undefined ||
                  minPrice !== undefined ||
                  maxPrice !== undefined ||
                  minRating !== undefined ||
                  searchKeyword) && (
                  <p className='text-sm text-gray-400'>
                    Filters active:{" "}
                    {(
                      [
                        selectedSkills.length > 0 ? `${String(selectedSkills.length)} skill(s)` : null,
                        selectedJobTitles.length > 0 ? `${String(selectedJobTitles.length)} job title(s)` : null,
                        selectedCompanies.length > 0 ? `${String(selectedCompanies.length)} company(ies)` : null,
                        selectedCountries.length > 0 ? (selectedCountries[0] ?? "") : null,
                        selectedLanguages.length > 0 ? `${String(selectedLanguages.length)} language(s)` : null,
                        status ? `status: ${status}` : null,
                        minPrice !== undefined || maxPrice !== undefined ? "price range" : null,
                        minRating !== undefined ? `rating ≥ ${String(minRating)}` : null,
                        searchKeyword ? `"${searchKeyword}"` : null,
                      ] as (string | null)[]
                    )
                      .filter((item): item is string => item !== null)
                      .join(", ")}
                  </p>
                )}
              </div>
            </div>
            {/* List of mentor card */}
            <div className='mt-4 w-11/12'>
              {isFetchingMentors ? (
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className='h-[380px] w-full animate-pulse rounded-xl border border-gray-800 bg-gray-800/50'
                    ></div>
                  ))}
                </div>
              ) : (
                <>
                  <div className='mb-5'>
                    {pageMentor && (
                      <Pagination
                        currentPage={pageMentor.currentPage}
                        totalPages={pageMentor.totalPages}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </div>
                  {mentors.length > 0 ? (
                    <div className='flex flex-col gap-8'>
                      <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
                        {mentors.map((mentor) => (
                          <Card key={mentor.user_id} mentor={mentor} />
                        ))}
                      </div>

                      {/* --- PHẦN PAGINATION --- */}
                      {pageMentor && (
                        <Pagination
                          currentPage={pageMentor.currentPage}
                          totalPages={pageMentor.totalPages}
                          onPageChange={handlePageChange}
                        />
                      )}
                    </div>
                  ) : (
                    <div className='flex h-60 w-full flex-col items-center justify-center rounded-xl border border-gray-800 bg-[--secondary] text-gray-400'>
                      <p className='text-lg'>No mentors found matching your criteria.</p>
                      <p className='text-sm'>Try adjusting your filters.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default MentorBrowse;
