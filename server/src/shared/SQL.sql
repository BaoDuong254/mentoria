CREATE TABLE users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    first_name NVARCHAR(50) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    sex NVARCHAR(10) CHECK (sex IN (N'Male', N'Female')),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(255) NULL,
    avatar_url NVARCHAR(255) NULL,
    country NVARCHAR(100) NULL,
    role NVARCHAR(50) CHECK (role IN (N'Mentee', N'Mentor', N'Admin')) DEFAULT N'Mentee',
    timezone NVARCHAR(50) NULL,
    status NVARCHAR(20) CHECK (status IN (N'Active', N'Inactive', N'Banned', N'Pending')) DEFAULT N'Pending',
    is_email_verified BIT DEFAULT 0,
    otp NVARCHAR(6) NULL,
    otp_expiration DATETIME NULL,
    reset_password_token NVARCHAR(255) NULL,
    reset_password_token_expiration DATETIME NULL,
    google_id NVARCHAR(255) NULL,
    provider NVARCHAR(50) CHECK (provider IN (N'Local', N'Google')) DEFAULT N'Local'
);

CREATE TABLE user_social_links (
    user_id INT NOT NULL,
    link NVARCHAR(255) NOT NULL,
    platform NVARCHAR(100) NOT NULL,
    PRIMARY KEY (user_id, link, platform),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE notifications (
    no_id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(100) NOT NULL,
    content NVARCHAR(MAX) NOT NULL
);

CREATE TABLE sended (
    u_user_id INT NOT NULL,
    n_no_id INT NOT NULL,
    sent_time DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (u_user_id, n_no_id),
    FOREIGN KEY (u_user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (n_no_id) REFERENCES notifications(no_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE mentees (
    user_id INT PRIMARY KEY,
    goal NVARCHAR(MAX),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE mentors (
    user_id INT PRIMARY KEY,
    bio NVARCHAR(MAX),
    headline NVARCHAR(255),
    response_time INT CHECK (response_time >= 0),
    total_reviews INT DEFAULT 0,
    total_stars INT DEFAULT 0,
    total_mentee INT DEFAULT 0,
    cv_url NVARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE companies (
    company_id INT IDENTITY(1,1) PRIMARY KEY,
    cname NVARCHAR(255) NOT NULL
);

CREATE TABLE work_for (
    mentor_id INT NOT NULL,
    c_company_id INT NOT NULL,
    crole NVARCHAR(100),
    PRIMARY KEY (mentor_id, c_company_id),
    FOREIGN KEY (mentor_id) REFERENCES mentors(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (c_company_id) REFERENCES companies(company_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE fields (
    field_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS have_field;
GO
CREATE TABLE have_field (
    field_id_1 INT NOT NULL,
    field_id_2 INT NOT NULL,
    CONSTRAINT CK_have_field_order CHECK (field_id_1 < field_id_2),
    CONSTRAINT PK_have_field PRIMARY KEY (field_id_1, field_id_2),

    CONSTRAINT FK_have_field_f1
      FOREIGN KEY (field_id_1) REFERENCES fields(field_id)
      ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT FK_have_field_f2
      FOREIGN KEY (field_id_2) REFERENCES fields(field_id)
      ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE own_field (
    mentor_id INT NOT NULL,
    f_field_id INT NOT NULL,
    PRIMARY KEY (mentor_id, f_field_id),
    FOREIGN KEY (mentor_id) REFERENCES mentors(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (f_field_id) REFERENCES fields(field_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE mentor_languages (
    mentor_id INT NOT NULL,
    mentor_language NVARCHAR(100) NOT NULL,
    PRIMARY KEY (mentor_id, mentor_language),
    FOREIGN KEY (mentor_id) REFERENCES mentors(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE plans (
    plan_id INT IDENTITY(1,1) PRIMARY KEY,
    charge DECIMAL(10,2) CHECK (charge >= 0),
    duration INT CHECK (duration > 0 AND duration <= 120),
    mentor_id INT NOT NULL,
    FOREIGN KEY (mentor_id) REFERENCES mentors(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE plan_benefits (
    plan_id INT NOT NULL,
    plan_benefit NVARCHAR(255) NOT NULL,
    PRIMARY KEY (plan_id, plan_benefit),
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE invoices (
    invoice_id INT IDENTITY(1,1) PRIMARY KEY,
    mentee_id INT NOT NULL,
    amount DECIMAL(10,2) CHECK (amount >= 0),
    paid_time DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (mentee_id) REFERENCES mentees(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE slots (
    mentor_id INT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL ,
    slot_status NVARCHAR(50) CHECK (slot_status IN (N'Available', N'Booked', N'Completed')),
    PRIMARY KEY (mentor_id, slot_date, start_time),
    FOREIGN KEY (mentor_id) REFERENCES mentors(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

DROP TABLE IF EXISTS sessions;
GO
CREATE TABLE sessions (
    plan_id INT NOT NULL,
    invoice_id INT NOT NULL,
    mentee_id INT NOT NULL,
    session_id INT IDENTITY(1,1) NOT NULL,
    PRIMARY KEY (plan_id, invoice_id, mentee_id, session_id),

    session_status NVARCHAR(50) CHECK (session_status IN (N'Scheduled', N'Completed', N'Cancelled')) DEFAULT N'Scheduled',
    session_location NVARCHAR(255),
    discuss_info NVARCHAR(MAX),
    start_time TIME NOT NULL,
    session_date DATE NOT NULL,
    mentor_id INT NOT NULL,

    CONSTRAINT FK_sessions_plan
        FOREIGN KEY (plan_id) REFERENCES plans(plan_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT FK_sessions_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,

    CONSTRAINT FK_sessions_mentee
        FOREIGN KEY (mentee_id) REFERENCES mentees(user_id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,

    CONSTRAINT FK_sessions_slot
        FOREIGN KEY (mentor_id, session_date, start_time)
        REFERENCES slots(mentor_id, slot_date, start_time)
);

DROP TABLE IF EXISTS messages;
GO
CREATE TABLE messages (
    mentee_id INT NOT NULL,
    mentor_id INT NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    sent_time DATETIME DEFAULT GETDATE(),
    sent_from NVARCHAR(10) CHECK (sent_from IN (N'Mentor', N'Mentee')) NOT NULL,
    PRIMARY KEY (mentee_id, mentor_id),

    CONSTRAINT FK_messages_mentee
        FOREIGN KEY (mentee_id) REFERENCES mentees(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT FK_messages_mentor
        FOREIGN KEY (mentor_id) REFERENCES mentors(user_id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS feedbacks;
GO
CREATE TABLE feedbacks (
    mentee_id INT NOT NULL,
    mentor_id INT NOT NULL,
    stars INT CHECK (stars BETWEEN 1 AND 5),
    content NVARCHAR(MAX) NOT NULL,
    sent_time DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (mentee_id, mentor_id),

    CONSTRAINT FK_feedbacks_mentee
        FOREIGN KEY (mentee_id) REFERENCES mentees(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT FK_feedbacks_mentor
        FOREIGN KEY (mentor_id) REFERENCES mentors(user_id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);
