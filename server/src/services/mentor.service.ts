import poolPromise from "@/config/database";
import { MentorProfile, UpdateMentorProfileRequest, MentorListItem, GetMentorsQuery } from "@/types/mentor.type";

const getMentorProfileService = async (
  mentorId: number
): Promise<{
  success: boolean;
  message: string;
  mentor?: MentorProfile;
}> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Get basic user and mentor information
    const mentorResult = await pool.request().input("mentorId", mentorId).query(`
        SELECT
          u.user_id,
          u.first_name,
          u.last_name,
          u.email,
          u.sex,
          u.avatar_url,
          u.country,
          u.timezone,
          m.bio,
          m.headline,
          m.response_time,
          m.total_reviews,
          m.total_stars,
          m.total_mentee,
          m.cv_url
        FROM users u
        INNER JOIN mentors m ON u.user_id = m.user_id
        WHERE u.user_id = @mentorId AND u.role = N'Mentor'
      `);

    if (mentorResult.recordset.length === 0) {
      return {
        success: false,
        message: "Mentor not found",
      };
    }

    const mentorBasicInfo = mentorResult.recordset[0];

    // Get social links
    const socialLinksResult = await pool.request().input("mentorId", mentorId).query(`
        SELECT link, platform
        FROM user_social_links
        WHERE user_id = @mentorId
      `);

    // Get companies
    const companiesResult = await pool.request().input("mentorId", mentorId).query(`
        SELECT c.company_id, c.cname as company_name, w.crole as role
        FROM work_for w
        INNER JOIN companies c ON w.c_company_id = c.company_id
        WHERE w.mentor_id = @mentorId
      `);

    // Get fields
    const fieldsResult = await pool.request().input("mentorId", mentorId).query(`
        SELECT f.field_id, f.name as field_name
        FROM own_field o
        INNER JOIN fields f ON o.f_field_id = f.field_id
        WHERE o.mentor_id = @mentorId
      `);

    // Get languages
    const languagesResult = await pool.request().input("mentorId", mentorId).query(`
        SELECT mentor_language
        FROM mentor_languages
        WHERE mentor_id = @mentorId
      `);

    // Get plans with benefits
    const plansResult = await pool.request().input("mentorId", mentorId).query(`
        SELECT plan_id, charge, duration
        FROM plans
        WHERE mentor_id = @mentorId
      `);

    // Get benefits for each plan
    const plans = await Promise.all(
      plansResult.recordset.map(async (plan) => {
        const benefitsResult = await pool.request().input("planId", plan.plan_id).query(`
            SELECT plan_benefit
            FROM plan_benefits
            WHERE plan_id = @planId
          `);

        return {
          plan_id: plan.plan_id,
          charge: plan.charge,
          duration: plan.duration,
          benefits: benefitsResult.recordset.map((b) => b.plan_benefit),
        };
      })
    );

    // Calculate average rating
    const averageRating =
      mentorBasicInfo.total_reviews > 0 ? mentorBasicInfo.total_stars / mentorBasicInfo.total_reviews : null;

    // Construct the complete mentor profile
    const mentorProfile: MentorProfile = {
      ...mentorBasicInfo,
      social_links: socialLinksResult.recordset.map((sl) => ({
        link: sl.link,
        platform: sl.platform,
      })),
      companies: companiesResult.recordset.map((c) => ({
        company_id: c.company_id,
        company_name: c.company_name,
        role: c.role,
      })),
      fields: fieldsResult.recordset.map((f) => ({
        field_id: f.field_id,
        field_name: f.field_name,
      })),
      languages: languagesResult.recordset.map((l) => l.mentor_language),
      plans: plans,
      average_rating: averageRating,
    };

    return {
      success: true,
      message: "Mentor profile retrieved successfully",
      mentor: mentorProfile,
    };
  } catch (error) {
    console.error("Error in getMentorProfileService:", error);
    throw error;
  }
};

