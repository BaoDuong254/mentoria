import sql from "mssql";
import bcrypt from "bcrypt";
import poolPromise from "@/config/database";
import chalk from "chalk";
import envConfig from "@/config/env";

const saltRounds = 10;

// Store user IDs and other IDs after insertion
const userIds: { [key: string]: number } = {};
const categoryIds: number[] = [];
const skillIds: number[] = [];
const companyIds: number[] = [];
const jobTitleIds: number[] = [];
const planIds: { [mentorEmail: string]: number[] } = {};
const discountIds: number[] = [];
const registrationIds: number[] = [];
const invoiceIds: number[] = [];
const notificationIds: number[] = [];

async function clearDatabase() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Clearing existing data..."));

  // Delete in correct order to respect foreign key constraints
  await pool.request().query("DELETE FROM meetings");
  await pool.request().query("DELETE FROM invoices");
  await pool.request().query("DELETE FROM slots");
  await pool.request().query("DELETE FROM bookings");
  await pool.request().query("DELETE FROM plan_registerations");
  await pool.request().query("DELETE FROM discounts");
  await pool.request().query("DELETE FROM mentorships_benefits");
  await pool.request().query("DELETE FROM plan_mentorships");
  await pool.request().query("DELETE FROM plan_sessions");
  await pool.request().query("DELETE FROM plans");
  await pool.request().query("DELETE FROM own_skill");
  await pool.request().query("DELETE FROM set_skill");
  await pool.request().query("DELETE FROM skills");
  await pool.request().query("DELETE FROM categories");
  await pool.request().query("DELETE FROM feedbacks");
  await pool.request().query("DELETE FROM messages");
  await pool.request().query("DELETE FROM work_for");
  await pool.request().query("DELETE FROM job_title");
  await pool.request().query("DELETE FROM companies");
  await pool.request().query("DELETE FROM mentor_languages");
  await pool.request().query("DELETE FROM mentors");
  await pool.request().query("DELETE FROM mentees");
  await pool.request().query("DELETE FROM sended");
  await pool.request().query("DELETE FROM notifications");
  await pool.request().query("DELETE FROM user_social_links");
  await pool.request().query("DELETE FROM users");

  console.log(chalk.green("Database cleared successfully"));
}

async function seedUsers() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding users..."));

  const hashedPassword = await bcrypt.hash("Password123!", saltRounds);

  const users = [
    // Mentors
    {
      email: "john.doe@example.com",
      first_name: "John",
      last_name: "Doe",
      password: hashedPassword,
      sex: "Male",
      avatar_url: "https://i.pravatar.cc/150?img=1",
      country: "United States",
      role: "Mentor",
      timezone: "America/New_York",
      status: "Active",
      is_email_verified: 1,
      provider: "Local",
    },
    {
      email: "sarah.johnson@example.com",
      first_name: "Sarah",
      last_name: "Johnson",
      password: hashedPassword,
      sex: "Female",
      avatar_url: "https://i.pravatar.cc/150?img=5",
      country: "United Kingdom",
      role: "Mentor",
      timezone: "Europe/London",
      status: "Active",
      is_email_verified: 1,
      provider: "Local",
    },
    {
      email: "michael.chen@example.com",
      first_name: "Michael",
      last_name: "Chen",
      password: hashedPassword,
      sex: "Male",
      avatar_url: "https://i.pravatar.cc/150?img=12",
      country: "Singapore",
      role: "Mentor",
      timezone: "Asia/Singapore",
      status: "Active",
      is_email_verified: 1,
      provider: "Local",
    },
    {
      email: "emily.rodriguez@example.com",
      first_name: "Emily",
      last_name: "Rodriguez",
      password: hashedPassword,
      sex: "Female",
      avatar_url: "https://i.pravatar.cc/150?img=9",
      country: "Spain",
      role: "Mentor",
      timezone: "Europe/Madrid",
      status: "Active",
      is_email_verified: 1,
      provider: "Local",
    },
    {
      email: "david.kim@example.com",
      first_name: "David",
      last_name: "Kim",
      password: hashedPassword,
      sex: "Male",
      avatar_url: "https://i.pravatar.cc/150?img=15",
      country: "South Korea",
      role: "Mentor",
      timezone: "Asia/Seoul",
      status: "Active",
      is_email_verified: 1,
      provider: "Local",
    },
    // Mentees
    {
      email: "alice.smith@example.com",
      first_name: "Alice",
      last_name: "Smith",
      password: hashedPassword,
      sex: "Female",
      avatar_url: "https://i.pravatar.cc/150?img=20",
      country: "Canada",
      role: "Mentee",
      timezone: "America/Toronto",
      status: "Active",
      is_email_verified: 1,
      provider: "Local",
    },
    {
      email: "bob.wilson@example.com",
      first_name: "Bob",
      last_name: "Wilson",
      password: hashedPassword,
      sex: "Male",
      avatar_url: "https://i.pravatar.cc/150?img=33",
      country: "Australia",
      role: "Mentee",
      timezone: "Australia/Sydney",
      status: "Active",
      is_email_verified: 1,
      provider: "Local",
    },
    {
      email: "carol.taylor@example.com",
      first_name: "Carol",
      last_name: "Taylor",
      password: hashedPassword,
      sex: "Female",
      avatar_url: "https://i.pravatar.cc/150?img=27",
      country: "Ireland",
      role: "Mentee",
      timezone: "Europe/Dublin",
      status: "Active",
      is_email_verified: 1,
      provider: "Local",
    },
    {
      email: "daniel.brown@example.com",
      first_name: "Daniel",
      last_name: "Brown",
      password: hashedPassword,
      sex: "Male",
      avatar_url: "https://i.pravatar.cc/150?img=51",
      country: "Germany",
      role: "Mentee",
      timezone: "Europe/Berlin",
      status: "Active",
      is_email_verified: 1,
      provider: "Local",
    },
    {
      email: "emma.davis@example.com",
      first_name: "Emma",
      last_name: "Davis",
      password: hashedPassword,
      sex: "Female",
      avatar_url: "https://i.pravatar.cc/150?img=45",
      country: "New Zealand",
      role: "Mentee",
      timezone: "Pacific/Auckland",
      status: "Active",
      is_email_verified: 1,
      provider: "Local",
    },
    // Admin
    {
      email: "admin@mentoria.com",
      first_name: "Admin",
      last_name: "User",
      password: hashedPassword,
      sex: "Male",
      avatar_url: "https://i.pravatar.cc/150?img=68",
      country: "United States",
      role: "Admin",
      timezone: "America/New_York",
      status: "Active",
      is_email_verified: 1,
      provider: "Local",
    },
  ];

  for (const user of users) {
    const result = await pool
      .request()
      .input("first_name", sql.NVarChar, user.first_name)
      .input("last_name", sql.NVarChar, user.last_name)
      .input("email", sql.NVarChar, user.email)
      .input("password", sql.NVarChar, user.password)
      .input("sex", sql.NVarChar, user.sex)
      .input("avatar_url", sql.NVarChar, user.avatar_url)
      .input("country", sql.NVarChar, user.country)
      .input("role", sql.NVarChar, user.role)
      .input("timezone", sql.NVarChar, user.timezone)
      .input("status", sql.NVarChar, user.status)
      .input("is_email_verified", sql.Bit, user.is_email_verified)
      .input("provider", sql.NVarChar, user.provider).query(`
        INSERT INTO users (first_name, last_name, email, password, sex, avatar_url, country, role, timezone, status, is_email_verified, provider)
        OUTPUT INSERTED.user_id
        VALUES (@first_name, @last_name, @email, @password, @sex, @avatar_url, @country, @role, @timezone, @status, @is_email_verified, @provider)
      `);

    if (result.recordset && result.recordset[0]) {
      userIds[user.email] = result.recordset[0].user_id;
    }
  }

  console.log(chalk.green(`${users.length} users seeded successfully`));
}

