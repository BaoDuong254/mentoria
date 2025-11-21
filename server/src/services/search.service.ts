import sql from "mssql";
import { MentorListItem } from "@/types/mentor.type";
import {
  SearchMentorsQuery,
  SearchMentorsResponse,
  SearchSkillsQuery,
  SearchSkillsResponse,
  SkillCategoryItem,
  SearchCompaniesQuery,
  SearchCompaniesResponse,
  CompanyItem,
  SearchJobTitlesQuery,
  SearchJobTitlesResponse,
  JobTitleItem,
} from "@/types/search.type";
import { getTotalFeedbackCountService, getAverageRatingService } from "@/services/mentor.service";
import poolPromise from "@/config/database";

export const searchMentorsService = async (query: SearchMentorsQuery): Promise<SearchMentorsResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const { keyword } = query;

    // Set pagination defaults
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
    const offset = (page - 1) * limit;

    // Prepare the search pattern for SQL LIKE
    const searchPattern = `%${keyword}%`;

    // Get total count of matching mentors
    const countQuery = `
      SELECT COUNT(DISTINCT u.user_id) as total
      FROM users u
      INNER JOIN mentors m ON u.user_id = m.user_id
      LEFT JOIN set_skill ss ON u.user_id = ss.mentor_id
      LEFT JOIN skills s ON ss.skill_id = s.skill_id
      LEFT JOIN own_skill os ON s.skill_id = os.skill_id
      LEFT JOIN categories cat ON os.category_id = cat.category_id
      LEFT JOIN work_for wf ON u.user_id = wf.mentor_id
      LEFT JOIN companies c ON wf.c_company_id = c.company_id
      LEFT JOIN job_title jt ON wf.current_job_title_id = jt.job_title_id
      LEFT JOIN mentor_languages ml ON u.user_id = ml.mentor_id
      WHERE u.role = N'Mentor'
        AND u.status = N'Active'
        AND (
          u.first_name LIKE @searchPattern
          OR u.last_name LIKE @searchPattern
          OR CONCAT(u.first_name, ' ', u.last_name) LIKE @searchPattern
          OR m.bio LIKE @searchPattern
          OR m.headline LIKE @searchPattern
          OR s.skill_name LIKE @searchPattern
          OR cat.category_name LIKE @searchPattern
          OR c.cname LIKE @searchPattern
          OR jt.job_name LIKE @searchPattern
          OR ml.mentor_language LIKE @searchPattern
        )
    `;

    const countRequest = pool.request();
    countRequest.input("searchPattern", sql.NVarChar, searchPattern);
    const countResult = await countRequest.query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get matching mentors with pagination
    const mentorsQuery = `
      SELECT DISTINCT
        u.user_id,
        u.first_name,
        u.last_name,
        u.avatar_url,
        u.country,
        m.bio,
        m.headline,
        m.response_time,
        (SELECT MIN(plan_charge) FROM plans WHERE mentor_id = u.user_id) as lowest_plan_price
      FROM users u
      INNER JOIN mentors m ON u.user_id = m.user_id
      LEFT JOIN set_skill ss ON u.user_id = ss.mentor_id
      LEFT JOIN skills s ON ss.skill_id = s.skill_id
      LEFT JOIN own_skill os ON s.skill_id = os.skill_id
      LEFT JOIN categories cat ON os.category_id = cat.category_id
      LEFT JOIN work_for wf ON u.user_id = wf.mentor_id
      LEFT JOIN companies c ON wf.c_company_id = c.company_id
      LEFT JOIN job_title jt ON wf.current_job_title_id = jt.job_title_id
      LEFT JOIN mentor_languages ml ON u.user_id = ml.mentor_id
      WHERE u.role = N'Mentor'
        AND u.status = N'Active'
        AND (
          u.first_name LIKE @searchPattern
          OR u.last_name LIKE @searchPattern
          OR CONCAT(u.first_name, ' ', u.last_name) LIKE @searchPattern
          OR m.bio LIKE @searchPattern
          OR m.headline LIKE @searchPattern
          OR s.skill_name LIKE @searchPattern
          OR cat.category_name LIKE @searchPattern
          OR c.cname LIKE @searchPattern
          OR jt.job_name LIKE @searchPattern
          OR ml.mentor_language LIKE @searchPattern
        )
      ORDER BY u.user_id DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const mainRequest = pool.request();
    mainRequest.input("searchPattern", sql.NVarChar, searchPattern);
    mainRequest.input("limit", sql.Int, limit);
    mainRequest.input("offset", sql.Int, offset);
    const mentorsResult = await mainRequest.query(mentorsQuery);

    // Enrich mentor data with skills, languages, and stats
    const mentors: MentorListItem[] = await Promise.all(
      mentorsResult.recordset.map(
        async (mentor: {
          user_id: number;
          first_name: string;
          last_name: string;
          avatar_url: string | null;
          country: string | null;
          bio: string | null;
          headline: string | null;
          response_time: string;
          lowest_plan_price: number | null;
        }) => {
          // Get skills for this mentor
          const skillsResult = await pool.request().input("mentorId", sql.Int, mentor.user_id).query(`
            SELECT s.skill_id, s.skill_name
            FROM set_skill ss
            INNER JOIN skills s ON ss.skill_id = s.skill_id
            WHERE ss.mentor_id = @mentorId
          `);

          // Get languages for this mentor
          const languagesResult = await pool.request().input("mentorId", sql.Int, mentor.user_id).query(`
            SELECT mentor_language
            FROM mentor_languages
            WHERE mentor_id = @mentorId
          `);

          // Get categories for this mentor (through skills)
          const categoriesResult = await pool.request().input("mentorId", sql.Int, mentor.user_id).query(`
            SELECT DISTINCT cat.category_id, cat.category_name
            FROM set_skill ss
            INNER JOIN own_skill os ON ss.skill_id = os.skill_id
            INNER JOIN categories cat ON os.category_id = cat.category_id
            WHERE ss.mentor_id = @mentorId
          `);

          // Get feedback stats
          const totalFeedbacks = await getTotalFeedbackCountService(mentor.user_id);
          const averageRating = await getAverageRatingService(mentor.user_id);

          return {
            user_id: mentor.user_id,
            first_name: mentor.first_name,
            last_name: mentor.last_name,
            avatar_url: mentor.avatar_url,
            country: mentor.country,
            bio: mentor.bio,
            headline: mentor.headline,
            response_time: mentor.response_time,
            total_feedbacks: totalFeedbacks,
            average_rating: averageRating,
            lowest_plan_price: mentor.lowest_plan_price,
            skills: skillsResult.recordset.map((s) => ({
              skill_id: s.skill_id,
              skill_name: s.skill_name,
            })),
            languages: languagesResult.recordset.map((l) => l.mentor_language),
            categories: categoriesResult.recordset.map((c) => ({
              category_id: c.category_id,
              category_name: c.category_name,
            })),
          };
        }
      )
    );

    return {
      success: true,
      message:
        totalItems > 0
          ? `Found ${totalItems} mentor${totalItems !== 1 ? "s" : ""} matching "${keyword}"`
          : `No mentors found matching "${keyword}"`,
      data: {
        mentors,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        searchInfo: {
          keyword,
          searchedFields: [
            "first_name",
            "last_name",
            "full_name",
            "bio",
            "headline",
            "skills",
            "categories",
            "companies",
            "job_titles",
            "languages",
          ],
        },
      },
    };
  } catch (error) {
    console.error("Error in searchMentorsService:", error);
    throw error;
  }
};

export const searchSkillsService = async (query: SearchSkillsQuery): Promise<SearchSkillsResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const { keyword } = query;

    // Set pagination defaults
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
    const offset = (page - 1) * limit;

    // Prepare the search pattern for SQL LIKE
    const searchPattern = `%${keyword}%`;

    // Query for skills with mentor counts
    const skillsQuery = `
      SELECT
        s.skill_id as id,
        s.skill_name as name,
        'skill' as type,
        NULL as super_category_id,
        COUNT(DISTINCT ss.mentor_id) as mentor_count
      FROM skills s
      LEFT JOIN set_skill ss ON s.skill_id = ss.skill_id
      WHERE s.skill_name LIKE @searchPattern
      GROUP BY s.skill_id, s.skill_name
    `;

    // Query for categories with super_category_id not null and mentor counts
    const categoriesQuery = `
      SELECT
        cat.category_id as id,
        cat.category_name as name,
        'category' as type,
        cat.super_category_id,
        COUNT(DISTINCT ss.mentor_id) as mentor_count
      FROM categories cat
      LEFT JOIN own_skill os ON cat.category_id = os.category_id
      LEFT JOIN set_skill ss ON os.skill_id = ss.skill_id
      WHERE cat.super_category_id IS NOT NULL
        AND cat.category_name LIKE @searchPattern
      GROUP BY cat.category_id, cat.category_name, cat.super_category_id
    `;

    // Get total count
    const countQuery = `
      WITH CombinedResults AS (
        ${skillsQuery}
        UNION ALL
        ${categoriesQuery}
      )
      SELECT COUNT(*) as total FROM CombinedResults
    `;

    const countRequest = pool.request();
    countRequest.input("searchPattern", sql.NVarChar, searchPattern);
    const countResult = await countRequest.query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated results
    const paginatedQuery = `
      WITH CombinedResults AS (
        ${skillsQuery}
        UNION ALL
        ${categoriesQuery}
      )
      SELECT * FROM CombinedResults
      ORDER BY mentor_count DESC, name ASC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const mainRequest = pool.request();
    mainRequest.input("searchPattern", sql.NVarChar, searchPattern);
    mainRequest.input("limit", sql.Int, limit);
    mainRequest.input("offset", sql.Int, offset);
    const result = await mainRequest.query(paginatedQuery);

    const results: SkillCategoryItem[] = result.recordset.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type as "skill" | "category",
      super_category_id: row.super_category_id,
      mentor_count: row.mentor_count,
    }));

    return {
      success: true,
      message:
        totalItems > 0
          ? `Found ${totalItems} skill${totalItems !== 1 ? "s" : ""}/categor${totalItems !== 1 ? "ies" : "y"} matching "${keyword}"`
          : `No skills or categories found matching "${keyword}"`,
      data: {
        results,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        searchInfo: {
          keyword,
        },
      },
    };
  } catch (error) {
    console.error("Error in searchSkillsService:", error);
    throw error;
  }
};

