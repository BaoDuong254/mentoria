import sql from "mssql";
import poolPromise from "@/config/database";
import { MentorListItem, FilterMentorsQuery, FilterMentorsResponse } from "@/types/mentor.type";

interface MentorDatabaseRow {
  user_id: number;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  country: string | null;
  bio: string | null;
  headline: string | null;
  response_time: string;
  total_feedbacks: number;
  average_rating: number | null;
  lowest_plan_price: number | null;
  Skills: string | null;
  Languages: string | null;
  Companies: string | null;
  Categories: string | null;
}

const buildFilterClauses = (query: FilterMentorsQuery, request: sql.Request) => {
  const whereClauses: string[] = [];
  const havingClauses: string[] = [];

  if (query.skillIds && query.skillIds.length > 0) {
    const placeholders: string[] = [];
    query.skillIds.forEach((id, idx) => {
      const paramName = `skillId${idx}`;
      request.input(paramName, sql.Int, id);
      placeholders.push(`@${paramName}`);
    });

    whereClauses.push(`
      EXISTS (
        SELECT 1
        FROM set_skill ss
        WHERE ss.mentor_id = m.user_id
          AND ss.skill_id IN (${placeholders.join(", ")})
      )
    `);
  }

  if (query.companyIds && query.companyIds.length > 0) {
    const placeholders: string[] = [];
    query.companyIds.forEach((id, idx) => {
      const paramName = `companyId${idx}`;
      request.input(paramName, sql.Int, id);
      placeholders.push(`@${paramName}`);
    });

    whereClauses.push(`
      EXISTS (
        SELECT 1
        FROM work_for wf
        WHERE wf.mentor_id = m.user_id
          AND wf.c_company_id IN (${placeholders.join(", ")})
      )
    `);
  }

  if (query.jobTitleIds && query.jobTitleIds.length > 0) {
    const placeholders: string[] = [];
    query.jobTitleIds.forEach((id, idx) => {
      const paramName = `jobTitleId${idx}`;
      request.input(paramName, sql.Int, id);
      placeholders.push(`@${paramName}`);
    });

    whereClauses.push(`
      EXISTS (
        SELECT 1
        FROM work_for wf2
        WHERE wf2.mentor_id = m.user_id
          AND wf2.current_job_title_id IN (${placeholders.join(", ")})
      )
    `);
  }

  if (query.countries && query.countries.length > 0) {
    const placeholders: string[] = [];
    query.countries.forEach((country, idx) => {
      const paramName = `country${idx}`;
      request.input(paramName, sql.NVarChar(100), country);
      placeholders.push(`@${paramName}`);
    });

    whereClauses.push(`u.country IN (${placeholders.join(", ")})`);
  }

  if (query.languages && query.languages.length > 0) {
    const placeholders: string[] = [];
    query.languages.forEach((lang, idx) => {
      const paramName = `language${idx}`;
      request.input(paramName, sql.NVarChar(100), lang);
      placeholders.push(`@${paramName}`);
    });

    whereClauses.push(`
      EXISTS (
        SELECT 1
        FROM mentor_languages ml
        WHERE ml.mentor_id = m.user_id
          AND ml.mentor_language IN (${placeholders.join(", ")})
      )
    `);
  }

  if (typeof query.minPrice === "number") {
    request.input("minPrice", sql.Decimal(10, 2), query.minPrice);
    havingClauses.push(`MIN(p.plan_charge) >= @minPrice`);
  }

  if (typeof query.maxPrice === "number") {
    request.input("maxPrice", sql.Decimal(10, 2), query.maxPrice);
    havingClauses.push(`MIN(p.plan_charge) <= @maxPrice`);
  }

  if (typeof query.minRating === "number") {
    request.input("minRating", sql.Decimal(3, 1), query.minRating);
    havingClauses.push(`AVG(CAST(f.stars AS DECIMAL(10,2))) >= @minRating`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const havingSql = havingClauses.length > 0 ? `HAVING ${havingClauses.join(" AND ")}` : "";

  return { whereSql, havingSql };
};

export const filterMentorsService = async (query: FilterMentorsQuery): Promise<FilterMentorsResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
  const offset = (page - 1) * limit;

  try {
    const countRequest = pool.request();
    const { whereSql: whereSqlCount, havingSql: havingSqlCount } = buildFilterClauses(query, countRequest);

    const countQuery = `
      WITH FilteredMentors AS (
        SELECT
          m.user_id,
          AVG(CAST(f.stars AS DECIMAL(10,2))) AS avg_rating,
          MIN(p.plan_charge) AS lowest_price
        FROM mentors m
        INNER JOIN users u ON u.user_id = m.user_id
        LEFT JOIN feedbacks f ON f.mentor_id = m.user_id
        LEFT JOIN plans p ON p.mentor_id = m.user_id
        ${whereSqlCount}
        GROUP BY m.user_id
        ${havingSqlCount}
      )
      SELECT COUNT(*) AS total
      FROM FilteredMentors;
    `;

    const countResult = await countRequest.query(countQuery);
    const totalItems: number = countResult.recordset[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    if (totalItems === 0) {
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

    const mainRequest = pool.request();
    const { whereSql, havingSql } = buildFilterClauses(query, mainRequest);

    mainRequest.input("limit", sql.Int, limit);
    mainRequest.input("offset", sql.Int, offset);

    const mainQuery = `
      WITH FilteredMentors AS (
        SELECT
          m.user_id,
          COUNT(DISTINCT f.mentee_id) AS total_feedbacks,
          AVG(CAST(f.stars AS DECIMAL(10,2))) AS avg_rating,
          MIN(p.plan_charge) AS lowest_price
        FROM mentors m
        INNER JOIN users u ON u.user_id = m.user_id
        LEFT JOIN feedbacks f ON f.mentor_id = m.user_id
        LEFT JOIN plans p ON p.mentor_id = m.user_id
        ${whereSql}
        GROUP BY m.user_id
        ${havingSql}
      )
      SELECT
        m.user_id,
        u.first_name,
        u.last_name,
        u.avatar_url,
        u.country,
        m.bio,
        m.headline,
        m.response_time,
        fm.total_feedbacks,
        fm.avg_rating AS average_rating,
        fm.lowest_price AS lowest_plan_price,
        -- Skills
        Skills = (
          SELECT DISTINCT
            s.skill_id,
            s.skill_name
          FROM set_skill ss
          JOIN skills s ON s.skill_id = ss.skill_id
          WHERE ss.mentor_id = m.user_id
          FOR JSON PATH
        ),
        -- Languages
        Languages = (
          SELECT DISTINCT
            ml.mentor_language AS [language]
          FROM mentor_languages ml
          WHERE ml.mentor_id = m.user_id
          FOR JSON PATH
        ),
        -- Companies + Job titles
        Companies = (
          SELECT DISTINCT
            c.company_id,
            c.cname AS company_name,
            jt.job_title_id,
            jt.job_name
          FROM work_for wf
          JOIN companies c ON c.company_id = wf.c_company_id
          JOIN job_title jt ON jt.job_title_id = wf.current_job_title_id
          WHERE wf.mentor_id = m.user_id
          FOR JSON PATH
        ),
        -- Categories (từ skills -> own_skill -> categories)
        Categories = (
          SELECT DISTINCT
            cat.category_id,
            cat.category_name
          FROM set_skill ss
          JOIN own_skill os ON os.skill_id = ss.skill_id
          JOIN categories cat ON cat.category_id = os.category_id
          WHERE ss.mentor_id = m.user_id
          FOR JSON PATH
        )
      FROM FilteredMentors fm
      JOIN mentors m ON m.user_id = fm.user_id
      JOIN users u ON u.user_id = m.user_id
      ORDER BY
        ISNULL(fm.avg_rating, 0) DESC,
        fm.total_feedbacks DESC,
        u.first_name ASC,
        u.last_name ASC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY;
    `;

    const result = await mainRequest.query(mainQuery);

    const mentors: MentorListItem[] = result.recordset.map((row: MentorDatabaseRow) => {
      const skills = row.Skills ? JSON.parse(row.Skills) : [];
      const languagesRaw = row.Languages ? JSON.parse(row.Languages) : [];
      const companies = row.Companies ? JSON.parse(row.Companies) : [];
      const categories = row.Categories ? JSON.parse(row.Categories) : [];

      return {
        user_id: row.user_id,
        first_name: row.first_name,
        last_name: row.last_name,
        avatar_url: row.avatar_url,
        country: row.country,
        bio: row.bio,
        headline: row.headline,
        response_time: row.response_time,
        total_feedbacks: row.total_feedbacks || 0,
        average_rating:
          row.average_rating !== null && row.average_rating !== undefined ? Number(row.average_rating) : null,
        lowest_plan_price:
          row.lowest_plan_price !== null && row.lowest_plan_price !== undefined ? Number(row.lowest_plan_price) : null,
        skills,
        languages: languagesRaw.map((l: { language: string }) => l.language),
        companies,
        categories,
      } as MentorListItem;
    });

    return {
      success: true,
      message: `Found ${totalItems} mentor(s)`,
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
      },
    };
  } catch (error) {
    console.error("Error in filterMentorsService:", error);
    throw error;
  }
};