async function seedUserSocialLinks() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding user social links..."));

  const socialLinks = [
    { email: "john.doe@example.com", link: "https://linkedin.com/in/johndoe", platform: "LinkedIn" },
    { email: "john.doe@example.com", link: "https://github.com/johndoe", platform: "GitHub" },
    { email: "john.doe@example.com", link: "https://twitter.com/johndoe", platform: "Twitter" },
    { email: "sarah.johnson@example.com", link: "https://linkedin.com/in/sarahjohnson", platform: "LinkedIn" },
    { email: "sarah.johnson@example.com", link: "https://github.com/sarahjohnson", platform: "GitHub" },
    { email: "michael.chen@example.com", link: "https://linkedin.com/in/michaelchen", platform: "LinkedIn" },
    { email: "michael.chen@example.com", link: "https://github.com/michaelchen", platform: "GitHub" },
    { email: "emily.rodriguez@example.com", link: "https://linkedin.com/in/emilyrodriguez", platform: "LinkedIn" },
    { email: "david.kim@example.com", link: "https://linkedin.com/in/davidkim", platform: "LinkedIn" },
  ];

  for (const link of socialLinks) {
    const userId = userIds[link.email];
    if (userId) {
      await pool
        .request()
        .input("user_id", sql.Int, userId)
        .input("link", sql.NVarChar, link.link)
        .input("platform", sql.NVarChar, link.platform).query(`
          INSERT INTO user_social_links (user_id, link, platform)
          VALUES (@user_id, @link, @platform)
        `);
    }
  }

  console.log(chalk.green(`${socialLinks.length} social links seeded successfully`));
}

async function seedCategories() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding categories..."));

  const categories = [
    { name: "Software Development", super_category_id: null },
    { name: "Data & Analytics", super_category_id: null },
    { name: "Design", super_category_id: null },
    { name: "Business", super_category_id: null },
    { name: "Career Development", super_category_id: null },
  ];

  for (const category of categories) {
    const result = await pool
      .request()
      .input("category_name", sql.NVarChar, category.name)
      .input("super_category_id", sql.Int, category.super_category_id).query(`
        INSERT INTO categories (category_name, super_category_id)
        OUTPUT INSERTED.category_id
        VALUES (@category_name, @super_category_id)
      `);

    if (result.recordset && result.recordset[0]) {
      categoryIds.push(result.recordset[0].category_id);
    }
  }

  // Add subcategories
  const subcategories = [
    { name: "Web Development", super_category_id: 0 },
    { name: "Mobile Development", super_category_id: 0 },
    { name: "Cloud & DevOps", super_category_id: 0 },
    { name: "Cybersecurity", super_category_id: 0 },
    { name: "Data Science", super_category_id: 1 },
    { name: "Machine Learning", super_category_id: 1 },
    { name: "UI/UX Design", super_category_id: 2 },
    { name: "Product Design", super_category_id: 2 },
    { name: "Marketing", super_category_id: 3 },
    { name: "Sales", super_category_id: 3 },
    { name: "Leadership", super_category_id: 4 },
    { name: "Career Coaching", super_category_id: 4 },
  ];

  for (const subcategory of subcategories) {
    const superCategoryId = categoryIds[subcategory.super_category_id];
    const result = await pool
      .request()
      .input("category_name", sql.NVarChar, subcategory.name)
      .input("super_category_id", sql.Int, superCategoryId).query(`
        INSERT INTO categories (category_name, super_category_id)
        OUTPUT INSERTED.category_id
        VALUES (@category_name, @super_category_id)
      `);

    if (result.recordset && result.recordset[0]) {
      categoryIds.push(result.recordset[0].category_id);
    }
  }

  console.log(chalk.green(`${categoryIds.length} categories seeded successfully`));
}

async function seedSkills() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding skills..."));

  const skills = [
    "React",
    "Node.js",
    "TypeScript",
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "SQL",
    "MongoDB",
    "PostgreSQL",
    "AWS",
    "Azure",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "React Native",
    "Flutter",
    "Swift",
    "Kotlin",
    "Android",
    "Machine Learning",
    "Deep Learning",
    "NLP",
    "Computer Vision",
    "TensorFlow",
    "Figma",
    "Adobe XD",
    "Sketch",
    "Photoshop",
    "Illustrator",
    "SEO",
    "Content Marketing",
    "Social Media",
    "Email Marketing",
    "Analytics",
    "Leadership",
    "Communication",
    "Team Management",
    "Project Management",
    "Agile",
  ];

  for (const skill of skills) {
    const result = await pool.request().input("skill_name", sql.NVarChar, skill).query(`
        INSERT INTO skills (skill_name)
        OUTPUT INSERTED.skill_id
        VALUES (@skill_name)
      `);

    if (result.recordset && result.recordset[0]) {
      skillIds.push(result.recordset[0].skill_id);
    }
  }

  console.log(chalk.green(`${skills.length} skills seeded successfully`));
}

async function seedOwnSkill() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding skill-category relationships..."));

  // Map skills to categories (category index from categoryIds array)
  const relationships = [
    // Web Development category (index 5) - React, Node.js, TypeScript, JavaScript
    { categoryIndex: 5, skillIndexes: [0, 1, 2, 3] },
    // Mobile Development category (index 6) - React Native, Flutter, Swift, Kotlin, Android
    { categoryIndex: 6, skillIndexes: [15, 16, 17, 18, 19] },
    // Cloud & DevOps category (index 7) - AWS, Azure, Docker, Kubernetes, CI/CD
    { categoryIndex: 7, skillIndexes: [10, 11, 12, 13, 14] },
    // Data Science category (index 9) - Python, SQL, MongoDB, PostgreSQL
    { categoryIndex: 9, skillIndexes: [4, 7, 8, 9] },
    // Machine Learning category (index 10) - Machine Learning, Deep Learning, NLP, Computer Vision, TensorFlow
    { categoryIndex: 10, skillIndexes: [20, 21, 22, 23, 24] },
    // UI/UX Design category (index 11) - Figma, Adobe XD, Sketch, Photoshop, Illustrator
    { categoryIndex: 11, skillIndexes: [25, 26, 27, 28, 29] },
    // Marketing category (index 13) - SEO, Content Marketing, Social Media, Email Marketing, Analytics
    { categoryIndex: 13, skillIndexes: [30, 31, 32, 33, 34] },
    // Leadership category (index 15) - Leadership, Communication, Team Management, Project Management, Agile
    { categoryIndex: 15, skillIndexes: [35, 36, 37, 38, 39] },
  ];

  let count = 0;
  for (const rel of relationships) {
    const categoryId = categoryIds[rel.categoryIndex];
    if (categoryId) {
      for (const skillIndex of rel.skillIndexes) {
        const skillId = skillIds[skillIndex];
        if (skillId) {
          await pool.request().input("category_id", sql.Int, categoryId).input("skill_id", sql.Int, skillId).query(`
              INSERT INTO own_skill (category_id, skill_id)
              VALUES (@category_id, @skill_id)
            `);
          count++;
        }
      }
    }
  }

  console.log(chalk.green(`${count} skill-category relationships seeded successfully`));
}

