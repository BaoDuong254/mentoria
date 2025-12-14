import sql from "mssql";
import poolPromise from "@/config/database";

export class DiscountService {
  async findBestDiscount(menteeId: number, planId: number): Promise<number | null> {
    const pool = await poolPromise;
    if (!pool) {
      throw new Error("Database connection failed");
    }

    const result = await pool.request().input("mentee_id", sql.Int, menteeId).input("plan_id", sql.Int, planId).query(`
        SELECT dbo.FindBestDiscountForMentee(@mentee_id, @plan_id) AS best_discount
      `);

    return result.recordset[0]?.best_discount ?? null;
  }

  async getAllDiscountsForPlan(planId: number) {
    const pool = await poolPromise;
    if (!pool) {
      throw new Error("Database connection failed");
    }

    // Get plan charge
    const planResult = await pool
      .request()
      .input("plan_id", sql.Int, planId)
      .query(`SELECT plan_charge FROM plans WHERE plan_id = @plan_id`);

    const planCharge = planResult.recordset[0]?.plan_charge || 0;

    // Get all active discounts with estimated savings
    const discountResult = await pool.request().query(`
      SELECT
        discount_id,
        discount_name,
        discount_type,
        discount_value,
        start_date,
        end_date,
        CASE
          WHEN discount_type = N'Percentage'
          THEN ${planCharge} * discount_value / 100
          ELSE CASE
            WHEN discount_value > ${planCharge}
            THEN ${planCharge}
            ELSE discount_value
          END
        END AS estimated_savings
      FROM discounts
      WHERE status = N'Active' AND GETDATE() BETWEEN start_date AND end_date
      ORDER BY estimated_savings DESC
    `);

    return {
      planCharge,
      discounts: discountResult.recordset,
    };
  }
}

// Export singleton instance
export const discountService = new DiscountService();
