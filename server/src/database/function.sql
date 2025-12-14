IF OBJECT_ID('dbo.FindBestDiscountForMentee', 'FN') IS NOT NULL
    DROP FUNCTION dbo.FindBestDiscountForMentee;
GO

CREATE FUNCTION dbo.FindBestDiscountForMentee
(
    @mentee_id INT,
    @plan_id INT
)
RETURNS NVARCHAR(100)
AS
BEGIN
    DECLARE @best_discount_name NVARCHAR(100) = NULL;
    DECLARE @best_savings DECIMAL(10,2) = 0;
    DECLARE @plan_charge DECIMAL(10,2);

    DECLARE @current_name NVARCHAR(100);
    DECLARE @current_type NVARCHAR(50);
    DECLARE @current_value DECIMAL(10,2);
    DECLARE @current_savings DECIMAL(10,2);

    -- Validate tham so dau vao
    IF @mentee_id IS NULL OR @mentee_id <= 0
        RETURN NULL;

    IF @plan_id IS NULL OR @plan_id <= 0
        RETURN NULL;

    -- Check mentee co ton tai khong
    IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE user_id = @mentee_id AND role = N'Mentee')
        RETURN NULL;

    -- Lay plan_charge tu plan_id
    SELECT @plan_charge = plan_charge
    FROM dbo.plans
    WHERE plan_id = @plan_id;

    -- Check plan co ton tai khong
    IF @plan_charge IS NULL
        RETURN NULL;

    -- Cursor de duyet qua active discount code
    DECLARE discount_cursor CURSOR FOR
    SELECT
        d.discount_name,
        d.discount_type,
        d.discount_value
    FROM dbo.discounts d
    WHERE d.status = N'Active'
        AND GETDATE() BETWEEN d.start_date AND d.end_date;

    OPEN discount_cursor;
    FETCH NEXT FROM discount_cursor INTO
        @current_name, @current_type, @current_value;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @current_savings = 0;

        -- Tinh toan muc tiet kiem
        IF @current_type = N'Percentage'
        BEGIN
            SET @current_savings = (@plan_charge * @current_value / 100);
        END
        ELSE IF @current_type = N'Fixed'
        BEGIN
            SET @current_savings = @current_value;

            -- Saving khong the vuot qua plan_charge
            IF @current_savings > @plan_charge
                SET @current_savings = @plan_charge;
        END

        -- So sanh best saving voi saving hien tai
        IF @current_savings > @best_savings
        BEGIN
            SET @best_savings = @current_savings;
            SET @best_discount_name = @current_name;
        END

        FETCH NEXT FROM discount_cursor INTO
            @current_name, @current_type, @current_value;
    END

    CLOSE discount_cursor;
    DEALLOCATE discount_cursor;

    RETURN @best_discount_name;
END;
GO

IF OBJECT_ID('dbo.CalculateMentorResponseTime', 'FN') IS NOT NULL
    DROP FUNCTION dbo.CalculateMentorResponseTime;
GO

CREATE FUNCTION dbo.CalculateMentorResponseTime
(
    @mentor_id INT
)
RETURNS NVARCHAR(50)
AS
BEGIN
    DECLARE @avg_hours DECIMAL(10,2) = 0;
    DECLARE @total_gap_hours DECIMAL(10,2) = 0;
    DECLARE @response_count INT = 0;
    DECLARE @result NVARCHAR(50);

    DECLARE @mentee_message_id INT;
    DECLARE @mentee_sent_time DATETIME;
    DECLARE @mentor_reply_time DATETIME;
    DECLARE @gap_hours DECIMAL(10,2);

    -- Validate tham so dau vao
    IF @mentor_id IS NULL OR @mentor_id <= 0
        RETURN N'Invalid ID';

    -- kiem tra xem mentor ton tai hay khong
    IF NOT EXISTS (SELECT 1 FROM dbo.mentors WHERE user_id = @mentor_id)
        RETURN N'Mentor not found';

    -- Cursor duyet tin nhan tu mentee gui cho mentor nay
    DECLARE message_cursor CURSOR FOR
    SELECT
        m1.message_id,
        m1.sent_time
    FROM dbo.messages m1
    WHERE m1.receiver_id = @mentor_id
        AND m1.sender_id IN (SELECT user_id FROM dbo.users WHERE role = N'Mentee') -- sender id phải nằm trong bảng user với role là Mentee
    ORDER BY m1.sent_time;

    OPEN message_cursor;
    FETCH NEXT FROM message_cursor INTO @mentee_message_id, @mentee_sent_time;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- tim tin nhan phan hoi dau tien cua mentor sau tin nhan duoc chon boi con tro
        SELECT TOP 1 @mentor_reply_time = m2.sent_time
        FROM dbo.messages m2
        WHERE m2.sender_id = @mentor_id
            AND m2.receiver_id = (SELECT sender_id FROM dbo.messages WHERE message_id = @mentee_message_id)
            AND m2.sent_time > @mentee_sent_time
        ORDER BY m2.sent_time ASC;

        -- neu mentor replied, tinh gap
        IF @mentor_reply_time IS NOT NULL
        BEGIN
            -- tinh khoang cach thoi gian bang phut, chia 60
            SET @gap_hours = DATEDIFF(MINUTE, @mentee_sent_time, @mentor_reply_time) / 60.0;

            -- chi tinh phan hoi trong 1 tuan gan nhat, vi tin nhan duoc reply sau 7 ngay thuong duoc xu ly qua kenh khac hoac da duoc giai dap trong buoi gap.
            IF @gap_hours <= 168
            BEGIN
                SET @total_gap_hours = @total_gap_hours + @gap_hours;
                SET @response_count = @response_count + 1;
            END

            SET @mentor_reply_time = NULL;
        END

        FETCH NEXT FROM message_cursor INTO @mentee_message_id, @mentee_sent_time;
    END

    CLOSE message_cursor;
    DEALLOCATE message_cursor;

    -- tinh trung binh
    IF @response_count = 0
        RETURN N'No responses yet';

    SET @avg_hours = @total_gap_hours / @response_count;

    -- logic response time
    IF @avg_hours < 1
        SET @result = N'Within 1 hour';
    ELSE IF @avg_hours < 3
        SET @result = N'Within 3 hours';
    ELSE IF @avg_hours < 6
        SET @result = N'Within 6 hours';
    ELSE IF @avg_hours < 12
        SET @result = N'Within 12 hours';
    ELSE IF @avg_hours < 24
        SET @result = N'Within 24 hours';
    ELSE IF @avg_hours < 36
        SET @result = N'Within 36 hours';
    ELSE IF @avg_hours < 48
        SET @result = N'Within 48 hours';
    ELSE
        SET @result = N'More than 48 hours';
    RETURN @result;
END;
GO