async function seedMentors() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding mentors..."));

  const mentors = [
    {
      email: "john.doe@example.com",
      bio: "Experienced full-stack developer with 10+ years in web development. Specialized in React, Node.js, and cloud architecture. Passionate about helping developers grow their careers.",
      headline: "Senior Full-Stack Developer & Tech Lead",
      response_time: "Within 24 hours",
      cv_url: "https://example.com/cv/johndoe.pdf",
    },
    {
      email: "sarah.johnson@example.com",
      bio: "Product designer with expertise in creating user-centered digital experiences. Worked with startups and Fortune 500 companies.",
      headline: "Lead Product Designer",
      response_time: "Within 12 hours",
      cv_url: "https://example.com/cv/sarahjohnson.pdf",
    },
    {
      email: "michael.chen@example.com",
      bio: "Data scientist and ML engineer specializing in NLP and computer vision. Published researcher and conference speaker.",
      headline: "Senior Data Scientist & ML Engineer",
      response_time: "Within 48 hours",
      cv_url: "https://example.com/cv/michaelchen.pdf",
    },
    {
      email: "emily.rodriguez@example.com",
      bio: "Digital marketing strategist with experience in growth hacking and content marketing. Helped 50+ startups scale.",
      headline: "Growth Marketing Lead",
      response_time: "Within 18 hours",
      cv_url: "https://example.com/cv/emilyrodriguez.pdf",
    },
    {
      email: "david.kim@example.com",
      bio: "Career coach and leadership consultant. Former tech executive with 15+ years of experience guiding professionals.",
      headline: "Career Coach & Leadership Consultant",
      response_time: "Within 24 hours",
      cv_url: "https://example.com/cv/davidkim.pdf",
    },
  ];

  for (const mentor of mentors) {
    const userId = userIds[mentor.email];
    if (userId) {
      await pool
        .request()
        .input("user_id", sql.Int, userId)
        .input("bio", sql.NVarChar, mentor.bio)
        .input("headline", sql.NVarChar, mentor.headline)
        .input("response_time", sql.NVarChar, mentor.response_time)
        .input("cv_url", sql.NVarChar, mentor.cv_url).query(`
          INSERT INTO mentors (user_id, bio, headline, response_time, cv_url)
          VALUES (@user_id, @bio, @headline, @response_time, @cv_url)
        `);
    }
  }

  console.log(chalk.green(`${mentors.length} mentors seeded successfully`));
}

async function seedMentees() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding mentees..."));

  const mentees = [
    { email: "alice.smith@example.com", goal: "Transition to a full-stack developer role within 6 months" },
    { email: "bob.wilson@example.com", goal: "Learn mobile app development and launch my first app" },
    { email: "carol.taylor@example.com", goal: "Break into the UI/UX design field and build a strong portfolio" },
    { email: "daniel.brown@example.com", goal: "Master data science and machine learning for career advancement" },
    { email: "emma.davis@example.com", goal: "Develop leadership skills and prepare for management role" },
  ];

  for (const mentee of mentees) {
    const userId = userIds[mentee.email];
    if (userId) {
      await pool.request().input("user_id", sql.Int, userId).input("goal", sql.NVarChar, mentee.goal).query(`
          INSERT INTO mentees (user_id, goal)
          VALUES (@user_id, @goal)
        `);
    }
  }

  console.log(chalk.green(`${mentees.length} mentees seeded successfully`));
}

async function seedCompanies() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding companies..."));

  const companies = [
    "Google",
    "Microsoft",
    "Amazon",
    "Meta",
    "Apple",
    "Netflix",
    "Tesla",
    "Airbnb",
    "Uber",
    "Stripe",
    "Shopify",
    "Spotify",
  ];

  for (const company of companies) {
    const result = await pool.request().input("cname", sql.NVarChar, company).query(`
        INSERT INTO companies (cname)
        OUTPUT INSERTED.company_id
        VALUES (@cname)
      `);

    if (result.recordset && result.recordset[0]) {
      companyIds.push(result.recordset[0].company_id);
    }
  }

  console.log(chalk.green(`${companies.length} companies seeded successfully`));
}

async function seedJobTitles() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding job titles..."));

  const jobTitles = [
    "Senior Software Engineer",
    "Tech Lead",
    "Lead Product Designer",
    "Senior UX Designer",
    "ML Engineer",
    "Data Scientist",
    "Growth Marketing Manager",
    "Digital Marketing Lead",
    "Engineering Manager",
    "VP of Engineering",
    "Product Manager",
    "DevOps Engineer",
  ];

  for (const jobTitle of jobTitles) {
    const result = await pool.request().input("job_name", sql.NVarChar, jobTitle).query(`
        INSERT INTO job_title (job_name)
        OUTPUT INSERTED.job_title_id
        VALUES (@job_name)
      `);

    if (result.recordset && result.recordset[0]) {
      jobTitleIds.push(result.recordset[0].job_title_id);
    }
  }

  console.log(chalk.green(`${jobTitles.length} job titles seeded successfully`));
}

async function seedWorkFor() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding work experience..."));

  const workExperience = [
    { mentorEmail: "john.doe@example.com", companyIndex: 0, jobTitleIndex: 0 },
    { mentorEmail: "john.doe@example.com", companyIndex: 1, jobTitleIndex: 1 },
    { mentorEmail: "sarah.johnson@example.com", companyIndex: 2, jobTitleIndex: 2 },
    { mentorEmail: "sarah.johnson@example.com", companyIndex: 7, jobTitleIndex: 3 },
    { mentorEmail: "michael.chen@example.com", companyIndex: 3, jobTitleIndex: 4 },
    { mentorEmail: "michael.chen@example.com", companyIndex: 5, jobTitleIndex: 5 },
    { mentorEmail: "emily.rodriguez@example.com", companyIndex: 10, jobTitleIndex: 6 },
    { mentorEmail: "emily.rodriguez@example.com", companyIndex: 8, jobTitleIndex: 7 },
    { mentorEmail: "david.kim@example.com", companyIndex: 4, jobTitleIndex: 8 },
    { mentorEmail: "david.kim@example.com", companyIndex: 9, jobTitleIndex: 9 },
  ];

  for (const work of workExperience) {
    const mentorId = userIds[work.mentorEmail];
    const companyId = companyIds[work.companyIndex];
    const jobTitleId = jobTitleIds[work.jobTitleIndex];

    if (mentorId && companyId && jobTitleId) {
      await pool
        .request()
        .input("mentor_id", sql.Int, mentorId)
        .input("c_company_id", sql.Int, companyId)
        .input("current_job_title_id", sql.Int, jobTitleId).query(`
          INSERT INTO work_for (mentor_id, c_company_id, current_job_title_id)
          VALUES (@mentor_id, @c_company_id, @current_job_title_id)
        `);
    }
  }

  console.log(chalk.green(`${workExperience.length} work experiences seeded successfully`));
}

