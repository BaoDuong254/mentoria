import poolPromise from "../config/database";
import { MenteeProfile, UpdateMenteeProfileRequest, MenteeListItem, GetMenteesQuery } from "../types/mentee.type";

const getMenteeProfileService = async (
  menteeId: number
): Promise<{
  success: boolean;
  message: string;
  mentee?: MenteeProfile;
}> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Get basic user and mentee information
    const menteeResult = await pool.request().input("menteeId", menteeId).query(`
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.sex,
        u.avatar_url,
        u.country,
        u.timezone,
        u.created_at,
        u.updated_at,
        u.is_email_verified,
        m.goal
      FROM users u
      INNER JOIN mentees m ON u.user_id = m.user_id
      WHERE u.user_id = @menteeId AND u.role = N'Mentee'
    `);

    if (menteeResult.recordset.length === 0) {
      return {
        success: false,
        message: "Mentee not found",
      };
    }

    const menteeProfile: MenteeProfile = menteeResult.recordset[0];

    return {
      success: true,
      message: "Mentee profile retrieved successfully",
      mentee: menteeProfile,
    };
  } catch (error) {
    console.error(`Error in getMenteeProfileService: ${error}`);
    throw error;
  }
};

const updateMenteeProfileService = async (
  menteeId: number,
  updateData: UpdateMenteeProfileRequest
): Promise<{
  success: boolean;
  message: string;
}> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Verify mentee exists
    const menteeCheck = await pool
      .request()
      .input("menteeId", menteeId)
      .query("SELECT user_id FROM users WHERE user_id = @menteeId AND role = N'Mentee'");

    if (menteeCheck.recordset.length === 0) {
      return {
        success: false,
        message: "Mentee not found",
      };
    }

    // Start transaction
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Update users table
      const userUpdateFields: string[] = [];
      const userRequest = transaction.request().input("menteeId", menteeId);

      if (updateData.firstName !== undefined) {
        userUpdateFields.push("first_name = @firstName");
        userRequest.input("firstName", updateData.firstName);
      }

      if (updateData.lastName !== undefined) {
        userUpdateFields.push("last_name = @lastName");
        userRequest.input("lastName", updateData.lastName);
      }

      if (updateData.sex !== undefined) {
        userUpdateFields.push("sex = @sex");
        userRequest.input("sex", updateData.sex);
      }

      if (updateData.country !== undefined) {
        userUpdateFields.push("country = @country");
        userRequest.input("country", updateData.country);
      }

      if (updateData.timezone !== undefined) {
        userUpdateFields.push("timezone = @timezone");
        userRequest.input("timezone", updateData.timezone);
      }

      if (userUpdateFields.length > 0) {
        await userRequest.query(`
          UPDATE users
          SET ${userUpdateFields.join(", ")}, updated_at = GETDATE()
          WHERE user_id = @menteeId
        `);
      }

      // Update mentees table
      if (updateData.goal !== undefined) {
        await transaction.request().input("menteeId", menteeId).input("goal", updateData.goal).query(`
            UPDATE mentees
            SET goal = @goal
            WHERE user_id = @menteeId
          `);
      }

      // Commit transaction
      await transaction.commit();

      return {
        success: true,
        message: "Mentee profile updated successfully",
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error(`Error in updateMenteeProfileService: ${error}`);
    throw error;
  }
};

const getMenteesListService = async (
  query: GetMenteesQuery
): Promise<{
  success: boolean;
  message: string;
  data?: {
    mentees: MenteeListItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Set pagination defaults
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
    const offset = (page - 1) * limit;

    // Build WHERE clause conditions
    const conditions: string[] = ["u.role = N'Mentee'", "u.status = N'Active'"];
    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // Get total count
    const countQuery = `
      SELECT COUNT(u.user_id) as total
      FROM users u
      INNER JOIN mentees m ON u.user_id = m.user_id
      ${whereClause}
    `;

    const countResult = await pool.request().query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get mentees list with pagination
    const menteesQuery = `
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.avatar_url,
        u.country,
        u.created_at,
        m.goal
      FROM users u
      INNER JOIN mentees m ON u.user_id = m.user_id
      ${whereClause}
      ORDER BY u.created_at DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const menteesResult = await pool.request().input("limit", limit).input("offset", offset).query(menteesQuery);

    const mentees: MenteeListItem[] = menteesResult.recordset;

    return {
      success: true,
      message: "Mentees retrieved successfully",
      data: {
        mentees,
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
    console.error(`Error in getMenteesListService: ${error}`);
    throw error;
  }
};

export { getMenteeProfileService, updateMenteeProfileService, getMenteesListService };
