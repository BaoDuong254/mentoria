import sql from "mssql";
import bcrypt from "bcrypt";
import poolPromise from "@/config/database";
import chalk from "chalk";
import envConfig from "@/config/env";

const saltRounds = 10;

// Store user IDs and other IDs after insertion
const userIds: { [key: string]: number } = {};
const fieldIds: number[] = [];
const companyIds: number[] = [];
const planIds: { [mentorEmail: string]: number[] } = {};
const invoiceIds: number[] = [];
const notificationIds: number[] = [];

async function clearDatabase() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Clearing existing data..."));

  // Delete in correct order to respect foreign key constraints
  await pool.request().query("DELETE FROM feedbacks");
  await pool.request().query("DELETE FROM messages");
  await pool.request().query("DELETE FROM sessions");
  await pool.request().query("DELETE FROM slots");
  await pool.request().query("DELETE FROM plan_benefits");
  await pool.request().query("DELETE FROM plans");
  await pool.request().query("DELETE FROM mentor_languages");
  await pool.request().query("DELETE FROM own_field");
  await pool.request().query("DELETE FROM have_field");
  await pool.request().query("DELETE FROM work_for");
  await pool.request().query("DELETE FROM companies");
  await pool.request().query("DELETE FROM invoices");
  await pool.request().query("DELETE FROM sended");
  await pool.request().query("DELETE FROM notifications");
  await pool.request().query("DELETE FROM user_social_links");
  await pool.request().query("DELETE FROM mentors");
  await pool.request().query("DELETE FROM mentees");
  await pool.request().query("DELETE FROM fields");
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

async function seedFields() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding fields..."));

  const fields = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning",
    "Cloud Computing",
    "DevOps",
    "Cybersecurity",
    "UI/UX Design",
    "Product Management",
    "Business Strategy",
    "Marketing",
    "Sales",
    "Career Coaching",
    "Leadership",
    "Entrepreneurship",
  ];

  for (const field of fields) {
    const result = await pool.request().input("name", sql.NVarChar, field).query(`
        INSERT INTO fields (name)
        OUTPUT INSERTED.field_id
        VALUES (@name)
      `);

    if (result.recordset && result.recordset[0]) {
      fieldIds.push(result.recordset[0].field_id);
    }
  }

  console.log(chalk.green(`${fields.length} fields seeded successfully`));
}