async function seedSetSkill() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding mentor skills..."));

  const mentorSkills = [
    // John - Web Dev skills: React, Node.js, TypeScript, JavaScript, AWS, Docker
    { mentorEmail: "john.doe@example.com", skillIndexes: [0, 1, 2, 3, 10, 12] },
    // Sarah - Design skills: Figma, Adobe XD, Sketch, Photoshop
    { mentorEmail: "sarah.johnson@example.com", skillIndexes: [25, 26, 27, 28] },
    // Michael - ML/Data skills: Python, Machine Learning, Deep Learning, NLP, TensorFlow
    { mentorEmail: "michael.chen@example.com", skillIndexes: [4, 20, 21, 22, 24] },
    // Emily - Marketing skills: SEO, Content Marketing, Social Media, Email Marketing, Analytics
    { mentorEmail: "emily.rodriguez@example.com", skillIndexes: [30, 31, 32, 33, 34] },
    // David - Leadership skills: Leadership, Communication, Team Management, Project Management
    { mentorEmail: "david.kim@example.com", skillIndexes: [35, 36, 37, 38] },
  ];

  let count = 0;
  for (const mentor of mentorSkills) {
    const mentorId = userIds[mentor.mentorEmail];
    if (mentorId) {
      for (const skillIndex of mentor.skillIndexes) {
        const skillId = skillIds[skillIndex];
        if (skillId) {
          await pool.request().input("mentor_id", sql.Int, mentorId).input("skill_id", sql.Int, skillId).query(`
              INSERT INTO set_skill (mentor_id, skill_id)
              VALUES (@mentor_id, @skill_id)
            `);
          count++;
        }
      }
    }
  }

  console.log(chalk.green(`${count} mentor skills seeded successfully`));
}

async function seedMentorLanguages() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding mentor languages..."));

  const mentorLanguages = [
    { mentorEmail: "john.doe@example.com", languages: ["English", "Spanish"] },
    { mentorEmail: "sarah.johnson@example.com", languages: ["English", "French"] },
    { mentorEmail: "michael.chen@example.com", languages: ["English", "Mandarin", "Cantonese"] },
    { mentorEmail: "emily.rodriguez@example.com", languages: ["English", "Spanish", "Portuguese"] },
    { mentorEmail: "david.kim@example.com", languages: ["English", "Korean", "Japanese"] },
  ];

  for (const mentor of mentorLanguages) {
    const mentorId = userIds[mentor.mentorEmail];
    if (mentorId) {
      for (const language of mentor.languages) {
        await pool.request().input("mentor_id", sql.Int, mentorId).input("mentor_language", sql.NVarChar, language)
          .query(`
            INSERT INTO mentor_languages (mentor_id, mentor_language)
            VALUES (@mentor_id, @mentor_language)
          `);
      }
    }
  }

  console.log(chalk.green("Mentor languages seeded successfully"));
}

async function seedPlans() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding plans..."));

  const plans = [
    // John's plans - Sessions
    {
      mentorEmail: "john.doe@example.com",
      description: "30-minute focused mentorship session covering React, Node.js, and web development best practices",
      charge: 50.0,
      type: "Beginner",
      planCategory: "Session",
      duration: 30,
    },
    {
      mentorEmail: "john.doe@example.com",
      description: "1-hour deep-dive session with code review and architecture discussion",
      charge: 90.0,
      type: "Introductory",
      planCategory: "Session",
      duration: 60,
    },
    {
      mentorEmail: "john.doe@example.com",
      description: "2-hour comprehensive technical consultation with system design review",
      charge: 150.0,
      type: "Introductory",
      planCategory: "Session",
      duration: 120,
    },
    // Sarah's plans - Sessions and Mentorship
    {
      mentorEmail: "sarah.johnson@example.com",
      description: "Portfolio review and UX design consultation session",
      charge: 60.0,
      type: "Beginner",
      planCategory: "Session",
      duration: 30,
    },
    {
      mentorEmail: "sarah.johnson@example.com",
      description: "Monthly mentorship program for aspiring designers - 2 calls per month (60min/call)",
      charge: 199.0,
      type: "Lite",
      planCategory: "Mentorship",
      callsPerMonth: 2,
      callDuration: 60,
    },
    {
      mentorEmail: "sarah.johnson@example.com",
      description: "Comprehensive design mentorship - 4 calls per month (60min/call)",
      charge: 349.0,
      type: "Standard",
      planCategory: "Mentorship",
      callsPerMonth: 4,
      callDuration: 60,
    },
    // Michael's plans
    {
      mentorEmail: "michael.chen@example.com",
      description: "ML/AI consultation session with hands-on guidance",
      charge: 75.0,
      type: "Beginner",
      planCategory: "Session",
      duration: 30,
    },
    {
      mentorEmail: "michael.chen@example.com",
      description: "Advanced machine learning project review and optimization",
      charge: 130.0,
      type: "Introductory",
      planCategory: "Session",
      duration: 60,
    },
    {
      mentorEmail: "michael.chen@example.com",
      description: "ML mentorship with weekly sessions - 4 calls per month (60min/call)",
      charge: 399.0,
      type: "Standard",
      planCategory: "Mentorship",
      callsPerMonth: 4,
      callDuration: 60,
    },
    {
      mentorEmail: "michael.chen@example.com",
      description: "Premium ML mentorship with intensive support - 8 calls per month (60min/call)",
      charge: 699.0,
      type: "Premium",
      planCategory: "Mentorship",
      callsPerMonth: 8,
      callDuration: 60,
    },
    // Emily's plans
    {
      mentorEmail: "emily.rodriguez@example.com",
      description: "Marketing strategy consultation and growth tactics",
      charge: 45.0,
      type: "Beginner",
      planCategory: "Session",
      duration: 30,
    },
    {
      mentorEmail: "emily.rodriguez@example.com",
      description: "Digital marketing mentorship - 2 calls per month (45min/call)",
      charge: 199.0,
      type: "Lite",
      planCategory: "Mentorship",
      callsPerMonth: 2,
      callDuration: 45,
    },
    {
      mentorEmail: "emily.rodriguez@example.com",
      description: "Comprehensive marketing mentorship - 4 calls per month (60min/call)",
      charge: 349.0,
      type: "Standard",
      planCategory: "Mentorship",
      callsPerMonth: 4,
      callDuration: 60,
    },
    // David's plans
    {
      mentorEmail: "david.kim@example.com",
      description: "Career coaching session with resume review",
      charge: 70.0,
      type: "Beginner",
      planCategory: "Session",
      duration: 30,
    },
    {
      mentorEmail: "david.kim@example.com",
      description: "Leadership development and career growth session",
      charge: 120.0,
      type: "Introductory",
      planCategory: "Session",
      duration: 60,
    },
    {
      mentorEmail: "david.kim@example.com",
      description: "Executive leadership mentorship - 2 calls per month (60min/call)",
      charge: 399.0,
      type: "Lite",
      planCategory: "Mentorship",
      callsPerMonth: 2,
      callDuration: 60,
    },
    {
      mentorEmail: "david.kim@example.com",
      description: "Premium leadership coaching - 4 calls per month (90min/call)",
      charge: 799.0,
      type: "Premium",
      planCategory: "Mentorship",
      callsPerMonth: 4,
      callDuration: 90,
    },
  ];

  for (const plan of plans) {
    const mentorId = userIds[plan.mentorEmail];
    if (mentorId) {
      const result = await pool
        .request()
        .input("plan_description", sql.NVarChar, plan.description)
        .input("plan_charge", sql.Decimal(10, 2), plan.charge)
        .input("plan_type", sql.NVarChar, plan.type)
        .input("mentor_id", sql.Int, mentorId).query(`
          INSERT INTO plans (plan_description, plan_charge, plan_type, mentor_id)
          OUTPUT INSERTED.plan_id
          VALUES (@plan_description, @plan_charge, @plan_type, @mentor_id)
        `);

      if (result.recordset && result.recordset[0]) {
        if (!planIds[plan.mentorEmail]) {
          planIds[plan.mentorEmail] = [];
        }
        (planIds[plan.mentorEmail] as number[]).push(result.recordset[0].plan_id);
      }
    }
  }

  console.log(chalk.green(`${plans.length} plans seeded successfully`));
}

