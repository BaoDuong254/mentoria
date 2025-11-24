import sql from "mssql";
import {
  SuperCategoriesQuery,
  SuperCategoriesResponse,
  SuperCategoryItem,
  SkillsQuery,
  SkillsResponse,
  SkillItem,
  CompaniesQuery,
  CompaniesResponse,
  CompanyItem,
  JobTitlesQuery,
  JobTitlesResponse,
  JobTitleItem,
  CountriesQuery,
  CountriesResponse,
  CountryItem,
  LanguagesQuery,
  LanguagesResponse,
  LanguageItem,
} from "@/types/catalog.type";
import poolPromise from "@/config/database";

export const getSuperCategoriesService = async (query: SuperCategoriesQuery): Promise<SuperCategoriesResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Set pagination defaults
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
    const offset = (page - 1) * limit;

    // Query for super categories (where super_category_id IS NULL) with mentor counts
    // The mentor count should include mentors who have skills in ANY subcategory of this super category
    const superCategoriesQuery = `
      SELECT
        cat.category_id,
        cat.category_name,
        COUNT(DISTINCT ss.mentor_id) as mentor_count
      FROM categories cat
      LEFT JOIN categories subcat ON subcat.super_category_id = cat.category_id
      LEFT JOIN own_skill os ON (os.category_id = cat.category_id OR os.category_id = subcat.category_id)
      LEFT JOIN set_skill ss ON os.skill_id = ss.skill_id
      WHERE cat.super_category_id IS NULL
      GROUP BY cat.category_id, cat.category_name
    `;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM (
        ${superCategoriesQuery}
      ) AS CountResult
    `;

    const countResult = await pool.request().query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated results
    const paginatedQuery = `
      ${superCategoriesQuery}
      ORDER BY mentor_count DESC, cat.category_name ASC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const mainRequest = pool.request();
    mainRequest.input("limit", sql.Int, limit);
    mainRequest.input("offset", sql.Int, offset);
    const result = await mainRequest.query(paginatedQuery);

    const categories: SuperCategoryItem[] = result.recordset.map((row) => ({
      category_id: row.category_id,
      category_name: row.category_name,
      mentor_count: row.mentor_count,
    }));

    return {
      success: true,
      message:
        totalItems > 0
          ? `Found ${totalItems} super categor${totalItems !== 1 ? "ies" : "y"}`
          : "No super categories found",
      data: {
        categories,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error in getSuperCategoriesService:", error);
    throw error;
  }
};

export const getSkillsService = async (query: SkillsQuery): Promise<SkillsResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Set pagination defaults
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
    const offset = (page - 1) * limit;

    // Query for skills with mentor counts, category, and supercategory
    const skillsQuery = `
      SELECT
        s.skill_id,
        s.skill_name,
        COUNT(DISTINCT ss.mentor_id) as mentor_count,
        cat.category_id,
        cat.category_name,
        supercat.category_id as super_category_id,
        supercat.category_name as super_category_name
      FROM skills s
      LEFT JOIN set_skill ss ON s.skill_id = ss.skill_id
      LEFT JOIN own_skill os ON s.skill_id = os.skill_id
      LEFT JOIN categories cat ON os.category_id = cat.category_id
      LEFT JOIN categories supercat ON cat.super_category_id = supercat.category_id
      GROUP BY s.skill_id, s.skill_name, cat.category_id, cat.category_name, supercat.category_id, supercat.category_name
    `;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM (
        ${skillsQuery}
      ) AS CountResult
    `;

    const countResult = await pool.request().query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated results
    const paginatedQuery = `
      ${skillsQuery}
      ORDER BY mentor_count DESC, s.skill_name ASC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const mainRequest = pool.request();
    mainRequest.input("limit", sql.Int, limit);
    mainRequest.input("offset", sql.Int, offset);
    const result = await mainRequest.query(paginatedQuery);

    const skills: SkillItem[] = result.recordset.map((row) => ({
      skill_id: row.skill_id,
      skill_name: row.skill_name,
      mentor_count: row.mentor_count,
      category_id: row.category_id,
      category_name: row.category_name,
      super_category_id: row.super_category_id,
      super_category_name: row.super_category_name,
    }));

    return {
      success: true,
      message: totalItems > 0 ? `Found ${totalItems} skill${totalItems !== 1 ? "s" : ""}` : "No skills found",
      data: {
        skills,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error in getSkillsService:", error);
    throw error;
  }
};

