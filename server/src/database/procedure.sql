IF OBJECT_ID('dbo.sp_SearchMentors', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_SearchMentors;
GO

CREATE PROCEDURE dbo.sp_SearchMentors
    @SearchName NVARCHAR(100) = NULL,
    @FirstName NVARCHAR(50) = NULL,
    @LastName NVARCHAR(50) = NULL,
    @CompanyName NVARCHAR(255) = NULL,
    @JobTitleName NVARCHAR(255) = NULL,
    @SkillName NVARCHAR(100) = NULL,
    @CategoryName NVARCHAR(100) = NULL,
    @Country NVARCHAR(100) = NULL,
    @Language NVARCHAR(100) = NULL,
    @Status NVARCHAR(20) = NULL,
    @MinRating DECIMAL(3,2) = NULL,
    @MaxPrice DECIMAL(10,2) = NULL,
    @MinPrice DECIMAL(10,2) = NULL,
    @SortColumn NVARCHAR(50) = N'user_id',
    @SortDirection NVARCHAR(4) = N'ASC',
    @Page INT = 1,
    @Limit INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiem tra SortColumn tranh sql injection
    IF @SortColumn NOT IN (
        N'user_id', N'first_name', N'last_name', N'email', N'country',
        N'company_name', N'job_title', N'average_rating', N'total_reviews',
        N'total_plans', N'lowest_plan_price'
    )
        SET @SortColumn = N'user_id';

    IF @SortDirection NOT IN (N'ASC', N'DESC')
        SET @SortDirection = N'ASC';

    IF @Page < 1 SET @Page = 1;
    IF @Limit < 1 OR @Limit > 100 SET @Limit = 10;

    DECLARE @Offset INT = (@Page - 1) * @Limit;

    -- CTE de xu ly cac filter conditions cho mentor (tranh duplicate rows)
    WITH FilteredMentors AS (
        SELECT DISTINCT m.user_id
        FROM mentors m
        INNER JOIN users u ON m.user_id = u.user_id
        WHERE
            u.role = N'Mentor'
            AND (@FirstName IS NULL OR u.first_name LIKE N'%' + @FirstName + N'%')
            AND (@LastName IS NULL OR u.last_name LIKE N'%' + @LastName + N'%')
            AND (@SearchName IS NULL OR
                u.first_name LIKE N'%' + @SearchName + N'%' OR
                u.last_name LIKE N'%' + @SearchName + N'%' OR
                (u.first_name + N' ' + u.last_name) LIKE N'%' + @SearchName + N'%'
            )
            AND (@Country IS NULL OR u.country = @Country)
            AND (@Status IS NULL OR u.status = @Status)
            -- Loc theo company
            AND (@CompanyName IS NULL OR EXISTS (
                SELECT 1
                FROM work_for wf
                INNER JOIN companies c ON wf.c_company_id = c.company_id
                WHERE wf.mentor_id = m.user_id
                  AND c.cname LIKE N'%' + @CompanyName + N'%'
            ))
            -- Loc theo job title
            AND (@JobTitleName IS NULL OR EXISTS (
                SELECT 1
                FROM work_for wf
                INNER JOIN job_title jt ON wf.current_job_title_id = jt.job_title_id
                WHERE wf.mentor_id = m.user_id
                  AND jt.job_name LIKE N'%' + @JobTitleName + N'%'
            ))
            -- Loc theo skill
            AND (@SkillName IS NULL OR EXISTS (
                SELECT 1
                FROM set_skill ss
                INNER JOIN skills s ON ss.skill_id = s.skill_id
                WHERE ss.mentor_id = m.user_id
                  AND s.skill_name LIKE N'%' + @SkillName + N'%'
            ))
            -- Loc theo category
            AND (@CategoryName IS NULL OR EXISTS (
                SELECT 1
                FROM set_skill ss
                INNER JOIN skills s ON ss.skill_id = s.skill_id
                INNER JOIN own_skill os ON s.skill_id = os.skill_id
                INNER JOIN categories cat ON os.category_id = cat.category_id
                WHERE ss.mentor_id = m.user_id
                  AND cat.category_name LIKE N'%' + @CategoryName + N'%'
            ))
            -- Loc theo language
            AND (@Language IS NULL OR EXISTS (
                SELECT 1
                FROM mentor_languages ml
                CROSS APPLY STRING_SPLIT(@Language, ',') AS lang
                WHERE ml.mentor_id = m.user_id
                  AND LTRIM(RTRIM(ml.mentor_language)) = LTRIM(RTRIM(lang.value))
            ))
    ),
    -- CTE de lay thong tin cong ty va job title
    CompanyInfo AS (
        SELECT
            wf.mentor_id,
            STUFF((
                SELECT DISTINCT N', ' + c2.cname
                FROM work_for wf2
                INNER JOIN companies c2 ON c2.company_id = wf2.c_company_id
                WHERE wf2.mentor_id = wf.mentor_id
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS company_names,
            -- Lay job title dau tien
            (SELECT TOP 1 jt2.job_name
             FROM work_for wf3
             INNER JOIN job_title jt2 ON wf3.current_job_title_id = jt2.job_title_id
             WHERE wf3.mentor_id = wf.mentor_id
            ) AS job_title
        FROM work_for wf
        WHERE wf.mentor_id IN (SELECT user_id FROM FilteredMentors)
        GROUP BY wf.mentor_id
    ),
    -- CTE lay thong tin plans va gia
    PlanInfo AS (
        SELECT
            p.mentor_id,
            COUNT(DISTINCT p.plan_id) AS total_plans,
            MIN(p.plan_charge) AS lowest_plan_price,
            MAX(p.plan_charge) AS highest_plan_price,
            AVG(p.plan_charge) AS average_plan_price
        FROM plans p
        WHERE p.mentor_id IN (SELECT user_id FROM FilteredMentors)
        GROUP BY p.mentor_id
    ),
    -- CTE lay skills
    SkillInfo AS (
        SELECT
            ss.mentor_id,
            STUFF((
                SELECT DISTINCT N', ' + s2.skill_name
                FROM set_skill ss2
                INNER JOIN skills s2 ON ss2.skill_id = s2.skill_id
                WHERE ss2.mentor_id = ss.mentor_id
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS skills
        FROM set_skill ss
        WHERE ss.mentor_id IN (SELECT user_id FROM FilteredMentors)
        GROUP BY ss.mentor_id
    ),
    -- CTE lay languages
    LanguageInfo AS (
        SELECT
            ml.mentor_id,
            STUFF((
                SELECT DISTINCT N', ' + ml2.mentor_language
                FROM mentor_languages ml2
                WHERE ml2.mentor_id = ml.mentor_id
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS languages
        FROM mentor_languages ml
        WHERE ml.mentor_id IN (SELECT user_id FROM FilteredMentors)
        GROUP BY ml.mentor_id
    ),
    -- CTE lay categories
    CategoryInfo AS (
        SELECT DISTINCT
            ss.mentor_id,
            STUFF((
                SELECT DISTINCT N', ' + cat2.category_name
                FROM set_skill ss2
                INNER JOIN own_skill os2 ON ss2.skill_id = os2.skill_id
                INNER JOIN categories cat2 ON os2.category_id = cat2.category_id
                WHERE ss2.mentor_id = ss.mentor_id
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS categories
        FROM set_skill ss
        INNER JOIN own_skill os ON ss.skill_id = os.skill_id
        INNER JOIN categories cat ON os.category_id = cat.category_id
        WHERE ss.mentor_id IN (SELECT user_id FROM FilteredMentors)
        GROUP BY ss.mentor_id
    ),
    -- CTE tat ca filter
    FinalData AS (
        SELECT
            m.user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.avatar_url,
            u.country,
            u.status,
            u.timezone,
            m.bio,
            m.headline,
            dbo.CalculateMentorResponseTime(m.user_id) AS response_time,
            m.cv_url,
            -- su dung derived attr tu bang mentors
            ISNULL(m.rating, 0) AS average_rating,
            ISNULL(m.total_reviews, 0) AS total_reviews,
            m.total_mentee,
            m.total_stars,
            ISNULL(ci.company_names, N'') AS company_names,
            ISNULL(ci.job_title, N'') AS job_title,
            ISNULL(pi.total_plans, 0) AS total_plans,
            ISNULL(pi.lowest_plan_price, 0) AS lowest_plan_price,
            ISNULL(pi.highest_plan_price, 0) AS highest_plan_price,
            ISNULL(pi.average_plan_price, 0) AS average_plan_price,
            ISNULL(si.skills, N'') AS skills,
            ISNULL(li.languages, N'') AS languages,
            ISNULL(cati.categories, N'') AS categories
        FROM mentors m
        INNER JOIN users u ON m.user_id = u.user_id
        INNER JOIN FilteredMentors fm ON m.user_id = fm.user_id
        LEFT JOIN CompanyInfo ci ON m.user_id = ci.mentor_id
        LEFT JOIN PlanInfo pi ON m.user_id = pi.mentor_id
        LEFT JOIN SkillInfo si ON m.user_id = si.mentor_id
        LEFT JOIN LanguageInfo li ON m.user_id = li.mentor_id
        LEFT JOIN CategoryInfo cati ON m.user_id = cati.mentor_id
        WHERE (@MinRating IS NULL OR ISNULL(m.rating, 0) >= @MinRating)
          AND (@MaxPrice IS NULL OR ISNULL(pi.lowest_plan_price, 999999) <= @MaxPrice)
          AND (@MinPrice IS NULL OR ISNULL(pi.lowest_plan_price, 0) >= @MinPrice)
    ),
    -- Count tong cho trang
    TotalCount AS (
        SELECT COUNT(*) AS total FROM FinalData
    )
    SELECT
        fd.*,
        tc.total AS total_items,
        @Page AS current_page,
        @Limit AS items_per_page,
        CEILING(CAST(tc.total AS FLOAT) / @Limit) AS total_pages
    FROM FinalData fd
    CROSS JOIN TotalCount tc
    ORDER BY
        CASE WHEN @SortColumn = N'first_name' AND @SortDirection = N'ASC' THEN fd.first_name END ASC,
        CASE WHEN @SortColumn = N'first_name' AND @SortDirection = N'DESC' THEN fd.first_name END DESC,
        CASE WHEN @SortColumn = N'last_name' AND @SortDirection = N'ASC' THEN fd.last_name END ASC,
        CASE WHEN @SortColumn = N'last_name' AND @SortDirection = N'DESC' THEN fd.last_name END DESC,
        CASE WHEN @SortColumn = N'email' AND @SortDirection = N'ASC' THEN fd.email END ASC,
        CASE WHEN @SortColumn = N'email' AND @SortDirection = N'DESC' THEN fd.email END DESC,
        CASE WHEN @SortColumn = N'country' AND @SortDirection = N'ASC' THEN fd.country END ASC,
        CASE WHEN @SortColumn = N'country' AND @SortDirection = N'DESC' THEN fd.country END DESC,
        CASE WHEN @SortColumn = N'company_name' AND @SortDirection = N'ASC' THEN fd.company_names END ASC,
        CASE WHEN @SortColumn = N'company_name' AND @SortDirection = N'DESC' THEN fd.company_names END DESC,
        CASE WHEN @SortColumn = N'job_title' AND @SortDirection = N'ASC' THEN fd.job_title END ASC,
        CASE WHEN @SortColumn = N'job_title' AND @SortDirection = N'DESC' THEN fd.job_title END DESC,
        CASE WHEN @SortColumn = N'average_rating' AND @SortDirection = N'ASC' THEN fd.average_rating END ASC,
        CASE WHEN @SortColumn = N'average_rating' AND @SortDirection = N'DESC' THEN fd.average_rating END DESC,
        CASE WHEN @SortColumn = N'total_reviews' AND @SortDirection = N'ASC' THEN fd.total_reviews END ASC,
        CASE WHEN @SortColumn = N'total_reviews' AND @SortDirection = N'DESC' THEN fd.total_reviews END DESC,
        CASE WHEN @SortColumn = N'total_plans' AND @SortDirection = N'ASC' THEN fd.total_plans END ASC,
        CASE WHEN @SortColumn = N'total_plans' AND @SortDirection = N'DESC' THEN fd.total_plans END DESC,
        CASE WHEN @SortColumn = N'lowest_plan_price' AND @SortDirection = N'ASC' THEN fd.lowest_plan_price END ASC,
        CASE WHEN @SortColumn = N'lowest_plan_price' AND @SortDirection = N'DESC' THEN fd.lowest_plan_price END DESC,
        CASE WHEN @SortColumn = N'user_id' AND @SortDirection = N'ASC' THEN fd.user_id END ASC,
        CASE WHEN @SortColumn = N'user_id' AND @SortDirection = N'DESC' THEN fd.user_id END DESC,
        fd.user_id ASC
    OFFSET @Offset ROWS
    FETCH NEXT @Limit ROWS ONLY;
END;
GO

IF OBJECT_ID('dbo.sp_DashboardStatistics', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_DashboardStatistics;
GO

CREATE PROCEDURE dbo.sp_DashboardStatistics
    @GroupBy NVARCHAR(50) = N'mentor',
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @CompanyId INT = NULL,
    @CategoryId INT = NULL,
    @MinRevenue DECIMAL(10,2) = NULL,
    @MinBookingCount INT = NULL,
    @SortBy NVARCHAR(50) = N'total_revenue',
    @SortOrder NVARCHAR(4) = N'DESC'
AS
BEGIN
    SET NOCOUNT ON;

    -- Xu ly mac dinh
    IF @SortOrder NOT IN (N'ASC', N'DESC') SET @SortOrder = N'DESC';
    IF @StartDate IS NULL SET @StartDate = DATEADD(MONTH, -12, GETDATE());
    IF @EndDate IS NULL SET @EndDate = GETDATE();

    -- =============================================
    -- GROUP BY MENTOR
    -- =============================================
    IF @GroupBy = N'mentor'
    BEGIN
        IF @SortBy NOT IN (N'total_revenue', N'total_bookings', N'average_rating',
                          N'completed_meetings', N'mentor_name', N'average_invoice_amount')
            SET @SortBy = N'total_revenue';

        -- CTE Loc Mentor co ban (Theo Company, Category)
        WITH BaseMentors AS (
            SELECT DISTINCT m.user_id
            FROM mentors m
            INNER JOIN users u ON m.user_id = u.user_id
            WHERE (@CompanyId IS NULL OR EXISTS (
                SELECT 1 FROM work_for wf
                WHERE wf.mentor_id = m.user_id AND wf.c_company_id = @CompanyId
            ))
            AND (@CategoryId IS NULL OR EXISTS (
                SELECT 1 FROM set_skill ss
                INNER JOIN own_skill os ON ss.skill_id = os.skill_id
                WHERE ss.mentor_id = m.user_id AND os.category_id = @CategoryId
            ))
        ),
        -- CTE Tinh Doanh thu & Booking
        RevenueStats AS (
            SELECT
                p.mentor_id,
                COUNT(DISTINCT b.plan_registerations_id) AS total_bookings,
                COUNT(DISTINCT inv.invoice_id) AS total_invoices,
                SUM(inv.amount_total) AS total_revenue,
                AVG(inv.amount_total) AS average_invoice_amount
            FROM plans p
            INNER JOIN bookings b ON p.plan_id = b.plan_id
            INNER JOIN plan_registerations pr ON b.plan_registerations_id = pr.registration_id
            INNER JOIN invoices inv ON pr.registration_id = inv.plan_registerations_id
            WHERE inv.paid_time BETWEEN @StartDate AND @EndDate
              AND inv.payment_status = N'paid'
              AND p.mentor_id IN (SELECT user_id FROM BaseMentors)
            GROUP BY p.mentor_id
        ),

        -- CTE Tinh Meeting (Tinh rieng)
        MeetingStats AS (
            SELECT
                mentor_id,
                COUNT(CASE WHEN status = N'Completed' THEN 1 END) AS completed_meetings,
                COUNT(CASE WHEN status = N'Cancelled' THEN 1 END) AS cancelled_meetings,
                COUNT(CASE WHEN status IN (N'Pending', N'Scheduled') THEN 1 END) AS upcoming_meetings
            FROM meetings
            WHERE mentor_id IN (SELECT user_id FROM BaseMentors)
            GROUP BY mentor_id
        ),
        -- CTE Gop thong tin chuoi (Cty, Skill...)
        StringAggStats AS (
            SELECT
                bm.user_id,
                -- Danh sach cty
                STUFF((SELECT DISTINCT N', ' + c.cname
                       FROM work_for wf JOIN companies c ON wf.c_company_id = c.company_id
                       WHERE wf.mentor_id = bm.user_id FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS company_names,
                -- Danh sach chuc danh
                STUFF((SELECT DISTINCT N', ' + jt.job_name
                       FROM work_for wf JOIN job_title jt ON wf.current_job_title_id = jt.job_title_id
                       WHERE wf.mentor_id = bm.user_id FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS job_titles,
                -- Danh sach ky nang
                STUFF((SELECT DISTINCT N', ' + s.skill_name
                       FROM set_skill ss JOIN skills s ON ss.skill_id = s.skill_id
                       WHERE ss.mentor_id = bm.user_id FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS skills
            FROM BaseMentors bm
        )
        -- JOIN TAT CA LAII
        SELECT
            m.user_id AS mentor_id,
            u.first_name + N' ' + u.last_name AS mentor_name,
            u.email AS mentor_email,
            u.avatar_url AS mentor_avatar_url,
            u.country AS mentor_country,
            u.status AS mentor_status,
            m.headline AS mentor_headline,
            ISNULL(sa.company_names, '') AS company_names,
            ISNULL(sa.job_titles, '') AS job_titles,
            ISNULL(sa.skills, '') AS skills,
            ISNULL(rs.total_bookings, 0) AS total_bookings,
            ISNULL(rs.total_invoices, 0) AS total_invoices,
            ISNULL(rs.total_revenue, 0) AS total_revenue,
            ISNULL(rs.average_invoice_amount, 0) AS average_invoice_amount,
            ISNULL(ms.completed_meetings, 0) AS completed_meetings,
            ISNULL(ms.cancelled_meetings, 0) AS cancelled_meetings,
            ISNULL(ms.upcoming_meetings, 0) AS upcoming_meetings,
            -- sdung derived attr tu bang mentors
            ISNULL(m.rating, 0) AS average_rating,
            ISNULL(m.total_reviews, 0) AS total_reviews,
            m.total_mentee,
            m.total_stars,
            (SELECT COUNT(*) FROM plans WHERE mentor_id = m.user_id) AS total_plans
        FROM mentors m
        INNER JOIN users u ON m.user_id = u.user_id
        INNER JOIN BaseMentors bm ON m.user_id = bm.user_id
        LEFT JOIN RevenueStats rs ON m.user_id = rs.mentor_id
        LEFT JOIN MeetingStats ms ON m.user_id = ms.mentor_id
        LEFT JOIN StringAggStats sa ON m.user_id = sa.user_id
        WHERE
            (@MinRevenue IS NULL OR ISNULL(rs.total_revenue, 0) >= @MinRevenue)
            AND (@MinBookingCount IS NULL OR ISNULL(rs.total_bookings, 0) >= @MinBookingCount)
        ORDER BY
            CASE WHEN @SortBy = N'total_revenue' AND @SortOrder = N'DESC' THEN rs.total_revenue END DESC,
            CASE WHEN @SortBy = N'total_revenue' AND @SortOrder = N'ASC' THEN rs.total_revenue END ASC,
            CASE WHEN @SortBy = N'total_bookings' AND @SortOrder = N'DESC' THEN rs.total_bookings END DESC,
            CASE WHEN @SortBy = N'total_bookings' AND @SortOrder = N'ASC' THEN rs.total_bookings END ASC,
            CASE WHEN @SortBy = N'average_rating' AND @SortOrder = N'DESC' THEN m.rating END DESC,
            CASE WHEN @SortBy = N'average_rating' AND @SortOrder = N'ASC' THEN m.rating END ASC,
            CASE WHEN @SortBy = N'completed_meetings' AND @SortOrder = N'DESC' THEN ms.completed_meetings END DESC,
            CASE WHEN @SortBy = N'completed_meetings' AND @SortOrder = N'ASC' THEN ms.completed_meetings END ASC,
            CASE WHEN @SortBy = N'average_invoice_amount' AND @SortOrder = N'DESC' THEN rs.average_invoice_amount END DESC,
            CASE WHEN @SortBy = N'average_invoice_amount' AND @SortOrder = N'ASC' THEN rs.average_invoice_amount END ASC,
            CASE WHEN @SortBy = N'mentor_name' AND @SortOrder = N'DESC' THEN u.first_name END DESC,
            CASE WHEN @SortBy = N'mentor_name' AND @SortOrder = N'ASC' THEN u.first_name END ASC;
    END

    -- =============================================
    -- GROUP BY MONTH
    -- =============================================
    ELSE IF @GroupBy = N'month'
    BEGIN
        SELECT
            YEAR(inv.paid_time) AS year,
            MONTH(inv.paid_time) AS month,
            DATENAME(MONTH, inv.paid_time) AS month_name,
            COUNT(DISTINCT inv.invoice_id) AS total_invoices,
            COUNT(DISTINCT b.mentee_id) AS total_mentees,
            COUNT(DISTINCT p.mentor_id) AS total_mentors,
            SUM(inv.amount_total) AS total_revenue,
            AVG(inv.amount_total) AS average_invoice_amount,
            COUNT(DISTINCT b.plan_registerations_id) AS total_bookings
        FROM invoices inv
        INNER JOIN plan_registerations pr ON inv.plan_registerations_id = pr.registration_id
        INNER JOIN bookings b ON pr.registration_id = b.plan_registerations_id
        INNER JOIN plans p ON b.plan_id = p.plan_id
        WHERE inv.paid_time BETWEEN @StartDate AND @EndDate
          AND inv.payment_status = N'paid'
          AND (@CompanyId IS NULL OR EXISTS (SELECT 1 FROM work_for wf WHERE wf.mentor_id = p.mentor_id AND wf.c_company_id = @CompanyId))
          AND (@CategoryId IS NULL OR EXISTS (SELECT 1 FROM set_skill ss JOIN own_skill os ON ss.skill_id = os.skill_id WHERE ss.mentor_id = p.mentor_id AND os.category_id = @CategoryId))
        GROUP BY YEAR(inv.paid_time), MONTH(inv.paid_time), DATENAME(MONTH, inv.paid_time)
        HAVING (@MinRevenue IS NULL OR SUM(inv.amount_total) >= @MinRevenue)
           AND (@MinBookingCount IS NULL OR COUNT(DISTINCT b.plan_registerations_id) >= @MinBookingCount)
        ORDER BY year DESC, month DESC;
    END

    -- =============================================
    --GROUP BY CATEGORY
    -- =============================================
    ELSE IF @GroupBy = N'category'
    BEGIN
        -- Tinh rieng doanh thu
        WITH CategoryRevenue AS (
            SELECT
                os.category_id,
                SUM(inv.amount_total) AS total_revenue,
                COUNT(DISTINCT b.plan_registerations_id) AS total_bookings
            FROM set_skill ss
            JOIN own_skill os ON ss.skill_id = os.skill_id
            JOIN plans p ON ss.mentor_id = p.mentor_id
            JOIN bookings b ON p.plan_id = b.plan_id
            JOIN plan_registerations pr ON b.plan_registerations_id = pr.registration_id
            JOIN invoices inv ON pr.registration_id = inv.plan_registerations_id
            WHERE inv.paid_time BETWEEN @StartDate AND @EndDate AND inv.payment_status = N'paid'
            GROUP BY os.category_id
        )
        SELECT
            cat.category_id,
            cat.category_name,
            COUNT(DISTINCT ss.mentor_id) AS total_mentors_with_skill,
            ISNULL(cr.total_bookings, 0) AS total_bookings,
            ISNULL(cr.total_revenue, 0) AS total_revenue
        FROM categories cat
        INNER JOIN own_skill os ON cat.category_id = os.category_id
        INNER JOIN set_skill ss ON os.skill_id = ss.skill_id
        LEFT JOIN CategoryRevenue cr ON cat.category_id = cr.category_id
        WHERE (@CategoryId IS NULL OR cat.category_id = @CategoryId)
        GROUP BY cat.category_id, cat.category_name, cr.total_bookings, cr.total_revenue
        HAVING (@MinRevenue IS NULL OR ISNULL(cr.total_revenue, 0) >= @MinRevenue)
        ORDER BY total_revenue DESC;
    END
    ELSE
    BEGIN
        RAISERROR('Invalid GroupBy param. Supported: mentor, month, category', 16, 1);
    END
END;
GO
