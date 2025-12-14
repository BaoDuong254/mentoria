import poolPromise from "@/config/database";
import {
  MentorProfile,
  UpdateMentorProfileRequest,
  MentorListItem,
  GetMentorsQuery,
  Plan,
  CreatePlanSessionRequest,
  CreatePlanMentorshipRequest,
  UpdatePlanSessionRequest,
  UpdatePlanMentorshipRequest,
} from "@/types/mentor.type";

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
          m.cv_url,
          m.bank_name,
          m.account_number,
          m.account_holder_name,
          m.bank_branch,
          m.swift_code
        FROM users u
        INNER JOIN mentors m ON u.user_id = m.user_id
        WHERE u.user_id = @mentorId AND u.role = N'Mentor' AND u.status IN (N'Active', N'Inactive')
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
        SELECT c.company_id, c.cname as company_name, j.job_title_id, j.job_name
        FROM work_for w
        INNER JOIN companies c ON w.c_company_id = c.company_id
        INNER JOIN job_title j ON w.current_job_title_id = j.job_title_id
        WHERE w.mentor_id = @mentorId
      `);

    // Get skills
    const skillsResult = await pool.request().input("mentorId", mentorId).query(`
        SELECT s.skill_id, s.skill_name
        FROM set_skill ss
        INNER JOIN skills s ON ss.skill_id = s.skill_id
        WHERE ss.mentor_id = @mentorId
      `);

    // Get languages
    const languagesResult = await pool.request().input("mentorId", mentorId).query(`
        SELECT mentor_language
        FROM mentor_languages
        WHERE mentor_id = @mentorId
      `);

    // Get feedbacks with mentee information and plan details
    const feedbacksResult = await pool.request().input("mentorId", mentorId).query(`
        SELECT
          f.mentee_id,
          u.first_name as mentee_first_name,
          u.last_name as mentee_last_name,
          f.stars,
          f.content,
          f.sent_time,
          p.plan_id,
          p.plan_type,
          p.plan_description,
          p.plan_charge
        FROM feedbacks f
        INNER JOIN users u ON f.mentee_id = u.user_id
        LEFT JOIN bookings b ON f.mentee_id = b.mentee_id
        LEFT JOIN plans p ON b.plan_id = p.plan_id AND p.mentor_id = @mentorId
        WHERE f.mentor_id = @mentorId
        ORDER BY f.sent_time DESC
      `);

    // Get plans
    const plansResult = await pool.request().input("mentorId", mentorId).query(`
        SELECT plan_id, plan_description, plan_charge, plan_type
        FROM plans
        WHERE mentor_id = @mentorId
      `);

    // Get additional details for each plan
    const plans = await Promise.all(
      plansResult.recordset.map(async (plan) => {
        const planData: {
          plan_id: number;
          plan_description: string;
          plan_charge: number;
          plan_type: string;
          plan_category?: "session" | "mentorship";
          sessions_duration?: number;
          calls_per_month?: number;
          minutes_per_call?: number;
          benefits?: string[];
        } = {
          plan_id: plan.plan_id,
          plan_description: plan.plan_description,
          plan_charge: plan.plan_charge,
          plan_type: plan.plan_type,
        };

        // If it's a session plan, get duration
        const sessionResult = await pool.request().input("planId", plan.plan_id).query(`
            SELECT sessions_duration
            FROM plan_sessions
            WHERE sessions_id = @planId
          `);

        if (sessionResult.recordset.length > 0) {
          planData.plan_category = "session";
          planData.sessions_duration = sessionResult.recordset[0].sessions_duration;
        }

        // If it's a mentorship plan, get benefits
        const mentorshipCheck = await pool.request().input("planId", plan.plan_id).query(`
            SELECT mentorships_id, calls_per_month, minutes_per_call
            FROM plan_mentorships
            WHERE mentorships_id = @planId
          `);

        if (mentorshipCheck.recordset.length > 0) {
          planData.plan_category = "mentorship";
          planData.calls_per_month = mentorshipCheck.recordset[0].calls_per_month;
          planData.minutes_per_call = mentorshipCheck.recordset[0].minutes_per_call;
          const benefitsResult = await pool.request().input("planId", plan.plan_id).query(`
              SELECT benefit_description
              FROM mentorships_benefits
              WHERE mentorships_id = @planId
            `);
          planData.benefits = benefitsResult.recordset.map(
            (b: { benefit_description: string }) => b.benefit_description
          );
        }

        return planData;
      })
    );

    // Get mentor stats from derived attributes
    const statsResult = await pool.request().input("mentorId", mentorId).query(`
      SELECT total_mentee, total_reviews, total_stars, rating
      FROM mentors
      WHERE user_id = @mentorId
    `);

    const stats = statsResult.recordset[0];
    const totalMentees = stats.total_mentee || 0;
    const totalFeedbacks = stats.total_reviews || 0;
    const totalStars = stats.total_stars || 0;
    const averageRating = stats.rating || null;

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
        job_title_id: c.job_title_id,
        job_name: c.job_name,
      })),
      skills: skillsResult.recordset.map((s) => ({
        skill_id: s.skill_id,
        skill_name: s.skill_name,
      })),
      languages: languagesResult.recordset.map((l) => l.mentor_language),
      plans: plans,
      total_mentees: totalMentees,
      total_feedbacks: totalFeedbacks,
      total_stars: totalStars,
      average_rating: averageRating,
      feedbacks: feedbacksResult.recordset.map((f) => ({
        mentee_id: f.mentee_id,
        mentee_first_name: f.mentee_first_name,
        mentee_last_name: f.mentee_last_name,
        stars: f.stars,
        content: f.content,
        sent_time: f.sent_time,
        plan_id: f.plan_id,
        plan_type: f.plan_type,
        plan_description: f.plan_description,
        plan_charge: f.plan_charge,
      })),
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
      if (updateData.bankName !== undefined) {
        mentorUpdateFields.push("bank_name = @bankName");
        mentorRequest.input("bankName", updateData.bankName);
      }
      if (updateData.accountNumber !== undefined) {
        mentorUpdateFields.push("account_number = @accountNumber");
        mentorRequest.input("accountNumber", updateData.accountNumber);
      }
      if (updateData.accountHolderName !== undefined) {
        mentorUpdateFields.push("account_holder_name = @accountHolderName");
        mentorRequest.input("accountHolderName", updateData.accountHolderName);
      }
      if (updateData.bankBranch !== undefined) {
        mentorUpdateFields.push("bank_branch = @bankBranch");
        mentorRequest.input("bankBranch", updateData.bankBranch);
      }
      if (updateData.swiftCode !== undefined) {
        mentorUpdateFields.push("swift_code = @swiftCode");
        mentorRequest.input("swiftCode", updateData.swiftCode);
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

      // Update skills
      if (updateData.skillIds !== undefined) {
        // Delete existing skills
        await transaction.request().input("mentorId", mentorId).query(`
          DELETE FROM set_skill WHERE mentor_id = @mentorId
        `);

        // Insert new skills
        for (const skillId of updateData.skillIds) {
          await transaction.request().input("mentorId", mentorId).input("skillId", skillId).query(`
              INSERT INTO set_skill (mentor_id, skill_id)
              VALUES (@mentorId, @skillId)
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

          // Check if job title exists, if not create it
          const jobTitleCheck = await transaction.request().input("jobName", company.jobTitleName).query(`
              SELECT job_title_id FROM job_title WHERE job_name = @jobName
            `);

          let jobTitleId: number;

          if (jobTitleCheck.recordset.length > 0) {
            jobTitleId = jobTitleCheck.recordset[0].job_title_id;
          } else {
            // Create new job title
            const newJobTitle = await transaction.request().input("jobName", company.jobTitleName).query(`
                INSERT INTO job_title (job_name)
                OUTPUT INSERTED.job_title_id
                VALUES (@jobName)
              `);
            jobTitleId = newJobTitle.recordset[0].job_title_id;
          }

          // Associate mentor with company
          await transaction
            .request()
            .input("mentorId", mentorId)
            .input("companyId", companyId)
            .input("jobTitleId", jobTitleId).query(`
              INSERT INTO work_for (mentor_id, c_company_id, current_job_title_id)
              VALUES (@mentorId, @companyId, @jobTitleId)
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
        (SELECT MIN(plan_charge) FROM plans WHERE mentor_id = u.user_id) as lowest_plan_price
      FROM users u
      INNER JOIN mentors m ON u.user_id = m.user_id
      ${whereClause}
      ORDER BY u.user_id DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const mainRequest = pool.request();
    mainRequest.input("limit", limit);
    mainRequest.input("offset", offset);
    const mentorsResult = await mainRequest.query(mentorsQuery);

    // Get skills and languages for each mentor
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
          // Get skills
          const skillsResult = await pool.request().input("mentorId", mentor.user_id).query(`
          SELECT s.skill_id, s.skill_name
          FROM set_skill ss
          INNER JOIN skills s ON ss.skill_id = s.skill_id
          WHERE ss.mentor_id = @mentorId
        `);

          // Get languages
          const languagesResult = await pool.request().input("mentorId", mentor.user_id).query(`
          SELECT mentor_language
          FROM mentor_languages
          WHERE mentor_id = @mentorId
        `);

          // Get companies and job titles
          const companiesResult = await pool.request().input("mentorId", mentor.user_id).query(`
          SELECT c.company_id, c.cname as company_name, j.job_title_id, j.job_name
          FROM work_for w
          INNER JOIN companies c ON w.c_company_id = c.company_id
          INNER JOIN job_title j ON w.current_job_title_id = j.job_title_id
          WHERE w.mentor_id = @mentorId
        `);

          // Get categories for this mentor (through skills)
          const categoriesResult = await pool.request().input("mentorId", mentor.user_id).query(`
          SELECT DISTINCT cat.category_id, cat.category_name
          FROM set_skill ss
          INNER JOIN own_skill os ON ss.skill_id = os.skill_id
          INNER JOIN categories cat ON os.category_id = cat.category_id
          WHERE ss.mentor_id = @mentorId
        `);

          // Get feedback stats from derived attributes
          const statsResult = await pool.request().input("mentorId", mentor.user_id).query(`
            SELECT total_reviews, rating
            FROM mentors
            WHERE user_id = @mentorId
          `);

          const stats = statsResult.recordset[0];
          const totalFeedbacks = stats.total_reviews || 0;
          const averageRating = stats.rating || null;

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
            companies: companiesResult.recordset.map((c) => ({
              company_id: c.company_id,
              company_name: c.company_name,
              job_title_id: c.job_title_id,
              job_name: c.job_name,
            })),
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

const getMentorStatsService = async (
  mentorId: number
): Promise<{
  success: boolean;
  message: string;
  stats?: {
    total_mentees: number;
    total_feedbacks: number;
    total_stars: number;
    average_rating: number | null;
  };
}> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Get all stats from derived attributes in mentors table
    const result = await pool.request().input("mentorId", mentorId).query(`
        SELECT
          m.total_mentee,
          m.total_reviews,
          m.total_stars,
          m.rating
        FROM mentors m
        INNER JOIN users u ON u.user_id = m.user_id
        WHERE m.user_id = @mentorId AND u.role = N'Mentor'
      `);

    if (result.recordset.length === 0) {
      return {
        success: false,
        message: "Mentor not found",
      };
    }

    const stats = result.recordset[0];

    return {
      success: true,
      message: "Mentor stats retrieved successfully",
      stats: {
        total_mentees: stats.total_mentee || 0,
        total_feedbacks: stats.total_reviews || 0,
        total_stars: stats.total_stars || 0,
        average_rating: stats.rating || null,
      },
    };
  } catch (error) {
    console.error("Error in getMentorStatsService:", error);
    throw error;
  }
};

const getAllPlansService = async (
  mentorId: number
): Promise<{
  success: boolean;
  message: string;
  plans?: Plan[];
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

    // Get all plans for the mentor
    const plansResult = await pool.request().input("mentorId", mentorId).query(`
        SELECT plan_id, plan_description, plan_charge, plan_type, mentor_id
        FROM plans
        WHERE mentor_id = @mentorId
      `);

    // Get additional details for each plan
    const plans: Plan[] = await Promise.all(
      plansResult.recordset.map(
        async (plan: {
          plan_id: number;
          plan_description: string;
          plan_charge: number;
          plan_type: string;
          mentor_id: number;
        }): Promise<Plan> => {
          // Check if this is a session plan
          const sessionResult = await pool
            .request()
            .input("planId", plan.plan_id)
            .query("SELECT sessions_duration FROM plan_sessions WHERE sessions_id = @planId");

          if (sessionResult.recordset.length > 0) {
            return {
              plan_id: plan.plan_id,
              plan_description: plan.plan_description,
              plan_charge: plan.plan_charge,
              plan_type: plan.plan_type,
              mentor_id: plan.mentor_id,
              sessions_duration: sessionResult.recordset[0].sessions_duration,
              plan_category: "session" as const,
            };
          }

          // Check if this is a mentorship plan
          const mentorshipResult = await pool
            .request()
            .input("planId", plan.plan_id)
            .query("SELECT calls_per_month, minutes_per_call FROM plan_mentorships WHERE mentorships_id = @planId");

          if (mentorshipResult.recordset.length > 0) {
            // Get benefits for mentorship plan
            const benefitsResult = await pool
              .request()
              .input("planId", plan.plan_id)
              .query("SELECT benefit_description FROM mentorships_benefits WHERE mentorships_id = @planId");

            return {
              plan_id: plan.plan_id,
              plan_description: plan.plan_description,
              plan_charge: plan.plan_charge,
              plan_type: plan.plan_type,
              mentor_id: plan.mentor_id,
              calls_per_month: mentorshipResult.recordset[0].calls_per_month,
              minutes_per_call: mentorshipResult.recordset[0].minutes_per_call,
              benefits: benefitsResult.recordset.map((b: { benefit_description: string }) => b.benefit_description),
              plan_category: "mentorship" as const,
            };
          }

          // If neither session nor mentorship, return as a basic session plan
          return {
            plan_id: plan.plan_id,
            plan_description: plan.plan_description,
            plan_charge: plan.plan_charge,
            plan_type: plan.plan_type,
            mentor_id: plan.mentor_id,
            sessions_duration: 0,
            plan_category: "session" as const,
          };
        }
      )
    );

    return {
      success: true,
      message: "Plans retrieved successfully",
      plans,
    };
  } catch (error) {
    console.error("Error in getAllPlansService:", error);
    throw error;
  }
};

const getPlanDetailsService = async (
  planId: number
): Promise<{
  success: boolean;
  message: string;
  plan?: Plan;
}> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Get basic plan information
    const planResult = await pool.request().input("planId", planId).query(`
        SELECT plan_id, plan_description, plan_charge, plan_type, mentor_id
        FROM plans
        WHERE plan_id = @planId
      `);

    if (planResult.recordset.length === 0) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    const plan = planResult.recordset[0];

    // Check if this is a session plan
    const sessionResult = await pool
      .request()
      .input("planId", planId)
      .query("SELECT sessions_duration FROM plan_sessions WHERE sessions_id = @planId");

    if (sessionResult.recordset.length > 0) {
      return {
        success: true,
        message: "Plan details retrieved successfully",
        plan: {
          plan_id: plan.plan_id,
          plan_description: plan.plan_description,
          plan_charge: plan.plan_charge,
          plan_type: plan.plan_type,
          mentor_id: plan.mentor_id,
          sessions_duration: sessionResult.recordset[0].sessions_duration,
          plan_category: "session",
        },
      };
    }

    // Check if this is a mentorship plan
    const mentorshipResult = await pool
      .request()
      .input("planId", planId)
      .query("SELECT calls_per_month, minutes_per_call FROM plan_mentorships WHERE mentorships_id = @planId");

    if (mentorshipResult.recordset.length > 0) {
      // Get benefits for mentorship plan
      const benefitsResult = await pool
        .request()
        .input("planId", planId)
        .query("SELECT benefit_description FROM mentorships_benefits WHERE mentorships_id = @planId");

      return {
        success: true,
        message: "Plan details retrieved successfully",
        plan: {
          plan_id: plan.plan_id,
          plan_description: plan.plan_description,
          plan_charge: plan.plan_charge,
          plan_type: plan.plan_type,
          mentor_id: plan.mentor_id,
          calls_per_month: mentorshipResult.recordset[0].calls_per_month,
          minutes_per_call: mentorshipResult.recordset[0].minutes_per_call,
          benefits: benefitsResult.recordset.map((b: { benefit_description: string }) => b.benefit_description),
          plan_category: "mentorship",
        },
      };
    }

    return {
      success: true,
      message: "Plan details retrieved successfully",
      plan,
    };
  } catch (error) {
    console.error("Error in getPlanDetailsService:", error);
    throw error;
  }
};

const createPlanService = async (
  mentorId: number,
  planData: CreatePlanSessionRequest | CreatePlanMentorshipRequest
): Promise<{
  success: boolean;
  message: string;
  planId?: number;
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
      // Insert into plans table
      const planResult = await transaction
        .request()
        .input("planDescription", planData.planDescription)
        .input("planCharge", planData.planCharge)
        .input("planType", planData.planType)
        .input("mentorId", mentorId).query(`
          INSERT INTO plans (plan_description, plan_charge, plan_type, mentor_id)
          OUTPUT INSERTED.plan_id
          VALUES (@planDescription, @planCharge, @planType, @mentorId)
        `);

      const planId = planResult.recordset[0].plan_id;

      // Check if this is a session plan
      if ("sessionsDuration" in planData) {
        await transaction.request().input("planId", planId).input("sessionsDuration", planData.sessionsDuration).query(`
            INSERT INTO plan_sessions (sessions_id, sessions_duration)
            VALUES (@planId, @sessionsDuration)
          `);
      }
      // Check if this is a mentorship plan
      else if ("callsPerMonth" in planData && "minutesPerCall" in planData) {
        await transaction
          .request()
          .input("planId", planId)
          .input("callsPerMonth", planData.callsPerMonth)
          .input("minutesPerCall", planData.minutesPerCall).query(`
            INSERT INTO plan_mentorships (mentorships_id, calls_per_month, minutes_per_call)
            VALUES (@planId, @callsPerMonth, @minutesPerCall)
          `);

        // Insert benefits if provided
        if (planData.benefits && planData.benefits.length > 0) {
          for (const benefit of planData.benefits) {
            await transaction.request().input("planId", planId).input("benefit", benefit).query(`
                INSERT INTO mentorships_benefits (mentorships_id, benefit_description)
                VALUES (@planId, @benefit)
              `);
          }
        }
      } else {
        await transaction.rollback();
        return {
          success: false,
          message: "Invalid plan data: must specify either sessionsDuration or callsPerMonth/minutesPerCall",
        };
      }

      await transaction.commit();

      return {
        success: true,
        message: "Plan created successfully",
        planId,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error in createPlanService:", error);
    throw error;
  }
};

const updatePlanService = async (
  planId: number,
  mentorId: number,
  updateData: UpdatePlanSessionRequest | UpdatePlanMentorshipRequest
): Promise<{
  success: boolean;
  message: string;
}> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Verify plan exists and belongs to mentor
    const planCheck = await pool.request().input("planId", planId).input("mentorId", mentorId).query(`
        SELECT plan_id, mentor_id
        FROM plans
        WHERE plan_id = @planId AND mentor_id = @mentorId
      `);

    if (planCheck.recordset.length === 0) {
      return {
        success: false,
        message: "Plan not found or you don't have permission to update it",
      };
    }

    // Start transaction
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Update plans table if there are basic plan updates
      if (
        updateData.planDescription !== undefined ||
        updateData.planCharge !== undefined ||
        updateData.planType !== undefined
      ) {
        const updateFields: string[] = [];
        const request = transaction.request().input("planId", planId);

        if (updateData.planDescription !== undefined) {
          updateFields.push("plan_description = @planDescription");
          request.input("planDescription", updateData.planDescription);
        }
        if (updateData.planCharge !== undefined) {
          updateFields.push("plan_charge = @planCharge");
          request.input("planCharge", updateData.planCharge);
        }
        if (updateData.planType !== undefined) {
          updateFields.push("plan_type = @planType");
          request.input("planType", updateData.planType);
        }

        if (updateFields.length > 0) {
          await request.query(`
            UPDATE plans
            SET ${updateFields.join(", ")}
            WHERE plan_id = @planId
          `);
        }
      }

      // Update session-specific data
      if ("sessionsDuration" in updateData) {
        // Check if session plan exists
        const sessionCheck = await transaction
          .request()
          .input("planId", planId)
          .query("SELECT sessions_id FROM plan_sessions WHERE sessions_id = @planId");

        if (sessionCheck.recordset.length > 0 && "sessionsDuration" in updateData) {
          await transaction.request().input("planId", planId).input("sessionsDuration", updateData.sessionsDuration)
            .query(`
              UPDATE plan_sessions
              SET sessions_duration = @sessionsDuration
              WHERE sessions_id = @planId
            `);
        }
      }

      // Update mentorship-specific data
      if ("callsPerMonth" in updateData || "minutesPerCall" in updateData) {
        // Check if mentorship plan exists
        const mentorshipCheck = await transaction
          .request()
          .input("planId", planId)
          .query("SELECT mentorships_id FROM plan_mentorships WHERE mentorships_id = @planId");

        if (mentorshipCheck.recordset.length > 0) {
          const updateFields: string[] = [];
          const request = transaction.request().input("planId", planId);

          if ("callsPerMonth" in updateData && updateData.callsPerMonth !== undefined) {
            updateFields.push("calls_per_month = @callsPerMonth");
            request.input("callsPerMonth", updateData.callsPerMonth);
          }
          if ("minutesPerCall" in updateData && updateData.minutesPerCall !== undefined) {
            updateFields.push("minutes_per_call = @minutesPerCall");
            request.input("minutesPerCall", updateData.minutesPerCall);
          }

          if (updateFields.length > 0) {
            await request.query(`
              UPDATE plan_mentorships
              SET ${updateFields.join(", ")}
              WHERE mentorships_id = @planId
            `);
          }
        }
      }

      // Update benefits if provided
      if ("benefits" in updateData) {
        // Check if mentorship plan exists
        const mentorshipCheck = await transaction
          .request()
          .input("planId", planId)
          .query("SELECT mentorships_id FROM plan_mentorships WHERE mentorships_id = @planId");

        if (mentorshipCheck.recordset.length > 0) {
          // Delete existing benefits
          await transaction.request().input("planId", planId).query(`
              DELETE FROM mentorships_benefits
              WHERE mentorships_id = @planId
            `);

          // Insert new benefits
          if ("benefits" in updateData && updateData.benefits && updateData.benefits.length > 0) {
            for (const benefit of updateData.benefits) {
              await transaction.request().input("planId", planId).input("benefit", benefit).query(`
                  INSERT INTO mentorships_benefits (mentorships_id, benefit_description)
                  VALUES (@planId, @benefit)
                `);
            }
          }
        }
      }

      await transaction.commit();

      return {
        success: true,
        message: "Plan updated successfully",
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error in updatePlanService:", error);
    throw error;
  }
};

const deletePlanService = async (
  planId: number,
  mentorId: number
): Promise<{
  success: boolean;
  message: string;
}> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Verify plan exists and belongs to mentor
    const planCheck = await pool.request().input("planId", planId).input("mentorId", mentorId).query(`
        SELECT plan_id, mentor_id
        FROM plans
        WHERE plan_id = @planId AND mentor_id = @mentorId
      `);

    if (planCheck.recordset.length === 0) {
      return {
        success: false,
        message: "Plan not found or you don't have permission to delete it",
      };
    }

    // Check if plan has any bookings
    const bookingCheck = await pool.request().input("planId", planId).query(`
        SELECT COUNT(*) as booking_count
        FROM bookings
        WHERE plan_id = @planId
      `);

    if (bookingCheck.recordset[0].booking_count > 0) {
      return {
        success: false,
        message: "Cannot delete plan with existing bookings",
      };
    }

    // Check if plan has any slots
    const slotCheck = await pool.request().input("planId", planId).query(`
        SELECT COUNT(*) as slot_count
        FROM slots
        WHERE plan_id = @planId
      `);

    if (slotCheck.recordset[0].slot_count > 0) {
      return {
        success: false,
        message: "Cannot delete plan with existing slots",
      };
    }

    // Start transaction
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Delete from plan_sessions if it exists (CASCADE will handle this)
      // Delete from plan_mentorships and mentorships_benefits if they exist (CASCADE will handle this)
      // Finally, delete from plans table
      await transaction.request().input("planId", planId).query(`
          DELETE FROM plans
          WHERE plan_id = @planId
        `);

      await transaction.commit();

      return {
        success: true,
        message: "Plan deleted successfully",
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error in deletePlanService:", error);
    throw error;
  }
};

export {
  getMentorProfileService,
  updateMentorProfileService,
  getMentorsListService,
  getMentorStatsService,
  getAllPlansService,
  getPlanDetailsService,
  createPlanService,
  updatePlanService,
  deletePlanService,
};