export const searchCompaniesService = async (query: SearchCompaniesQuery): Promise<SearchCompaniesResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const { keyword } = query;

    // Set pagination defaults
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
    const offset = (page - 1) * limit;

    // Prepare the search pattern for SQL LIKE
    const searchPattern = `%${keyword}%`;

    // Query for companies with mentor counts
    const companiesQuery = `
      SELECT
        c.company_id as id,
        c.cname as name,
        COUNT(DISTINCT wf.mentor_id) as mentor_count
      FROM companies c
      LEFT JOIN work_for wf ON c.company_id = wf.c_company_id
      WHERE c.cname LIKE @searchPattern
      GROUP BY c.company_id, c.cname
    `;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM (
        ${companiesQuery}
      ) AS CountResult
    `;

    const countRequest = pool.request();
    countRequest.input("searchPattern", sql.NVarChar, searchPattern);
    const countResult = await countRequest.query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated results
    const paginatedQuery = `
      ${companiesQuery}
      ORDER BY mentor_count DESC, name ASC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const mainRequest = pool.request();
    mainRequest.input("searchPattern", sql.NVarChar, searchPattern);
    mainRequest.input("limit", sql.Int, limit);
    mainRequest.input("offset", sql.Int, offset);
    const result = await mainRequest.query(paginatedQuery);

    const results: CompanyItem[] = result.recordset.map((row) => ({
      id: row.id,
      name: row.name,
      mentor_count: row.mentor_count,
    }));

    return {
      success: true,
      message:
        totalItems > 0
          ? `Found ${totalItems} compan${totalItems !== 1 ? "ies" : "y"} matching "${keyword}"`
          : `No companies found matching "${keyword}"`,
      data: {
        results,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        searchInfo: {
          keyword,
        },
      },
    };
  } catch (error) {
    console.error("Error in searchCompaniesService:", error);
    throw error;
  }
};