const updateMentorProfileService = async (
  mentorId: number,
  updateData: UpdateMentorProfileRequest
): Promise<{
  success: boolean;
  message: string;
}> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Verify mentor exists
    const mentorCheck = await pool
      .request()
      .input("mentorId", mentorId)
      .query("SELECT user_id FROM users WHERE user_id = @mentorId AND role = N'Mentor'");

    if (mentorCheck.recordset.length === 0) {
      return {
        success: false,
        message: "Mentor not found",
      };
    }

    // Start transaction
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Update users table
      const userUpdateFields: string[] = [];
      const userRequest = transaction.request().input("mentorId", mentorId);

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
        userUpdateFields.push("updated_at = GETDATE()");
        await userRequest.query(`
          UPDATE users
          SET ${userUpdateFields.join(", ")}
          WHERE user_id = @mentorId
        `);
      }

      // Update mentors table
      const mentorUpdateFields: string[] = [];
      const mentorRequest = transaction.request().input("mentorId", mentorId);

      if (updateData.bio !== undefined) {
        mentorUpdateFields.push("bio = @bio");
        mentorRequest.input("bio", updateData.bio);
      }
      if (updateData.headline !== undefined) {
        mentorUpdateFields.push("headline = @headline");
        mentorRequest.input("headline", updateData.headline);
      }
      if (updateData.responseTime !== undefined) {
        mentorUpdateFields.push("response_time = @responseTime");
        mentorRequest.input("responseTime", updateData.responseTime);
      }
      if (updateData.cvUrl !== undefined) {
        mentorUpdateFields.push("cv_url = @cvUrl");
        mentorRequest.input("cvUrl", updateData.cvUrl);
      }

      if (mentorUpdateFields.length > 0) {
        await mentorRequest.query(`
          UPDATE mentors
          SET ${mentorUpdateFields.join(", ")}
          WHERE user_id = @mentorId
        `);
      }

      // Update social links
      if (updateData.socialLinks !== undefined) {
        // Delete existing social links
        await transaction.request().input("mentorId", mentorId).query(`
          DELETE FROM user_social_links WHERE user_id = @mentorId
        `);

        // Insert new social links
        for (const socialLink of updateData.socialLinks) {
          await transaction
            .request()
            .input("mentorId", mentorId)
            .input("link", socialLink.link)
            .input("platform", socialLink.platform).query(`
              INSERT INTO user_social_links (user_id, link, platform)
              VALUES (@mentorId, @link, @platform)
            `);
        }
      }

      // Update languages
      if (updateData.languages !== undefined) {
        // Delete existing languages
        await transaction.request().input("mentorId", mentorId).query(`
          DELETE FROM mentor_languages WHERE mentor_id = @mentorId
        `);

        // Insert new languages
        for (const language of updateData.languages) {
          await transaction.request().input("mentorId", mentorId).input("language", language).query(`
              INSERT INTO mentor_languages (mentor_id, mentor_language)
              VALUES (@mentorId, @language)
            `);
        }
      }

      // Update fields
      if (updateData.fieldIds !== undefined) {
        // Delete existing fields
        await transaction.request().input("mentorId", mentorId).query(`
          DELETE FROM own_field WHERE mentor_id = @mentorId
        `);

        // Insert new fields
        for (const fieldId of updateData.fieldIds) {
          await transaction.request().input("mentorId", mentorId).input("fieldId", fieldId).query(`
              INSERT INTO own_field (mentor_id, f_field_id)
              VALUES (@mentorId, @fieldId)
            `);
        }
      }

      // Update companies
      if (updateData.companies !== undefined) {
        // Delete existing company associations
        await transaction.request().input("mentorId", mentorId).query(`
          DELETE FROM work_for WHERE mentor_id = @mentorId
        `);

        // Insert new companies
        for (const company of updateData.companies) {
          // Check if company exists, if not create it
          const companyCheck = await transaction.request().input("companyName", company.companyName).query(`
              SELECT company_id FROM companies WHERE cname = @companyName
            `);

          let companyId: number;

          if (companyCheck.recordset.length > 0) {
            companyId = companyCheck.recordset[0].company_id;
          } else {
            // Create new company
            const newCompany = await transaction.request().input("companyName", company.companyName).query(`
                INSERT INTO companies (cname)
                OUTPUT INSERTED.company_id
                VALUES (@companyName)
              `);
            companyId = newCompany.recordset[0].company_id;
          }

          // Associate mentor with company
          await transaction
            .request()
            .input("mentorId", mentorId)
            .input("companyId", companyId)
            .input("role", company.role || null).query(`
              INSERT INTO work_for (mentor_id, c_company_id, crole)
              VALUES (@mentorId, @companyId, @role)
            `);
        }
      }

      await transaction.commit();

      return {
        success: true,
        message: "Mentor profile updated successfully",
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error in updateMentorProfileService:", error);
    throw error;
  }
};

const getMentorsListService = async (
  query: GetMentorsQuery
): Promise<{
  success: boolean;
  message: string;
  data?: {
    mentors: MentorListItem[];
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
    const conditions: string[] = ["u.role = N'Mentor'", "u.status = N'Active'"];

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // Get total count
    const countQuery = `
      SELECT COUNT(u.user_id) as total
      FROM users u
      INNER JOIN mentors m ON u.user_id = m.user_id
      ${whereClause}
    `;

    const countResult = await pool.request().query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get mentors list with pagination
    const mentorsQuery = `
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.avatar_url,
        u.country,
        m.bio,
        m.headline,
        m.response_time,
        m.total_reviews,
        m.total_stars
      FROM users u
      INNER JOIN mentors m ON u.user_id = m.user_id
      ${whereClause}
      ORDER BY m.total_reviews DESC, m.total_stars DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const mainRequest = pool.request();
    mainRequest.input("limit", limit);
    mainRequest.input("offset", offset);
    const mentorsResult = await mainRequest.query(mentorsQuery);

    // Get fields and languages for each mentor
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
          response_time: number | null;
          total_reviews: number;
          total_stars: number;
        }) => {
          // Get fields
          const fieldsResult = await pool.request().input("mentorId", mentor.user_id).query(`
          SELECT f.field_id, f.name as field_name
          FROM own_field o
          INNER JOIN fields f ON o.f_field_id = f.field_id
          WHERE o.mentor_id = @mentorId
        `);

          // Get languages
          const languagesResult = await pool.request().input("mentorId", mentor.user_id).query(`
          SELECT mentor_language
          FROM mentor_languages
          WHERE mentor_id = @mentorId
        `);

          // Calculate average rating
          const averageRating = mentor.total_reviews > 0 ? mentor.total_stars / mentor.total_reviews : null;

          return {
            user_id: mentor.user_id,
            first_name: mentor.first_name,
            last_name: mentor.last_name,
            avatar_url: mentor.avatar_url,
            country: mentor.country,
            bio: mentor.bio,
            headline: mentor.headline,
            response_time: mentor.response_time,
            total_reviews: mentor.total_reviews,
            average_rating: averageRating,
            fields: fieldsResult.recordset.map((f) => ({
              field_id: f.field_id,
              field_name: f.field_name,
            })),
            languages: languagesResult.recordset.map((l) => l.mentor_language),
          };
        }
      )
    );

    return {
      success: true,
      message: "Mentors retrieved successfully",
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
    console.error("Error in getMentorsListService:", error);
    throw error;
  }
};

export { getMentorProfileService, updateMentorProfileService, getMentorsListService };
