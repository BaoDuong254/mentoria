import sql from "mssql";
import poolPromise from "@/config/database";
import { MentorListItem, FilterMentorsQuery, FilterMentorsResponse } from "@/types/mentor.type";

interface SPMentorRow {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  country: string | null;
  status: string;
  timezone: string | null;
  bio: string | null;
  headline: string | null;
  response_time: string;
  cv_url: string | null;
  average_rating: number;
  total_reviews: number;
  total_mentee: number | null;
  total_stars: number | null;
  company_names: string;
  job_title: string;
  total_plans: number;
  lowest_plan_price: number;
  highest_plan_price: number;
  average_plan_price: number;
  skills: string;
  languages: string;
  categories: string;
  total_items: number;
  current_page: number;
  items_per_page: number;
  total_pages: number;
}

const parseSkillsString = (skillsStr: string): Array<{ skill_id: number; skill_name: string }> => {
  if (!skillsStr || skillsStr.trim() === "") return [];
  return skillsStr.split(", ").map((name, index) => ({
    skill_id: index + 1,
    skill_name: name.trim(),
  }));
};

/**
 * Helper function to parse comma-separated languages string into array
 */
const parseLanguagesString = (languagesStr: string): string[] => {
  if (!languagesStr || languagesStr.trim() === "") return [];
  // Handle both ", " and "," separators, and trim each language
  return languagesStr
    .split(",")
    .map((lang) => lang.trim())
    .filter((lang) => lang.length > 0);
};

const parseCompaniesString = (
  companyNames: string,
  jobTitle: string
): Array<{ company_id: number; company_name: string; job_title_id: number; job_name: string }> => {
  if (!companyNames || companyNames.trim() === "") return [];
  return companyNames.split(", ").map((name, index) => ({
    company_id: index + 1,
    company_name: name.trim(),
    job_title_id: index + 1,
    job_name: jobTitle || "",
  }));
};

const parseCategoriesString = (categoriesStr: string): Array<{ category_id: number; category_name: string }> => {
  if (!categoriesStr || categoriesStr.trim() === "") return [];
  return categoriesStr.split(", ").map((name, index) => ({
    category_id: index + 1, // Note: actual IDs not available from SP
    category_name: name.trim(),
  }));
};

const mapSortColumn = (sortColumn?: string): string => {
  const sortMap: Record<string, string> = {
    average_rating: "average_rating",
    total_reviews: "total_reviews",
    lowest_plan_price: "lowest_plan_price",
    first_name: "first_name",
    last_name: "last_name",
    user_id: "user_id",
  };
  return sortMap[sortColumn ?? "user_id"] ?? "user_id";
};

const getSkillNameById = async (pool: sql.ConnectionPool, skillId: number): Promise<string | null> => {
  try {
    const result = await pool.request().input("skillId", sql.Int, skillId).query(`
        SELECT skill_name FROM skills WHERE skill_id = @skillId
      `);
    return result.recordset[0]?.skill_name ?? null;
  } catch {
    return null;
  }
};

const getCompanyNameById = async (pool: sql.ConnectionPool, companyId: number): Promise<string | null> => {
  try {
    const result = await pool.request().input("companyId", sql.Int, companyId).query(`
        SELECT cname FROM companies WHERE company_id = @companyId
      `);
    return result.recordset[0]?.cname ?? null;
  } catch {
    return null;
  }
};

const getJobTitleNameById = async (pool: sql.ConnectionPool, jobTitleId: number): Promise<string | null> => {
  try {
    const result = await pool.request().input("jobTitleId", sql.Int, jobTitleId).query(`
        SELECT job_name FROM job_title WHERE job_title_id = @jobTitleId
      `);
    return result.recordset[0]?.job_name ?? null;
  } catch {
    return null;
  }
};

// Get available countries and languages for filters
export const getAvailableFiltersService = async (): Promise<{
  success: boolean;
  data?: { countries: string[]; languages: string[] };
  message?: string;
}> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Get distinct countries from users where role is Mentor
    const countriesResult = await pool.request().query(`
      SELECT DISTINCT country
      FROM users
      WHERE role = N'Mentor'
        AND country IS NOT NULL
        AND LTRIM(RTRIM(country)) <> ''
        AND status IN (N'Active', N'Inactive')
      ORDER BY country ASC
    `);

    // Get distinct languages from mentor_languages
    const languagesResult = await pool.request().query(`
      SELECT DISTINCT mentor_language
      FROM mentor_languages
      WHERE mentor_language IS NOT NULL
        AND LTRIM(RTRIM(mentor_language)) <> ''
      ORDER BY mentor_language ASC
    `);

    const countries = countriesResult.recordset.map((row: { country: string }) => row.country);
    const languages = languagesResult.recordset.map((row: { mentor_language: string }) => row.mentor_language);

    return {
      success: true,
      data: {
        countries,
        languages,
      },
    };
  } catch (error) {
    console.error("Error fetching available filters:", error);
    return {
      success: false,
      message: "Failed to fetch available filters",
    };
  }
};