export const getCompaniesService = async (query: CompaniesQuery): Promise<CompaniesResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Set pagination defaults
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
    const offset = (page - 1) * limit;

    // Query for companies with mentor counts
    const companiesQuery = `
      SELECT
        c.company_id,
        c.cname as company_name,
        COUNT(DISTINCT wf.mentor_id) as mentor_count
      FROM companies c
      LEFT JOIN work_for wf ON c.company_id = wf.c_company_id
      GROUP BY c.company_id, c.cname
    `;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM (
        ${companiesQuery}
      ) AS CountResult
    `;

    const countResult = await pool.request().query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated results
    const paginatedQuery = `
      ${companiesQuery}
      ORDER BY mentor_count DESC, c.cname ASC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const mainRequest = pool.request();
    mainRequest.input("limit", sql.Int, limit);
    mainRequest.input("offset", sql.Int, offset);
    const result = await mainRequest.query(paginatedQuery);

    const companies: CompanyItem[] = result.recordset.map((row) => ({
      company_id: row.company_id,
      company_name: row.company_name,
      mentor_count: row.mentor_count,
    }));

    return {
      success: true,
      message: totalItems > 0 ? `Found ${totalItems} compan${totalItems !== 1 ? "ies" : "y"}` : "No companies found",
      data: {
        companies,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error in getCompaniesService:", error);
    throw error;
  }
};

export const getJobTitlesService = async (query: JobTitlesQuery): Promise<JobTitlesResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Set pagination defaults
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
    const offset = (page - 1) * limit;

    // Query for job titles with mentor counts
    const jobTitlesQuery = `
      SELECT
        jt.job_title_id,
        jt.job_name as job_title_name,
        COUNT(DISTINCT wf.mentor_id) as mentor_count
      FROM job_title jt
      LEFT JOIN work_for wf ON jt.job_title_id = wf.current_job_title_id
      GROUP BY jt.job_title_id, jt.job_name
    `;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM (
        ${jobTitlesQuery}
      ) AS CountResult
    `;

    const countResult = await pool.request().query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated results
    const paginatedQuery = `
      ${jobTitlesQuery}
      ORDER BY mentor_count DESC, jt.job_name ASC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const mainRequest = pool.request();
    mainRequest.input("limit", sql.Int, limit);
    mainRequest.input("offset", sql.Int, offset);
    const result = await mainRequest.query(paginatedQuery);

    const jobTitles: JobTitleItem[] = result.recordset.map((row) => ({
      job_title_id: row.job_title_id,
      job_title_name: row.job_title_name,
      mentor_count: row.mentor_count,
    }));

    return {
      success: true,
      message: totalItems > 0 ? `Found ${totalItems} job title${totalItems !== 1 ? "s" : ""}` : "No job titles found",
      data: {
        jobTitles,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error in getJobTitlesService:", error);
    throw error;
  }
};

export const getCountriesService = async (query: CountriesQuery): Promise<CountriesResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Set pagination defaults
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
    const offset = (page - 1) * limit;

    // Query for countries with mentor counts
    const countriesQuery = `
      SELECT
        u.country,
        COUNT(DISTINCT m.user_id) as mentor_count
      FROM users u
      INNER JOIN mentors m ON u.user_id = m.user_id
      WHERE u.country IS NOT NULL
      GROUP BY u.country
    `;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM (
        ${countriesQuery}
      ) AS CountResult
    `;

    const countResult = await pool.request().query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated results
    const paginatedQuery = `
      ${countriesQuery}
      ORDER BY mentor_count DESC, u.country ASC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const mainRequest = pool.request();
    mainRequest.input("limit", sql.Int, limit);
    mainRequest.input("offset", sql.Int, offset);
    const result = await mainRequest.query(paginatedQuery);

    const countries: CountryItem[] = result.recordset.map((row) => ({
      country: row.country,
      mentor_count: row.mentor_count,
    }));

    return {
      success: true,
      message: totalItems > 0 ? `Found ${totalItems} countr${totalItems !== 1 ? "ies" : "y"}` : "No countries found",
      data: {
        countries,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error in getCountriesService:", error);
    throw error;
  }
};

export const getLanguagesService = async (query: LanguagesQuery): Promise<LanguagesResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Set pagination defaults
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
    const offset = (page - 1) * limit;

    // Query for languages with mentor counts
    const languagesQuery = `
      SELECT
        ml.mentor_language as language,
        COUNT(DISTINCT ml.mentor_id) as mentor_count
      FROM mentor_languages ml
      GROUP BY ml.mentor_language
    `;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM (
        ${languagesQuery}
      ) AS CountResult
    `;

    const countResult = await pool.request().query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated results
    const paginatedQuery = `
      ${languagesQuery}
      ORDER BY mentor_count DESC, ml.mentor_language ASC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const mainRequest = pool.request();
    mainRequest.input("limit", sql.Int, limit);
    mainRequest.input("offset", sql.Int, offset);
    const result = await mainRequest.query(paginatedQuery);

    const languages: LanguageItem[] = result.recordset.map((row) => ({
      language: row.language,
      mentor_count: row.mentor_count,
    }));

    return {
      success: true,
      message: totalItems > 0 ? `Found ${totalItems} language${totalItems !== 1 ? "s" : ""}` : "No languages found",
      data: {
        languages,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error in getLanguagesService:", error);
    throw error;
  }
};