async function seedPlanSessions() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding plan sessions..."));

  // Map which plans are sessions (with duration)
  const sessionPlans = [
    { mentorEmail: "john.doe@example.com", planIndex: 0, duration: 30 },
    { mentorEmail: "john.doe@example.com", planIndex: 1, duration: 60 },
    { mentorEmail: "john.doe@example.com", planIndex: 2, duration: 120 },
    { mentorEmail: "sarah.johnson@example.com", planIndex: 0, duration: 30 },
    { mentorEmail: "michael.chen@example.com", planIndex: 0, duration: 30 },
    { mentorEmail: "michael.chen@example.com", planIndex: 1, duration: 60 },
    { mentorEmail: "emily.rodriguez@example.com", planIndex: 0, duration: 30 },
    { mentorEmail: "david.kim@example.com", planIndex: 0, duration: 30 },
    { mentorEmail: "david.kim@example.com", planIndex: 1, duration: 60 },
  ];

  for (const session of sessionPlans) {
    const mentorPlanIds = planIds[session.mentorEmail];
    if (mentorPlanIds) {
      const planId = mentorPlanIds[session.planIndex];
      if (planId) {
        await pool.request().input("sessions_id", sql.Int, planId).input("sessions_duration", sql.Int, session.duration)
          .query(`
            INSERT INTO plan_sessions (sessions_id, sessions_duration)
            VALUES (@sessions_id, @sessions_duration)
          `);
      }
    }
  }

  console.log(chalk.green(`${sessionPlans.length} plan sessions seeded successfully`));
}

async function seedPlanMentorships() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding plan mentorships..."));

  // Map which plans are mentorships
  const mentorshipPlans = [
    { mentorEmail: "sarah.johnson@example.com", planIndex: 1 },
    { mentorEmail: "sarah.johnson@example.com", planIndex: 2 },
    { mentorEmail: "michael.chen@example.com", planIndex: 2 },
    { mentorEmail: "michael.chen@example.com", planIndex: 3 },
    { mentorEmail: "emily.rodriguez@example.com", planIndex: 1 },
    { mentorEmail: "emily.rodriguez@example.com", planIndex: 2 },
    { mentorEmail: "david.kim@example.com", planIndex: 2 },
    { mentorEmail: "david.kim@example.com", planIndex: 3 },
  ];

  for (const mentorship of mentorshipPlans) {
    const mentorPlanIds = planIds[mentorship.mentorEmail];
    if (mentorPlanIds) {
      const planId = mentorPlanIds[mentorship.planIndex];
      if (planId) {
        await pool.request().input("mentorships_id", sql.Int, planId).query(`
            INSERT INTO plan_mentorships (mentorships_id)
            VALUES (@mentorships_id)
          `);
      }
    }
  }

  console.log(chalk.green(`${mentorshipPlans.length} plan mentorships seeded successfully`));
}

async function seedMentorshipsBenefits() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding mentorships benefits..."));

  const benefits = [
    {
      mentorEmail: "sarah.johnson@example.com",
      planIndex: 1,
      benefits: [
        "2 calls per month (60min/call)",
        "Portfolio review and redesign guidance",
        "Email support",
        "Access to design resources",
      ],
    },
    {
      mentorEmail: "sarah.johnson@example.com",
      planIndex: 2,
      benefits: [
        "4 calls per month (60min/call)",
        "Portfolio review and redesign guidance",
        "Unlimited chat support",
        "Access to exclusive design resources",
        "Job application review",
        "Design system consultation",
      ],
    },
    {
      mentorEmail: "michael.chen@example.com",
      planIndex: 2,
      benefits: [
        "4 calls per month (60min/call)",
        "Real-world ML project guidance",
        "Code review and optimization",
        "Research paper discussions",
        "Email support",
      ],
    },
    {
      mentorEmail: "michael.chen@example.com",
      planIndex: 3,
      benefits: [
        "8 calls per month (60min/call)",
        "Real-world ML project guidance",
        "Code review and optimization",
        "Research paper discussions",
        "Career guidance in AI/ML field",
        "Interview preparation",
        "Priority 24/7 chat support",
      ],
    },
    {
      mentorEmail: "emily.rodriguez@example.com",
      planIndex: 1,
      benefits: ["2 calls per month (45min/call)", "Marketing strategy sessions", "Campaign reviews", "Email support"],
    },
    {
      mentorEmail: "emily.rodriguez@example.com",
      planIndex: 2,
      benefits: [
        "4 calls per month (60min/call)",
        "Marketing strategy sessions",
        "Marketing campaign reviews",
        "Analytics and metrics guidance",
        "Content strategy development",
        "Chat and email support",
      ],
    },
    {
      mentorEmail: "david.kim@example.com",
      planIndex: 2,
      benefits: [
        "2 calls per month (60min/call)",
        "Personalized leadership development plan",
        "Resume and LinkedIn review",
        "Email support",
      ],
    },
    {
      mentorEmail: "david.kim@example.com",
      planIndex: 3,
      benefits: [
        "4 calls per month (90min/call)",
        "Personalized leadership development plan",
        "360-degree feedback analysis",
        "Executive presence training",
        "Priority chat support",
        "Access to leadership resources",
        "Networking opportunities",
      ],
    },
  ];

  let totalBenefits = 0;
  for (const item of benefits) {
    const mentorPlanIds = planIds[item.mentorEmail];
    if (mentorPlanIds) {
      const planId = mentorPlanIds[item.planIndex];
      if (planId) {
        for (const benefit of item.benefits) {
          await pool
            .request()
            .input("mentorships_id", sql.Int, planId)
            .input("benefit_description", sql.NVarChar, benefit).query(`
              INSERT INTO mentorships_benefits (mentorships_id, benefit_description)
              VALUES (@mentorships_id, @benefit_description)
            `);
          totalBenefits++;
        }
      }
    }
  }

  console.log(chalk.green(`${totalBenefits} mentorships benefits seeded successfully`));
}

async function seedDiscounts() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding discounts..."));

  const discounts = [
    {
      name: "WELCOME10",
      type: "Percentage",
      value: 10.0,
      start_date: new Date("2024-01-01"),
      end_date: new Date("2025-12-31"),
      status: "Active",
      usage_limit: 100,
      used_count: 15,
    },
    {
      name: "SUMMER25",
      type: "Percentage",
      value: 25.0,
      start_date: new Date("2024-06-01"),
      end_date: new Date("2024-08-31"),
      status: "Inactive",
      usage_limit: 50,
      used_count: 50,
    },
    {
      name: "FIXED20",
      type: "Fixed",
      value: 20.0,
      start_date: new Date("2024-01-01"),
      end_date: new Date("2025-12-31"),
      status: "Active",
      usage_limit: 200,
      used_count: 35,
    },
    {
      name: "EARLYBIRD",
      type: "Percentage",
      value: 15.0,
      start_date: new Date("2024-01-01"),
      end_date: new Date("2024-12-31"),
      status: "Active",
      usage_limit: 75,
      used_count: 20,
    },
    {
      name: "LOYALTY30",
      type: "Percentage",
      value: 30.0,
      start_date: new Date("2024-01-01"),
      end_date: new Date("2025-12-31"),
      status: "Active",
      usage_limit: 25,
      used_count: 5,
    },
  ];

  for (const discount of discounts) {
    const result = await pool
      .request()
      .input("discount_name", sql.NVarChar, discount.name)
      .input("discount_type", sql.NVarChar, discount.type)
      .input("discount_value", sql.Decimal(10, 2), discount.value)
      .input("start_date", sql.DateTime, discount.start_date)
      .input("end_date", sql.DateTime, discount.end_date)
      .input("status", sql.NVarChar, discount.status)
      .input("usage_limit", sql.Int, discount.usage_limit)
      .input("used_count", sql.Int, discount.used_count).query(`
        INSERT INTO discounts (discount_name, discount_type, discount_value, start_date, end_date, status, usage_limit, used_count)
        OUTPUT INSERTED.discount_id
        VALUES (@discount_name, @discount_type, @discount_value, @start_date, @end_date, @status, @usage_limit, @used_count)
      `);

    if (result.recordset && result.recordset[0]) {
      discountIds.push(result.recordset[0].discount_id);
    }
  }

  console.log(chalk.green(`${discounts.length} discounts seeded successfully`));
}