// Goi sp_SearchMentors voi cac tham so loc va tra ve ket qua da loc
export const filterMentorsService = async (query: FilterMentorsQuery): Promise<FilterMentorsResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;

  // Check if we need client-side filtering (multiple selections)
  const needsClientSideFiltering =
    (query.skillIds && query.skillIds.length > 1) ||
    (query.companyIds && query.companyIds.length > 1) ||
    (query.jobTitleIds && query.jobTitleIds.length > 1);

  const spLimit = needsClientSideFiltering ? 1000 : limit;
  const spPage = needsClientSideFiltering ? 1 : page;

  try {
    // IDs
    let skillName: string | null = null;
    let companyName: string | null = null;
    let jobTitleName: string | null = null;

    //skillIds
    if (query.skillIds && query.skillIds.length > 0 && query.skillIds[0] !== undefined) {
      skillName = await getSkillNameById(pool, query.skillIds[0]);
    }

    // companyId
    if (query.companyIds && query.companyIds.length > 0 && query.companyIds[0] !== undefined) {
      companyName = await getCompanyNameById(pool, query.companyIds[0]);
    }

    // jobTitleIds
    if (query.jobTitleIds && query.jobTitleIds.length > 0 && query.jobTitleIds[0] !== undefined) {
      jobTitleName = await getJobTitleNameById(pool, query.jobTitleIds[0]);
    }

    const request = pool.request();

    // Input thams so cho stored procedure
    // FirstName and LastName
    if (query.firstName && query.firstName.trim() !== "") {
      request.input("FirstName", sql.NVarChar(50), query.firstName);
    } else {
      request.input("FirstName", sql.NVarChar(50), null);
    }

    if (query.lastName && query.lastName.trim() !== "") {
      request.input("LastName", sql.NVarChar(50), query.lastName);
    } else {
      request.input("LastName", sql.NVarChar(50), null);
    }

    // SearchName - search by FirstName, LastName, or full name
    if (query.searchName && query.searchName.trim() !== "") {
      request.input("SearchName", sql.NVarChar(100), query.searchName.trim());
    } else {
      request.input("SearchName", sql.NVarChar(100), null);
    }

    // CompanyName - companyIds
    request.input("CompanyName", sql.NVarChar(255), companyName);

    // JobTitleName - jobTitleIds
    request.input("JobTitleName", sql.NVarChar(255), jobTitleName);

    // SkillName - skillIds
    request.input("SkillName", sql.NVarChar(100), skillName);

    // CategoryName
    if (query.categoryName && query.categoryName.trim() !== "") {
      request.input("CategoryName", sql.NVarChar(100), query.categoryName);
    } else {
      request.input("CategoryName", sql.NVarChar(100), null);
    }

    // Country - only 1 country can be selected
    if (query.countries && query.countries.length === 1) {
      request.input("Country", sql.NVarChar(100), query.countries[0]);
    } else {
      request.input("Country", sql.NVarChar(100), null);
    }

    // Language - OR logic: SP xử lý với comma-separated values
    if (query.languages && query.languages.length > 0) {
      const languagesStr = query.languages.join(",");
      request.input("Language", sql.NVarChar(500), languagesStr);
    } else {
      request.input("Language", sql.NVarChar(500), null);
    }

    // Status - filter by mentor status (e.g., 'Active', 'Inactive', etc.)
    if (query.status && query.status.trim() !== "") {
      request.input("Status", sql.NVarChar(20), query.status.trim());
    } else {
      request.input("Status", sql.NVarChar(20), null);
    }

    // MinRating
    if (typeof query.minRating === "number" && !isNaN(query.minRating)) {
      request.input("MinRating", sql.Decimal(3, 2), query.minRating);
    } else {
      request.input("MinRating", sql.Decimal(3, 2), null);
    }

    // MaxPrice
    if (typeof query.maxPrice === "number" && !isNaN(query.maxPrice)) {
      request.input("MaxPrice", sql.Decimal(10, 2), query.maxPrice);
    } else {
      request.input("MaxPrice", sql.Decimal(10, 2), null);
    }

    // MinPrice
    if (typeof query.minPrice === "number" && !isNaN(query.minPrice)) {
      request.input("MinPrice", sql.Decimal(10, 2), query.minPrice);
    } else {
      request.input("MinPrice", sql.Decimal(10, 2), null);
    }

    // SortColumn and SortDirection
    const sortColumn = mapSortColumn(query.sortColumn);
    const sortDirection = query.sortDirection === "ASC" ? "ASC" : "DESC";
    request.input("SortColumn", sql.NVarChar(50), sortColumn);
    request.input("SortDirection", sql.NVarChar(4), sortDirection);

    // Page and Limit - use spPage and spLimit for SP call
    request.input("Page", sql.Int, spPage);
    request.input("Limit", sql.Int, spLimit);

    // Execute the stored procedure
    const result = await request.execute("dbo.sp_SearchMentors");

    const recordset = result.recordset as SPMentorRow[];

    // Khong co kqua tra ve rong
    if (!recordset || recordset.length === 0) {
      return {
        success: true,
        message: "No mentors found with given filters",
        data: {
          mentors: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPreviousPage: page > 1,
          },
        },
      };
    }

    const firstRow = recordset[0]!;
    const totalItems = firstRow.total_items;
    const totalPages = firstRow.total_pages;

    const mentors: MentorListItem[] = recordset.map((row: SPMentorRow) => {
      return {
        user_id: row.user_id,
        first_name: row.first_name,
        last_name: row.last_name,
        avatar_url: row.avatar_url,
        country: row.country,
        bio: row.bio,
        headline: row.headline,
        response_time: row.response_time,
        total_feedbacks: row.total_reviews || 0,
        average_rating:
          row.average_rating !== null && row.average_rating !== undefined ? Number(row.average_rating) : null,
        lowest_plan_price:
          row.lowest_plan_price !== null && row.lowest_plan_price !== undefined ? Number(row.lowest_plan_price) : null,
        skills: parseSkillsString(row.skills),
        languages: parseLanguagesString(row.languages),
        companies: parseCompaniesString(row.company_names, row.job_title),
        categories: parseCategoriesString(row.categories),
      } as MentorListItem;
    });

    let filteredMentors = mentors;

    if (query.skillIds && query.skillIds.length > 1) {
      const skillNamesToMatch = await Promise.all(query.skillIds.map((id) => getSkillNameById(pool, id)));
      const validSkillNames = skillNamesToMatch.filter((name): name is string => name !== null);

      filteredMentors = filteredMentors.filter((mentor) => {
        const mentorSkillNames = mentor.skills.map((s) => s.skill_name.toLowerCase());
        return validSkillNames.every((skillName) =>
          mentorSkillNames.some((ms) => ms.includes(skillName.toLowerCase()))
        );
      });
    }

    if (query.companyIds && query.companyIds.length > 1) {
      const companyNamesToMatch = await Promise.all(query.companyIds.map((id) => getCompanyNameById(pool, id)));
      const validCompanyNames = companyNamesToMatch.filter((name): name is string => name !== null);

      filteredMentors = filteredMentors.filter((mentor) => {
        const mentorCompanyNames = mentor.companies.map((c) => c.company_name.toLowerCase());
        return validCompanyNames.every((companyName) =>
          mentorCompanyNames.some((mc) => mc.includes(companyName.toLowerCase()))
        );
      });
    }

    // Job Titles: Mentor must have ALL selected job titles (AND logic)
    if (query.jobTitleIds && query.jobTitleIds.length > 1) {
      const jobTitleNamesToMatch = await Promise.all(query.jobTitleIds.map((id) => getJobTitleNameById(pool, id)));
      const validJobTitleNames = jobTitleNamesToMatch.filter((name): name is string => name !== null);

      filteredMentors = filteredMentors.filter((mentor) => {
        // Ensure job_name exists and is compared case-insensitively
        const mentorJobTitles = mentor.companies.map((c) => (c.job_name || "").toLowerCase());
        return validJobTitleNames.every((jobTitle) =>
          mentorJobTitles.some((mjt) => mjt.includes(jobTitle.toLowerCase()))
        );
      });
    }
    // Apply pagination after client-side filtering if needed
    let finalMentors = filteredMentors;
    let finalTotalItems = totalItems;
    let finalTotalPages = totalPages;

    if (needsClientSideFiltering) {
      finalTotalItems = filteredMentors.length;
      finalTotalPages = Math.max(1, Math.ceil(filteredMentors.length / limit));

      // Apply pagination to filtered results
      const offset = (page - 1) * limit;
      finalMentors = filteredMentors.slice(offset, offset + limit);
    }

    return {
      success: true,
      message: `Found ${finalTotalItems} mentor(s)`,
      data: {
        mentors: finalMentors,
        pagination: {
          currentPage: page,
          totalPages: finalTotalPages,
          totalItems: finalTotalItems,
          itemsPerPage: limit,
          hasNextPage: page < finalTotalPages,
          hasPreviousPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error in filterMentorsService:", error);
    throw error;
  }
};
