export interface UpdateMentorProfileRequest {
  firstName: string;
  lastName: string;
  sex: string;
  country: string;
  avatarUrl: string;
  timezone: string;
  bio: string;
  headline: string;
  responseTime: string;
  cvUrl: string;
  // Bank Info
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  bankBranch: string;
  swiftCode: string;
  // Socials
  socialLinks: { link: string; platform: string }[];
  // Work
  companies: { companyName: string; jobTitleName: string }[];
  // Skills & Languages
  languages: string[];
  skillIds: number[];
}