async function seedHaveField() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding field relationships..."));

  const relationships = [
    { field_id_1: 0, field_id_2: 1 }, // Web Dev & Mobile Dev
    { field_id_1: 0, field_id_2: 7 }, // Web Dev & UI/UX
    { field_id_1: 1, field_id_2: 7 }, // Mobile Dev & UI/UX
    { field_id_1: 2, field_id_2: 3 }, // Data Science & Machine Learning
    { field_id_1: 4, field_id_2: 5 }, // Cloud Computing & DevOps
    { field_id_1: 8, field_id_2: 9 }, // Product Management & Business Strategy
    { field_id_1: 9, field_id_2: 10 }, // Business Strategy & Marketing
    { field_id_1: 12, field_id_2: 13 }, // Career Coaching & Leadership
  ];

  for (const rel of relationships) {
    const fieldId1 = fieldIds[rel.field_id_1];
    const fieldId2 = fieldIds[rel.field_id_2];

    if (fieldId1 && fieldId2 && fieldId1 < fieldId2) {
      await pool.request().input("field_id_1", sql.Int, fieldId1).input("field_id_2", sql.Int, fieldId2).query(`
          INSERT INTO have_field (field_id_1, field_id_2)
          VALUES (@field_id_1, @field_id_2)
        `);
    }
  }

  console.log(chalk.green(`${relationships.length} field relationships seeded successfully`));
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
      response_time: 24,
      total_reviews: 45,
      total_stars: 215,
      total_mentee: 120,
      cv_url: "https://example.com/cv/johndoe.pdf",
    },
    {
      email: "sarah.johnson@example.com",
      bio: "Product designer with expertise in creating user-centered digital experiences. Worked with startups and Fortune 500 companies.",
      headline: "Lead Product Designer",
      response_time: 12,
      total_reviews: 38,
      total_stars: 185,
      total_mentee: 95,
      cv_url: "https://example.com/cv/sarahjohnson.pdf",
    },
    {
      email: "michael.chen@example.com",
      bio: "Data scientist and ML engineer specializing in NLP and computer vision. Published researcher and conference speaker.",
      headline: "Senior Data Scientist & ML Engineer",
      response_time: 48,
      total_reviews: 52,
      total_stars: 248,
      total_mentee: 140,
      cv_url: "https://example.com/cv/michaelchen.pdf",
    },
    {
      email: "emily.rodriguez@example.com",
      bio: "Digital marketing strategist with experience in growth hacking and content marketing. Helped 50+ startups scale.",
      headline: "Growth Marketing Lead",
      response_time: 18,
      total_reviews: 31,
      total_stars: 148,
      total_mentee: 78,
      cv_url: "https://example.com/cv/emilyrodriguez.pdf",
    },
    {
      email: "david.kim@example.com",
      bio: "Career coach and leadership consultant. Former tech executive with 15+ years of experience guiding professionals.",
      headline: "Career Coach & Leadership Consultant",
      response_time: 24,
      total_reviews: 67,
      total_stars: 325,
      total_mentee: 200,
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
        .input("response_time", sql.Int, mentor.response_time)
        .input("total_reviews", sql.Int, mentor.total_reviews)
        .input("total_stars", sql.Int, mentor.total_stars)
        .input("total_mentee", sql.Int, mentor.total_mentee)
        .input("cv_url", sql.NVarChar, mentor.cv_url).query(`
          INSERT INTO mentors (user_id, bio, headline, response_time, total_reviews, total_stars, total_mentee, cv_url)
          VALUES (@user_id, @bio, @headline, @response_time, @total_reviews, @total_stars, @total_mentee, @cv_url)
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

async function seedWorkFor() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding work experience..."));

  const workExperience = [
    { mentorEmail: "john.doe@example.com", companyIndex: 0, role: "Senior Software Engineer" },
    { mentorEmail: "john.doe@example.com", companyIndex: 1, role: "Tech Lead" },
    { mentorEmail: "sarah.johnson@example.com", companyIndex: 2, role: "Lead Product Designer" },
    { mentorEmail: "sarah.johnson@example.com", companyIndex: 7, role: "Senior UX Designer" },
    { mentorEmail: "michael.chen@example.com", companyIndex: 3, role: "ML Engineer" },
    { mentorEmail: "michael.chen@example.com", companyIndex: 5, role: "Data Scientist" },
    { mentorEmail: "emily.rodriguez@example.com", companyIndex: 10, role: "Growth Marketing Manager" },
    { mentorEmail: "emily.rodriguez@example.com", companyIndex: 8, role: "Digital Marketing Lead" },
    { mentorEmail: "david.kim@example.com", companyIndex: 4, role: "Engineering Manager" },
    { mentorEmail: "david.kim@example.com", companyIndex: 9, role: "VP of Engineering" },
  ];

  for (const work of workExperience) {
    const mentorId = userIds[work.mentorEmail];
    const companyId = companyIds[work.companyIndex];

    if (mentorId && companyId) {
      await pool
        .request()
        .input("mentor_id", sql.Int, mentorId)
        .input("c_company_id", sql.Int, companyId)
        .input("crole", sql.NVarChar, work.role).query(`
          INSERT INTO work_for (mentor_id, c_company_id, crole)
          VALUES (@mentor_id, @c_company_id, @crole)
        `);
    }
  }

  console.log(chalk.green(`${workExperience.length} work experiences seeded successfully`));
}

async function seedOwnField() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding mentor fields..."));

  const mentorFields = [
    { mentorEmail: "john.doe@example.com", fieldIndexes: [0, 1, 4, 5] }, // John - Web, Mobile, Cloud, DevOps
    { mentorEmail: "sarah.johnson@example.com", fieldIndexes: [7, 8] }, // Sarah - UI/UX, Product Management
    { mentorEmail: "michael.chen@example.com", fieldIndexes: [2, 3] }, // Michael - Data Science, ML
    { mentorEmail: "emily.rodriguez@example.com", fieldIndexes: [9, 10, 11] }, // Emily - Business, Marketing, Sales
    { mentorEmail: "david.kim@example.com", fieldIndexes: [12, 13, 14] }, // David - Career, Leadership, Entrepreneurship
  ];

  for (const mentor of mentorFields) {
    const mentorId = userIds[mentor.mentorEmail];
    if (mentorId) {
      for (const fieldIndex of mentor.fieldIndexes) {
        const fieldId = fieldIds[fieldIndex];
        if (fieldId) {
          await pool.request().input("mentor_id", sql.Int, mentorId).input("f_field_id", sql.Int, fieldId).query(`
              INSERT INTO own_field (mentor_id, f_field_id)
              VALUES (@mentor_id, @f_field_id)
            `);
        }
      }
    }
  }

  console.log(chalk.green("Mentor fields seeded successfully"));
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
    // John's plans
    { mentorEmail: "john.doe@example.com", charge: 50.0, duration: 30 },
    { mentorEmail: "john.doe@example.com", charge: 90.0, duration: 60 },
    { mentorEmail: "john.doe@example.com", charge: 150.0, duration: 120 },
    // Sarah's plans
    { mentorEmail: "sarah.johnson@example.com", charge: 60.0, duration: 30 },
    { mentorEmail: "sarah.johnson@example.com", charge: 100.0, duration: 60 },
    // Michael's plans
    { mentorEmail: "michael.chen@example.com", charge: 75.0, duration: 30 },
    { mentorEmail: "michael.chen@example.com", charge: 130.0, duration: 60 },
    { mentorEmail: "michael.chen@example.com", charge: 200.0, duration: 120 },
    // Emily's plans
    { mentorEmail: "emily.rodriguez@example.com", charge: 45.0, duration: 30 },
    { mentorEmail: "emily.rodriguez@example.com", charge: 80.0, duration: 60 },
    // David's plans
    { mentorEmail: "david.kim@example.com", charge: 70.0, duration: 30 },
    { mentorEmail: "david.kim@example.com", charge: 120.0, duration: 60 },
    { mentorEmail: "david.kim@example.com", charge: 180.0, duration: 90 },
  ];

  for (const plan of plans) {
    const mentorId = userIds[plan.mentorEmail];
    if (mentorId) {
      const result = await pool
        .request()
        .input("charge", sql.Decimal(10, 2), plan.charge)
        .input("duration", sql.Int, plan.duration)
        .input("mentor_id", sql.Int, mentorId).query(`
          INSERT INTO plans (charge, duration, mentor_id)
          OUTPUT INSERTED.plan_id
          VALUES (@charge, @duration, @mentor_id)
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

async function seedPlanBenefits() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding plan benefits..."));

  const benefits = [
    // John's plans
    {
      mentorEmail: "john.doe@example.com",
      planIndex: 0,
      benefits: ["1-on-1 video call", "Code review", "Career advice"],
    },
    {
      mentorEmail: "john.doe@example.com",
      planIndex: 1,
      benefits: [
        "Extended 1-on-1 video call",
        "Detailed code review",
        "Architecture discussion",
        "Follow-up resources",
      ],
    },
    {
      mentorEmail: "john.doe@example.com",
      planIndex: 2,
      benefits: [
        "Deep-dive technical session",
        "Complete project review",
        "System design consultation",
        "30-day email support",
      ],
    },
    // Sarah's plans
    {
      mentorEmail: "sarah.johnson@example.com",
      planIndex: 0,
      benefits: ["Design portfolio review", "UX best practices", "Tool recommendations"],
    },
    {
      mentorEmail: "sarah.johnson@example.com",
      planIndex: 1,
      benefits: ["Comprehensive design critique", "User research guidance", "Case study development"],
    },
    // Michael's plans
    {
      mentorEmail: "michael.chen@example.com",
      planIndex: 0,
      benefits: ["ML model consultation", "Data pipeline advice"],
    },
    {
      mentorEmail: "michael.chen@example.com",
      planIndex: 1,
      benefits: ["In-depth ML project review", "Algorithm optimization", "Research paper guidance"],
    },
    {
      mentorEmail: "michael.chen@example.com",
      planIndex: 2,
      benefits: [
        "Complete ML system design",
        "Production deployment strategy",
        "Performance tuning",
        "Code implementation review",
      ],
    },
    // Emily's plans
    {
      mentorEmail: "emily.rodriguez@example.com",
      planIndex: 0,
      benefits: ["Marketing strategy review", "Growth tactics"],
    },
    {
      mentorEmail: "emily.rodriguez@example.com",
      planIndex: 1,
      benefits: ["Comprehensive marketing plan", "Channel optimization", "Analytics setup"],
    },
    // David's plans
    {
      mentorEmail: "david.kim@example.com",
      planIndex: 0,
      benefits: ["Career roadmap discussion", "Resume review"],
    },
    {
      mentorEmail: "david.kim@example.com",
      planIndex: 1,
      benefits: ["Career strategy session", "Interview preparation", "Salary negotiation tips"],
    },
    {
      mentorEmail: "david.kim@example.com",
      planIndex: 2,
      benefits: [
        "Leadership development plan",
        "Team management coaching",
        "Executive presence training",
        "90-day action plan",
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
          await pool.request().input("plan_id", sql.Int, planId).input("plan_benefit", sql.NVarChar, benefit).query(`
              INSERT INTO plan_benefits (plan_id, plan_benefit)
              VALUES (@plan_id, @plan_benefit)
            `);
          totalBenefits++;
        }
      }
    }
  }

  console.log(chalk.green(`${totalBenefits} plan benefits seeded successfully`));
}

