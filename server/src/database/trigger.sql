ALTER TABLE mentors
ADD total_mentee INT DEFAULT 0, --DERIVED ATTRIBUTES FOR MENTORS
    total_stars INT DEFAULT 0,
    total_reviews INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0;
GO

--Derived attribute triggers

CREATE TRIGGER trg_meeting_completed
ON meetings
AFTER UPDATE
AS
BEGIN
    -- check for record changing to completed
    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE i.status = 'Completed'
    )
    BEGIN
        UPDATE mentors
        SET total_mentee =
        (
            SELECT COUNT(DISTINCT Mentee_id)
            FROM meetings m
            JOIN invoices i ON m.invoice_id = i.invoice_id
            WHERE m.mentor_id = inserted.mentor_id
              AND m.status = 'Completed'
        )
        FROM inserted
        WHERE mentors.user_id = inserted.mentor_id;
    END
END;
GO

CREATE TRIGGER trg_meeting_insert
ON meetings
AFTER INSERT
AS
BEGIN
    UPDATE mentors
    SET total_mentee =
    (
        SELECT COUNT(DISTINCT Mentee_id)
        FROM meetings m
        JOIN invoices i ON m.invoice_id = i.invoice_id
        WHERE m.mentor_id = inserted.mentor_id
          AND m.status = 'Completed'
    )
    FROM inserted
    WHERE mentors.user_id = inserted.mentor_id;
END;
GO

CREATE TRIGGER trg_feedback_insert
ON feedbacks
AFTER INSERT
AS
BEGIN
    UPDATE mentors
    SET
        total_reviews =
            (SELECT COUNT(*)
             FROM feedbacks F
             WHERE F.mentor_id = mentors.user_id),

        total_stars =
            (SELECT SUM(F.stars)
             FROM feedbacks F
             WHERE F.mentor_id = mentors.user_id),

        rating =
            CASE
                WHEN (SELECT COUNT(*)
                      FROM feedbacks F
                      WHERE F.mentor_id = mentors.user_id) = 0
                THEN 0
                ELSE (
                    SELECT SUM(F.stars) * 1.0 / COUNT(*)
                    FROM feedbacks F
                    WHERE F.mentor_id = mentors.user_id
                )
            END
    FROM inserted i
    WHERE mentors.user_id = i.mentor_id;
END;
GO

CREATE TRIGGER trg_feedback_update
ON feedbacks
AFTER UPDATE
AS
BEGIN
    IF UPDATE(stars)
    BEGIN
        UPDATE mentors
        SET
            total_reviews =
                (SELECT COUNT(*)
                 FROM feedbacks F
                 WHERE F.mentor_id = mentors.user_id),

            total_stars =
                (SELECT SUM(F.stars)
                 FROM feedbacks F
                 WHERE F.mentor_id = mentors.user_id),

            rating =
                CASE
                    WHEN (SELECT COUNT(*)
                          FROM feedbacks F
                          WHERE F.mentor_id = mentors.user_id) = 0
                    THEN 0
                    ELSE (
                        SELECT SUM(F.stars) * 1.0 / COUNT(*)
                        FROM feedbacks F
                        WHERE F.mentor_id = mentors.user_id
                    )
                END
        FROM inserted i
        WHERE mentors.user_id = i.mentor_id;
    END
END;
GO

CREATE TRIGGER trg_feedback_delete
ON feedbacks
AFTER DELETE
AS
BEGIN
    UPDATE mentors
    SET
        total_reviews =
            (SELECT COUNT(*)
             FROM feedbacks F
             WHERE F.mentor_id = mentors.user_id),

        total_stars =
            (SELECT SUM(F.stars)
             FROM feedbacks F
             WHERE F.mentor_id = mentors.user_id),

        rating =
            CASE
                WHEN (SELECT COUNT(*)
                      FROM feedbacks F
                      WHERE F.mentor_id = mentors.user_id) = 0
                THEN 0
                ELSE (
                    SELECT SUM(F.stars) * 1.0 / COUNT(*)
                    FROM feedbacks F
                    WHERE F.mentor_id = mentors.user_id
                )
            END
    FROM deleted d
    WHERE mentors.user_id = d.mentor_id;
END;
GO
