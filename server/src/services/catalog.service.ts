import sql from "mssql";
import { SuperCategoriesQuery, SuperCategoriesResponse, SuperCategoryItem } from "@/types/catalog.type";
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