async function seedPlanRegisterations() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding plan registerations..."));

  const registerations = [
    { message: "Looking forward to learning React!", discountIndex: 0 },
    { message: "Excited to work on my portfolio", discountIndex: 0 },
    { message: "Can't wait to dive into machine learning", discountIndex: 2 },
    { message: "Ready to improve my marketing skills", discountIndex: 3 },
    { message: "Seeking career guidance", discountIndex: 0 },
    { message: "Want to master full-stack development", discountIndex: 2 },
    { message: "Interested in leadership mentorship", discountIndex: 4 },
  ];

  for (const reg of registerations) {
    const discountId = discountIds[reg.discountIndex];
    if (discountId) {
      const result = await pool
        .request()
        .input("message", sql.NVarChar, reg.message)
        .input("discount_id", sql.Int, discountId).query(`
          INSERT INTO plan_registerations (message, discount_id)
          OUTPUT INSERTED.registration_id
          VALUES (@message, @discount_id)
        `);

      if (result.recordset && result.recordset[0]) {
        registrationIds.push(result.recordset[0].registration_id);
      }
    }
  }

  console.log(chalk.green(`${registerations.length} plan registerations seeded successfully`));
}

async function seedBookings() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding bookings..."));

  const bookings = [
    { menteeEmail: "alice.smith@example.com", registrationIndex: 0, mentorEmail: "john.doe@example.com", planIndex: 0 },
    { menteeEmail: "alice.smith@example.com", registrationIndex: 1, mentorEmail: "john.doe@example.com", planIndex: 1 },
    {
      menteeEmail: "bob.wilson@example.com",
      registrationIndex: 2,
      mentorEmail: "sarah.johnson@example.com",
      planIndex: 0,
    },
    {
      menteeEmail: "carol.taylor@example.com",
      registrationIndex: 3,
      mentorEmail: "michael.chen@example.com",
      planIndex: 0,
    },
    {
      menteeEmail: "daniel.brown@example.com",
      registrationIndex: 4,
      mentorEmail: "michael.chen@example.com",
      planIndex: 1,
    },
    { menteeEmail: "emma.davis@example.com", registrationIndex: 5, mentorEmail: "david.kim@example.com", planIndex: 0 },
    { menteeEmail: "emma.davis@example.com", registrationIndex: 6, mentorEmail: "david.kim@example.com", planIndex: 1 },
  ];

  for (const booking of bookings) {
    const menteeId = userIds[booking.menteeEmail];
    const registrationId = registrationIds[booking.registrationIndex];
    const mentorPlanIds = planIds[booking.mentorEmail];
    const planId = mentorPlanIds ? mentorPlanIds[booking.planIndex] : undefined;

    if (menteeId && registrationId && planId) {
      await pool
        .request()
        .input("mentee_id", sql.Int, menteeId)
        .input("plan_registerations_id", sql.Int, registrationId)
        .input("plan_id", sql.Int, planId).query(`
          INSERT INTO bookings (mentee_id, plan_registerations_id, plan_id)
          VALUES (@mentee_id, @plan_registerations_id, @plan_id)
        `);
    }
  }

  console.log(chalk.green(`${bookings.length} bookings seeded successfully`));
}

async function seedSlots() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding slots..."));

  // Fetch all mentors with their plans and durations
  const mentorsResult = await pool.request().query(`
    SELECT DISTINCT
      u.user_id,
      u.email,
      p.plan_id,
      ps.sessions_duration,
      pm.minutes_per_call
    FROM users u
    INNER JOIN mentors m ON u.user_id = m.user_id
    INNER JOIN plans p ON m.user_id = p.mentor_id
    LEFT JOIN plan_sessions ps ON p.plan_id = ps.sessions_id
    LEFT JOIN plan_mentorships pm ON p.plan_id = pm.mentorships_id
    WHERE u.role = 'Mentor'
    ORDER BY u.user_id, p.plan_id
  `);

  const mentorPlans: {
    [mentorId: number]: {
      email: string;
      plans: { planId: number; duration: number }[];
    };
  } = {};

  // Organize plans by mentor
  for (const row of mentorsResult.recordset) {
    const mentorId = row.user_id;
    const planId = row.plan_id;

    // Determine duration: for sessions use sessions_duration, for mentorships use minutes_per_call
    const duration = row.sessions_duration || row.minutes_per_call;

    if (!duration) continue; // Skip plans without duration

    if (!mentorPlans[mentorId]) {
      mentorPlans[mentorId] = {
        email: row.email,
        plans: [],
      };
    }

    mentorPlans[mentorId].plans.push({ planId, duration });
  }

  const today = new Date();
  let slotsCount = 0;

  // Time slots configuration (hour, minute pairs)
  const baseTimeSlots = [
    // Morning slots (9 AM - 12 PM)
    { hour: 9, minute: 0 },
    { hour: 10, minute: 0 },
    { hour: 11, minute: 0 },
    // Afternoon slots (1 PM - 5 PM)
    { hour: 13, minute: 0 },
    { hour: 14, minute: 0 },
    { hour: 15, minute: 0 },
    { hour: 16, minute: 0 },
    // Evening slots (6 PM - 8 PM)
    { hour: 18, minute: 0 },
    { hour: 19, minute: 0 },
  ];

  // Helper function to check if two time ranges overlap
  const isOverlapping = (start1: Date, end1: Date, start2: Date, end2: Date): boolean => {
    return start1 < end2 && start2 < end1;
  };

  // Create slots for the next 14 days
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + dayOffset);
    const dateStr = slotDate.toISOString().split("T")[0];

    // Track occupied time slots for each mentor on this day
    const mentorOccupiedSlots: {
      [mentorId: number]: Array<{ start: Date; end: Date }>;
    } = {};

    for (const mentorId in mentorPlans) {
      const mentor = mentorPlans[mentorId];

      if (!mentor) continue;

      // Initialize occupied slots array for this mentor
      if (!mentorOccupiedSlots[parseInt(mentorId)]) {
        mentorOccupiedSlots[parseInt(mentorId)] = [];
      }

      // Shuffle plans to distribute different plan types across time slots
      const shuffledPlans = [...mentor.plans].sort(() => 0.5 - Math.random());

      // For each plan, try to create slots without overlapping
      for (const plan of shuffledPlans) {
        const numSlotsPerPlan = Math.min(2, baseTimeSlots.length); // 2 slots per plan
        let slotsCreated = 0;

        // Try each time slot until we create enough non-overlapping slots
        for (const timeSlot of baseTimeSlots) {
          if (slotsCreated >= numSlotsPerPlan) break;

          const startTime = new Date(slotDate);
          startTime.setHours(timeSlot.hour, timeSlot.minute, 0, 0);

          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + plan.duration);

          // Check if this slot overlaps with any existing slot for this mentor
          const occupied = mentorOccupiedSlots[parseInt(mentorId)];
          if (!occupied) continue;

          let hasOverlap = false;

          for (const existingSlot of occupied) {
            if (isOverlapping(startTime, endTime, existingSlot.start, existingSlot.end)) {
              hasOverlap = true;
              break;
            }
          }

          // If no overlap, create the slot
          if (!hasOverlap) {
            // Determine status: first 2 days have some booked slots
            let status = "Available";
            if (dayOffset === 0 && timeSlot.hour === 9) {
              status = "Booked";
            } else if (dayOffset === 1 && timeSlot.hour === 14) {
              status = "Booked";
            }

            await pool
              .request()
              .input("start_time", sql.DateTime, startTime)
              .input("end_time", sql.DateTime, endTime)
              .input("date", sql.Date, dateStr)
              .input("mentor_id", sql.Int, parseInt(mentorId))
              .input("status", sql.NVarChar, status)
              .input("plan_id", sql.Int, plan.planId).query(`
                INSERT INTO slots (start_time, end_time, date, mentor_id, status, plan_id)
                VALUES (@start_time, @end_time, @date, @mentor_id, @status, @plan_id)
              `);

            // Mark this time slot as occupied
            occupied.push({ start: new Date(startTime), end: new Date(endTime) });
            slotsCount++;
            slotsCreated++;
          }
        }
      }
    }
  }

  console.log(chalk.green(`${slotsCount} slots seeded successfully`));
}