export const searchJobTitlesService = async (query: SearchJobTitlesQuery): Promise<SearchJobTitlesResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const { keyword } = query;

    // Set pagination defaults
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
    const offset = (page - 1) * limit;

    // Prepare the search pattern for SQL LIKE
    const searchPattern = `%${keyword}%`;

    // Query for job titles with mentor counts
    const jobTitlesQuery = `
      SELECT
        jt.job_title_id as id,
        jt.job_name as name,
        COUNT(DISTINCT wf.mentor_id) as mentor_count
      FROM job_title jt
      LEFT JOIN work_for wf ON jt.job_title_id = wf.current_job_title_id
      WHERE jt.job_name LIKE @searchPattern
      GROUP BY jt.job_title_id, jt.job_name
    `;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM (
        ${jobTitlesQuery}
      ) AS CountResult
    `;

    const countRequest = pool.request();
    countRequest.input("searchPattern", sql.NVarChar, searchPattern);
    const countResult = await countRequest.query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated results
    const paginatedQuery = `
      ${jobTitlesQuery}
      ORDER BY mentor_count DESC, name ASC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const mainRequest = pool.request();
    mainRequest.input("searchPattern", sql.NVarChar, searchPattern);
    mainRequest.input("limit", sql.Int, limit);
    mainRequest.input("offset", sql.Int, offset);
    const result = await mainRequest.query(paginatedQuery);

    const results: JobTitleItem[] = result.recordset.map((row) => ({
      id: row.id,
      name: row.name,
      mentor_count: row.mentor_count,
    }));

    return {
      success: true,
      message:
        totalItems > 0
          ? `Found ${totalItems} job title${totalItems !== 1 ? "s" : ""} matching "${keyword}"`
          : `No job titles found matching "${keyword}"`,
      data: {
        results,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        searchInfo: {
          keyword,
        },
      },
    };
  } catch (error) {
    console.error("Error in searchJobTitlesService:", error);
    throw error;
  }
};
