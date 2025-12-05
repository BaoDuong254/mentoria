import sql from "mssql";
import poolPromise from "@/config/database";
import chalk from "chalk";

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

    // Determine duration based on plan type:
    // - For sessions (plan_sessions): use sessions_duration
    // - For mentorships (plan_mentorships): use minutes_per_call
    // Sessions and mentorships are mutually exclusive - a plan can only be one type
    let duration: number | null = null;

    if (row.sessions_duration) {
      // This is a session plan - slot duration must match sessions_duration
      duration = row.sessions_duration;
    } else if (row.minutes_per_call) {
      // This is a mentorship plan - slot duration must match minutes_per_call
      duration = row.minutes_per_call;
    }

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
    slotDate.setHours(0, 0, 0, 0); // Reset time to midnight

    // Get date components to ensure consistency
    const year = slotDate.getFullYear();
    const month = slotDate.getMonth();
    const day = slotDate.getDate();

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

          const startTime = new Date(Date.UTC(year, month, day, timeSlot.hour, timeSlot.minute, 0, 0)); // Use UTC to avoid time zone issues
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + plan.duration);

          // Ensure the date remains consistent
          const dateStr = startTime.toISOString().split("T")[0]; // Date in YYYY-MM-DD format

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
            // Check if this slot already exists in the database
            const existingSlot = await pool
              .request()
              .input("start_time", sql.DateTime, startTime)
              .input("end_time", sql.DateTime, endTime)
              .input("date", sql.Date, dateStr)
              .input("mentor_id", sql.Int, parseInt(mentorId)).query(`
                SELECT COUNT(*) as count
                FROM slots
                WHERE mentor_id = @mentor_id
                  AND start_time = @start_time
                  AND end_time = @end_time
                  AND date = @date
              `);

            // Skip if slot already exists
            if (existingSlot.recordset[0].count > 0) {
              // Mark as occupied even if we skip (to prevent creating overlapping slots)
              occupied.push({ start: new Date(startTime), end: new Date(endTime) });
              continue;
            }

            // All slots are available
            const status = "Available";

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

async function run() {
  try {
    console.log(chalk.blue("\n🕐 Starting slots seeding...\n"));
    await seedSlots();
    console.log(chalk.blue("\n✅ Slots seeding completed successfully!\n"));
    process.exit(0);
  } catch (error) {
    console.error(chalk.red("\n❌ Error seeding slots:"), error);
    process.exit(1);
  }
}

run();