async function seedInvoices() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding invoices..."));

  const invoices = [
    { registrationIndex: 0, menteeEmail: "alice.smith@example.com", amountTotal: 50.0, method: "Credit Card" },
    { registrationIndex: 1, menteeEmail: "alice.smith@example.com", amountTotal: 90.0, method: "PayPal" },
    { registrationIndex: 2, menteeEmail: "bob.wilson@example.com", amountTotal: 60.0, method: "Credit Card" },
    { registrationIndex: 3, menteeEmail: "carol.taylor@example.com", amountTotal: 75.0, method: "Debit Card" },
    { registrationIndex: 4, menteeEmail: "daniel.brown@example.com", amountTotal: 130.0, method: "Credit Card" },
    { registrationIndex: 5, menteeEmail: "emma.davis@example.com", amountTotal: 70.0, method: "PayPal" },
    { registrationIndex: 6, menteeEmail: "emma.davis@example.com", amountTotal: 120.0, method: "Credit Card" },
  ];

  for (const invoice of invoices) {
    const menteeId = userIds[invoice.menteeEmail];
    const registrationId = registrationIds[invoice.registrationIndex];
    if (menteeId && registrationId) {
      const result = await pool
        .request()
        .input("plan_registerations_id", sql.Int, registrationId)
        .input("amount_total", sql.Decimal(10, 2), invoice.amountTotal)
        .input("method", sql.NVarChar, invoice.method)
        .input("mentee_id", sql.Int, menteeId).query(`
          INSERT INTO invoices (plan_registerations_id, amount_total, method, mentee_id)
          OUTPUT INSERTED.invoice_id
          VALUES (@plan_registerations_id, @amount_total, @method, @mentee_id)
        `);

      if (result.recordset && result.recordset[0]) {
        invoiceIds.push(result.recordset[0].invoice_id);
      }
    }
  }

  console.log(chalk.green(`${invoices.length} invoices seeded successfully`));
}

async function seedMeetings() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding meetings..."));

  const meetings = [
    {
      invoiceIndex: 0,
      registrationIndex: 0,
      mentorEmail: "john.doe@example.com",
      status: "Completed",
      location: "https://meet.google.com/abc-defg-hij",
    },
    {
      invoiceIndex: 1,
      registrationIndex: 1,
      mentorEmail: "john.doe@example.com",
      status: "Scheduled",
      location: "https://meet.google.com/klm-nopq-rst",
    },
    {
      invoiceIndex: 2,
      registrationIndex: 2,
      mentorEmail: "sarah.johnson@example.com",
      status: "Scheduled",
      location: "https://zoom.us/j/123456789",
    },
    {
      invoiceIndex: 3,
      registrationIndex: 3,
      mentorEmail: "michael.chen@example.com",
      status: "Completed",
      location: "https://meet.google.com/uvw-xyz-abc",
    },
    {
      invoiceIndex: 4,
      registrationIndex: 4,
      mentorEmail: "michael.chen@example.com",
      status: "Scheduled",
      location: "https://meet.google.com/def-ghi-jkl",
    },
  ];

  for (const meeting of meetings) {
    const invoiceId = invoiceIds[meeting.invoiceIndex];
    const registrationId = registrationIds[meeting.registrationIndex];
    const mentorId = userIds[meeting.mentorEmail];

    if (invoiceId && registrationId && mentorId) {
      // Get a booked slot for this mentor to use for the meeting
      const slotResult = await pool
        .request()
        .input("mentor_id", sql.Int, mentorId)
        .input("status", sql.NVarChar, "Booked").query(`
          SELECT TOP 1 mentor_id, start_time, end_time, date
          FROM slots
          WHERE mentor_id = @mentor_id AND status = @status
          ORDER BY date, start_time
        `);

      if (slotResult.recordset && slotResult.recordset.length > 0) {
        const slot = slotResult.recordset[0];

        await pool
          .request()
          .input("invoice_id", sql.Int, invoiceId)
          .input("plan_registerations_id", sql.Int, registrationId)
          .input("status", sql.NVarChar, meeting.status)
          .input("location", sql.NVarChar, meeting.location)
          .input("start_time", sql.DateTime, slot.start_time)
          .input("end_time", sql.DateTime, slot.end_time)
          .input("date", sql.Date, slot.date)
          .input("mentor_id", sql.Int, slot.mentor_id).query(`
            INSERT INTO meetings (invoice_id, plan_registerations_id, status, location, start_time, end_time, date, mentor_id)
            VALUES (@invoice_id, @plan_registerations_id, @status, @location, @start_time, @end_time, @date, @mentor_id)
          `);
      } else {
        console.log(chalk.yellow(`No booked slot found for mentor ${meeting.mentorEmail}`));
      }
    }
  }

  console.log(chalk.green(`${meetings.length} meetings seeded successfully`));
}

