import type { MentorProfile, UpdateMentorProfileRequest } from "@/types";

export const mapMentorToProfileData = (mentor: MentorProfile | null): UpdateMentorProfileRequest => {
  if (!mentor) {
    return {
      firstName: "",
      lastName: "",
      sex: "Male",
      avatarUrl: "",
      country: "",
      timezone: "",
      bio: "",
      headline: "",
      responseTime: "",
      cvUrl: "",
      bankName: "",
      accountNumber: "",
      accountHolderName: "",
      bankBranch: "",
      swiftCode: "",
      socialLinks: [],
      companies: [{ companyName: "", jobTitleName: "" }],
      languages: [],
      skillIds: [],
    };
  }

  return {
    firstName: mentor.first_name,
    lastName: mentor.last_name,
    sex: mentor.sex,
    country: mentor.country,
    avatarUrl: mentor.avatar_url,
    timezone: mentor.timezone,
    bio: mentor.bio,
    headline: mentor.headline,
    responseTime: mentor.response_time,
    cvUrl: mentor.cv_url,

    bankName: mentor.bank_name,
    accountNumber: mentor.account_number,
    accountHolderName: mentor.account_holder_name,
    bankBranch: mentor.bank_branch,
    swiftCode: mentor.swift_code,

    socialLinks: mentor.social_links.map((s) => ({
      link: s.link,
      platform: s.platform,
    })),

    companies:
      mentor.companies.length > 0
        ? mentor.companies.map((c) => ({
            companyName: c.company_name,
            jobTitleName: c.job_name,
          }))
        : [{ companyName: "", jobTitleName: "" }],

    languages: mentor.languages,
    skillIds: mentor.skills.map((s) => s.skill_id),
  };
};