async function seedSlots() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding slots..."));

  const mentorEmails = [
    "john.doe@example.com",
    "sarah.johnson@example.com",
    "michael.chen@example.com",
    "emily.rodriguez@example.com",
    "david.kim@example.com",
  ];

  const today = new Date();
  let slotsCount = 0;

  // Create slots for the next 14 days
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + dayOffset);
    const dateStr = slotDate.toISOString().split("T")[0];

    for (const mentorEmail of mentorEmails) {
      const mentorId = userIds[mentorEmail];
      if (!mentorId) continue;

      // Morning slots (9 AM - 12 PM)
      for (let hour = 9; hour <= 11; hour++) {
        const timeStr = `${hour.toString().padStart(2, "0")}:00:00`;
        await pool
          .request()
          .input("mentor_id", sql.Int, mentorId)
          .input("slot_date", sql.Date, dateStr)
          .input("start_time", sql.VarChar, timeStr)
          .input("slot_status", sql.NVarChar, dayOffset < 2 ? "Booked" : "Available").query(`
            INSERT INTO slots (mentor_id, slot_date, start_time, slot_status)
            VALUES (@mentor_id, @slot_date, CAST(@start_time AS TIME), @slot_status)
          `);
        slotsCount++;
      }

      // Afternoon slots (2 PM - 5 PM)
      for (let hour = 14; hour <= 16; hour++) {
        const timeStr = `${hour.toString().padStart(2, "0")}:00:00`;
        await pool
          .request()
          .input("mentor_id", sql.Int, mentorId)
          .input("slot_date", sql.Date, dateStr)
          .input("start_time", sql.VarChar, timeStr)
          .input("slot_status", sql.NVarChar, dayOffset < 3 && hour === 14 ? "Booked" : "Available").query(`
            INSERT INTO slots (mentor_id, slot_date, start_time, slot_status)
            VALUES (@mentor_id, @slot_date, CAST(@start_time AS TIME), @slot_status)
          `);
        slotsCount++;
      }

      // Evening slots (6 PM - 8 PM)
      for (let hour = 18; hour <= 19; hour++) {
        const timeStr = `${hour.toString().padStart(2, "0")}:00:00`;
        await pool
          .request()
          .input("mentor_id", sql.Int, mentorId)
          .input("slot_date", sql.Date, dateStr)
          .input("start_time", sql.VarChar, timeStr)
          .input("slot_status", sql.NVarChar, "Available").query(`
            INSERT INTO slots (mentor_id, slot_date, start_time, slot_status)
            VALUES (@mentor_id, @slot_date, CAST(@start_time AS TIME), @slot_status)
          `);
        slotsCount++;
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
    { menteeEmail: "alice.smith@example.com", amount: 50.0 },
    { menteeEmail: "alice.smith@example.com", amount: 90.0 },
    { menteeEmail: "bob.wilson@example.com", amount: 60.0 },
    { menteeEmail: "carol.taylor@example.com", amount: 75.0 },
    { menteeEmail: "daniel.brown@example.com", amount: 130.0 },
    { menteeEmail: "emma.davis@example.com", amount: 70.0 },
    { menteeEmail: "emma.davis@example.com", amount: 120.0 },
  ];

  for (const invoice of invoices) {
    const menteeId = userIds[invoice.menteeEmail];
    if (menteeId) {
      const result = await pool
        .request()
        .input("mentee_id", sql.Int, menteeId)
        .input("amount", sql.Decimal(10, 2), invoice.amount).query(`
          INSERT INTO invoices (mentee_id, amount)
          OUTPUT INSERTED.invoice_id
          VALUES (@mentee_id, @amount)
        `);

      if (result.recordset && result.recordset[0]) {
        invoiceIds.push(result.recordset[0].invoice_id);
      }
    }
  }

  console.log(chalk.green(`${invoices.length} invoices seeded successfully`));
}

