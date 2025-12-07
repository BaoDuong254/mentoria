-- Complaints table schema
IF OBJECT_ID('dbo.complaints', 'U') IS NOT NULL DROP TABLE dbo.complaints;
GO

CREATE TABLE complaints(
    complaint_id INT IDENTITY(1,1) PRIMARY KEY,
    meeting_id INT NOT NULL,
    mentee_id INT NOT NULL,
    mentor_id INT NOT NULL,
    content NVARCHAR(MAX) NOT NULL CHECK (
        LEN(LTRIM(RTRIM(content))) >= 10
    ),
    status NVARCHAR(20) CHECK (status IN (N'Pending', N'Reviewed', N'Resolved', N'Rejected')) DEFAULT N'Pending',
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    admin_response NVARCHAR(MAX) NULL,
    FOREIGN KEY (meeting_id) REFERENCES meetings(meeting_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (mentee_id) REFERENCES mentees(user_id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    FOREIGN KEY (mentor_id) REFERENCES mentors(user_id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO
