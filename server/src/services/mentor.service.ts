import poolPromise from "@/config/database";
import { MentorProfile } from "@/types/mentor.type";

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

export { getMentorProfileService };