async function seedSessions() {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error("Database connection failed");
  }

  console.log(chalk.yellow("Seeding sessions..."));

  const sessions = [
    {
      mentorEmail: "john.doe@example.com",
      menteeEmail: "alice.smith@example.com",
      planIndex: 0,
      invoiceIndex: 0,
      session_status: "Completed",
      session_location: "https://meet.google.com/abc-defg-hij",
      discuss_info: "Introduction to React hooks and state management",
    },
    {
      mentorEmail: "john.doe@example.com",
      menteeEmail: "alice.smith@example.com",
      planIndex: 1,
      invoiceIndex: 1,
      session_status: "Scheduled",
      session_location: "https://meet.google.com/klm-nopq-rst",
      discuss_info: "Deep dive into Node.js and Express",
    },
    {
      mentorEmail: "sarah.johnson@example.com",
      menteeEmail: "bob.wilson@example.com",
      planIndex: 0,
      invoiceIndex: 2,
      session_status: "Scheduled",
      session_location: "https://zoom.us/j/123456789",
      discuss_info: "Portfolio review and UX principles",
    },
    {
      mentorEmail: "michael.chen@example.com",
      menteeEmail: "carol.taylor@example.com",
      planIndex: 0,
      invoiceIndex: 3,
      session_status: "Completed",
      session_location: "https://meet.google.com/uvw-xyz-abc",
      discuss_info: "Introduction to machine learning concepts",
    },
    {
      mentorEmail: "michael.chen@example.com",
      menteeEmail: "daniel.brown@example.com",
      planIndex: 1,
      invoiceIndex: 4,
      session_status: "Scheduled",
      session_location: "https://meet.google.com/def-ghi-jkl",
      discuss_info: "Data preprocessing and feature engineering",
    },
  ];

  for (const session of sessions) {
    const mentorId = userIds[session.mentorEmail];
    const menteeId = userIds[session.menteeEmail];
    const mentorPlanIds = planIds[session.mentorEmail];
    const planId = mentorPlanIds ? mentorPlanIds[session.planIndex] : undefined;
    const invoiceId = invoiceIds[session.invoiceIndex];

    if (mentorId && menteeId && planId && invoiceId) {
      // Get a booked slot for this mentor to use for the session
      const slotResult = await pool
        .request()
        .input("mentor_id", sql.Int, mentorId)
        .input("slot_status", sql.NVarChar, "Booked").query(`
          SELECT TOP 1 mentor_id, slot_date, start_time
          FROM slots
          WHERE mentor_id = @mentor_id AND slot_status = @slot_status
          ORDER BY slot_date, start_time
        `);

      if (slotResult.recordset && slotResult.recordset.length > 0) {
        const slot = slotResult.recordset[0];

        await pool
          .request()
          .input("plan_id", sql.Int, planId)
          .input("invoice_id", sql.Int, invoiceId)
          .input("mentee_id", sql.Int, menteeId)
          .input("session_status", sql.NVarChar, session.session_status)
          .input("session_location", sql.NVarChar, session.session_location)
          .input("discuss_info", sql.NVarChar, session.discuss_info)
          .input("start_time", sql.Time, slot.start_time)
          .input("session_date", sql.Date, slot.slot_date)
          .input("mentor_id", sql.Int, slot.mentor_id).query(`
            INSERT INTO sessions (plan_id, invoice_id, mentee_id, session_status, session_location, discuss_info, start_time, session_date, mentor_id)
            VALUES (@plan_id, @invoice_id, @mentee_id, @session_status, @session_location, @discuss_info, @start_time, @session_date, @mentor_id)
          `);
      } else {
        console.log(chalk.yellow(`No booked slot found for mentor ${session.mentorEmail}`));
      }
    }
  }

  console.log(chalk.green(`${sessions.length} sessions seeded successfully`));
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
      menteeEmail: "alice.smith@example.com",
      mentorEmail: "john.doe@example.com",
      content: "Hi John! Looking forward to our session tomorrow. Any preparation needed?",
      sent_from: "Mentee",
    },
    {
      menteeEmail: "bob.wilson@example.com",
      mentorEmail: "sarah.johnson@example.com",
      content: "Thank you for the great session! The portfolio feedback was very helpful.",
      sent_from: "Mentee",
    },
    {
      menteeEmail: "carol.taylor@example.com",
      mentorEmail: "michael.chen@example.com",
      content: "Could we schedule a follow-up session to discuss the ML project implementation?",
      sent_from: "Mentee",
    },
  ];

  for (const message of messages) {
    const menteeId = userIds[message.menteeEmail];
    const mentorId = userIds[message.mentorEmail];

    if (menteeId && mentorId) {
      await pool
        .request()
        .input("mentee_id", sql.Int, menteeId)
        .input("mentor_id", sql.Int, mentorId)
        .input("content", sql.NVarChar, message.content)
        .input("sent_from", sql.NVarChar, message.sent_from).query(`
          INSERT INTO messages (mentee_id, mentor_id, content, sent_from)
          VALUES (@mentee_id, @mentor_id, @content, @sent_from)
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
    await seedFields();
    await seedHaveField();
    await seedMentors();
    await seedMentees();
    await seedCompanies();
    await seedWorkFor();
    await seedOwnField();
    await seedMentorLanguages();
    await seedPlans();
    await seedPlanBenefits();
    await seedSlots();
    await seedInvoices();
    await seedSessions();
    await seedFeedbacks();
    await seedNotifications();
    await seedSended();
    await seedMessages();

    console.log(chalk.blue("\n✅ Database seeding completed successfully!\n"));
    console.log(chalk.cyan("Summary:"));
    console.log(chalk.cyan("- 11 Users (5 Mentors, 5 Mentees, 1 Admin)"));
    console.log(chalk.cyan("- 15 Fields"));
    console.log(chalk.cyan("- 12 Companies"));
    console.log(chalk.cyan("- 13 Mentorship Plans"));
    console.log(chalk.cyan("- Multiple Sessions, Feedbacks, and Messages"));
    console.log(chalk.cyan("\nDefault password for all users: Password123!\n"));

    process.exit(0);
  } catch (error) {
    console.error(chalk.red("Error seeding database:"), error);
    process.exit(1);
  }
}

seed();