async function seedFeedbacks() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding feedbacks..."));

  const feedbacks = [
    {
      menteeEmail: "alice.smith@example.com",
      mentorEmail: "john.doe@example.com",
      stars: 5,
      content:
        "Excellent mentor! John really helped me understand React hooks and gave me practical examples. Highly recommend!",
    },
    {
      menteeEmail: "bob.wilson@example.com",
      mentorEmail: "sarah.johnson@example.com",
      stars: 5,
      content: "Sarah provided amazing insights into UX design. Her portfolio review was detailed and actionable.",
    },
    {
      menteeEmail: "carol.taylor@example.com",
      mentorEmail: "michael.chen@example.com",
      stars: 5,
      content:
        "Michael's knowledge of machine learning is exceptional. He explained complex concepts in a way I could understand.",
    },
    {
      menteeEmail: "daniel.brown@example.com",
      mentorEmail: "michael.chen@example.com",
      stars: 4,
      content:
        "Great session on data science. Would have loved more time to discuss specific projects, but overall very helpful.",
    },
    {
      menteeEmail: "emma.davis@example.com",
      mentorEmail: "david.kim@example.com",
      stars: 5,
      content:
        "David's career coaching was transformative. He helped me identify my strengths and create a clear career path.",
    },
  ];

  for (const feedback of feedbacks) {
    const menteeId = userIds[feedback.menteeEmail];
    const mentorId = userIds[feedback.mentorEmail];

    if (menteeId && mentorId) {
      await pool
        .request()
        .input("mentee_id", sql.Int, menteeId)
        .input("mentor_id", sql.Int, mentorId)
        .input("stars", sql.Int, feedback.stars)
        .input("content", sql.NVarChar, feedback.content).query(`
          INSERT INTO feedbacks (mentee_id, mentor_id, stars, content)
          VALUES (@mentee_id, @mentor_id, @stars, @content)
        `);
    }
  }

  console.log(chalk.green(`${feedbacks.length} feedbacks seeded successfully`));
}

async function seedNotifications() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding notifications..."));

  const notifications = [
    {
      title: "Welcome to Mentoria!",
      content: "Thank you for joining our mentorship platform. Start exploring mentors today!",
    },
    {
      title: "Session Reminder",
      content: "You have an upcoming session scheduled for tomorrow. Please check your dashboard.",
    },
    {
      title: "New Message",
      content: "You have received a new message from your mentor.",
    },
    {
      title: "Session Completed",
      content: "Your session has been completed. Please leave a review for your mentor.",
    },
    {
      title: "Payment Successful",
      content: "Your payment has been processed successfully. Thank you!",
    },
  ];

  for (const notification of notifications) {
    const result = await pool
      .request()
      .input("title", sql.NVarChar, notification.title)
      .input("content", sql.NVarChar, notification.content).query(`
        INSERT INTO notifications (title, content)
        OUTPUT INSERTED.no_id
        VALUES (@title, @content)
      `);

    if (result.recordset && result.recordset[0]) {
      notificationIds.push(result.recordset[0].no_id);
    }
  }

  console.log(chalk.green(`${notifications.length} notifications seeded successfully`));
}

async function seedSended() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding notification sends..."));

  const sends = [
    { userEmail: "alice.smith@example.com", notificationIndex: 0 },
    { userEmail: "bob.wilson@example.com", notificationIndex: 0 },
    { userEmail: "carol.taylor@example.com", notificationIndex: 0 },
    { userEmail: "daniel.brown@example.com", notificationIndex: 0 },
    { userEmail: "emma.davis@example.com", notificationIndex: 0 },
    { userEmail: "alice.smith@example.com", notificationIndex: 1 },
    { userEmail: "bob.wilson@example.com", notificationIndex: 1 },
    { userEmail: "alice.smith@example.com", notificationIndex: 3 },
    { userEmail: "carol.taylor@example.com", notificationIndex: 3 },
  ];

  for (const send of sends) {
    const userId = userIds[send.userEmail];
    const notificationId = notificationIds[send.notificationIndex];
    if (userId && notificationId) {
      await pool.request().input("u_user_id", sql.Int, userId).input("n_no_id", sql.Int, notificationId).query(`
          INSERT INTO sended (u_user_id, n_no_id)
          VALUES (@u_user_id, @n_no_id)
        `);
    }
  }

  console.log(chalk.green(`${sends.length} notification sends seeded successfully`));
}

async function seedMessages() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding messages..."));

  const messages = [
    {
      senderEmail: "alice.smith@example.com",
      receiverEmail: "john.doe@example.com",
      content: "Hi John! Looking forward to our session tomorrow. Any preparation needed?",
    },
    {
      senderEmail: "john.doe@example.com",
      receiverEmail: "alice.smith@example.com",
      content: "Hi Alice! No special preparation needed. Just bring any specific questions you have about React.",
    },
    {
      senderEmail: "bob.wilson@example.com",
      receiverEmail: "sarah.johnson@example.com",
      content: "Thank you for the great session! The portfolio feedback was very helpful.",
    },
    {
      senderEmail: "sarah.johnson@example.com",
      receiverEmail: "bob.wilson@example.com",
      content: "You're welcome! Keep working on those improvements and feel free to reach out anytime.",
    },
    {
      senderEmail: "carol.taylor@example.com",
      receiverEmail: "michael.chen@example.com",
      content: "Could we schedule a follow-up session to discuss the ML project implementation?",
    },
    {
      senderEmail: "michael.chen@example.com",
      receiverEmail: "carol.taylor@example.com",
      content: "Sure! Check my available slots and book a time that works for you.",
    },
  ];

  for (const message of messages) {
    const senderId = userIds[message.senderEmail];
    const receiverId = userIds[message.receiverEmail];

    if (senderId && receiverId) {
      await pool
        .request()
        .input("content", sql.NVarChar, message.content)
        .input("sender_id", sql.Int, senderId)
        .input("receiver_id", sql.Int, receiverId).query(`
          INSERT INTO messages (content, sender_id, receiver_id)
          VALUES (@content, @sender_id, @receiver_id)
        `);
    }
  }

  console.log(chalk.green(`${messages.length} messages seeded successfully`));
}

async function seed() {
  try {
    console.log(chalk.blue("\n🌱 Starting database seeding...\n"));

    // Check if DB_INIT is enabled
    if (!envConfig.DB_INIT) {
      console.log(chalk.yellow("⚠️  DB_INIT is set to false. Skipping database seeding."));
      console.log(chalk.cyan("To enable seeding, set DB_INIT=true in your .env file.\n"));
      process.exit(0);
    }

    await clearDatabase();
    await seedUsers();
    await seedUserSocialLinks();
    await seedCategories();
    await seedSkills();
    await seedOwnSkill();
    await seedMentors();
    await seedMentees();
    await seedCompanies();
    await seedJobTitles();
    await seedWorkFor();
    await seedSetSkill();
    await seedMentorLanguages();
    await seedPlans();
    await seedPlanSessions();
    await seedPlanMentorships();
    await seedMentorshipsBenefits();
    await seedDiscounts();
    await seedPlanRegisterations();
    await seedBookings();
    await seedSlots();
    await seedInvoices();
    await seedMeetings();
    await seedFeedbacks();
    await seedNotifications();
    await seedSended();
    await seedMessages();

    console.log(chalk.blue("\n✅ Database seeding completed successfully!\n"));
    console.log(chalk.cyan("Summary:"));
    console.log(chalk.cyan("- 11 Users (5 Mentors, 5 Mentees, 1 Admin)"));
    console.log(chalk.cyan("- 17 Categories (5 main, 12 subcategories)"));
    console.log(chalk.cyan("- 40 Skills"));
    console.log(chalk.cyan("- 12 Companies & 12 Job Titles"));
    console.log(chalk.cyan("- 13 Plans (9 Sessions, 4 Mentorships)"));
    console.log(chalk.cyan("- 5 Discounts & 7 Bookings"));
    console.log(chalk.cyan("- Multiple Meetings, Feedbacks, and Messages"));
    console.log(chalk.cyan("\nDefault password for all users: Password123!\n"));

    process.exit(0);
  } catch (error) {
    console.error(chalk.red("Error seeding database:"), error);
    process.exit(1);
  }
}

seed();
