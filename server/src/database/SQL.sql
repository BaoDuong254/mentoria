-- Drop tables if they exist (in reverse order of dependencies)
IF OBJECT_ID('dbo.meetings', 'U') IS NOT NULL DROP TABLE dbo.meetings;
IF OBJECT_ID('dbo.invoices', 'U') IS NOT NULL DROP TABLE dbo.invoices;
IF OBJECT_ID('dbo.slots', 'U') IS NOT NULL DROP TABLE dbo.slots;
IF OBJECT_ID('dbo.bookings', 'U') IS NOT NULL DROP TABLE dbo.bookings;
IF OBJECT_ID('dbo.plan_registerations', 'U') IS NOT NULL DROP TABLE dbo.plan_registerations;
IF OBJECT_ID('dbo.discounts', 'U') IS NOT NULL DROP TABLE dbo.discounts;
IF OBJECT_ID('dbo.mentorships_benefits', 'U') IS NOT NULL DROP TABLE dbo.mentorships_benefits;
IF OBJECT_ID('dbo.plan_mentorships', 'U') IS NOT NULL DROP TABLE dbo.plan_mentorships;
IF OBJECT_ID('dbo.plan_sessions', 'U') IS NOT NULL DROP TABLE dbo.plan_sessions;
IF OBJECT_ID('dbo.plans', 'U') IS NOT NULL DROP TABLE dbo.plans;
IF OBJECT_ID('dbo.own_skill', 'U') IS NOT NULL DROP TABLE dbo.own_skill;
IF OBJECT_ID('dbo.set_skill', 'U') IS NOT NULL DROP TABLE dbo.set_skill;
IF OBJECT_ID('dbo.skills', 'U') IS NOT NULL DROP TABLE dbo.skills;
IF OBJECT_ID('dbo.categories', 'U') IS NOT NULL DROP TABLE dbo.categories;
IF OBJECT_ID('dbo.feedbacks', 'U') IS NOT NULL DROP TABLE dbo.feedbacks;
IF OBJECT_ID('dbo.messages', 'U') IS NOT NULL DROP TABLE dbo.messages;
IF OBJECT_ID('dbo.work_for', 'U') IS NOT NULL DROP TABLE dbo.work_for;
IF OBJECT_ID('dbo.job_title', 'U') IS NOT NULL DROP TABLE dbo.job_title;
IF OBJECT_ID('dbo.companies', 'U') IS NOT NULL DROP TABLE dbo.companies;
IF OBJECT_ID('dbo.mentor_languages', 'U') IS NOT NULL DROP TABLE dbo.mentor_languages;
IF OBJECT_ID('dbo.mentors', 'U') IS NOT NULL DROP TABLE dbo.mentors;
IF OBJECT_ID('dbo.mentees', 'U') IS NOT NULL DROP TABLE dbo.mentees;
IF OBJECT_ID('dbo.sended', 'U') IS NOT NULL DROP TABLE dbo.sended;
IF OBJECT_ID('dbo.notifications', 'U') IS NOT NULL DROP TABLE dbo.notifications;
IF OBJECT_ID('dbo.user_social_links', 'U') IS NOT NULL DROP TABLE dbo.user_social_links;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
GO

CREATE TABLE users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    first_name NVARCHAR(50) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    sex NVARCHAR(10) CHECK (sex IN (N'Male', N'Female')),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    email NVARCHAR(100) UNIQUE NOT NULL CHECK (
        email LIKE '%_@__%.__%'
    ),
    password NVARCHAR(255) NULL CHECK (
        password IS NULL OR LEN(password) >= 60
    ),
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
    link NVARCHAR(255) NOT NULL CHECK (
        link LIKE 'http://%' OR link LIKE 'https://%'
    ),
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
    response_time NVARCHAR(100) NOT NULL,
    cv_url NVARCHAR(255),
    bank_name NVARCHAR(255) NULL,
    account_number NVARCHAR(50) NULL,
    account_holder_name NVARCHAR(255) NULL,
    bank_branch NVARCHAR(255) NULL,
    swift_code NVARCHAR(50) NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
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

CREATE TABLE companies (
    company_id INT IDENTITY(1,1) PRIMARY KEY,
    cname NVARCHAR(255) NOT NULL
);

CREATE TABLE job_title (
    job_title_id INT IDENTITY(1,1) PRIMARY KEY,
    job_name NVARCHAR(255) NOT NULL
);

CREATE TABLE work_for (
    mentor_id INT NOT NULL,
    c_company_id INT NOT NULL,
    current_job_title_id INT NOT NULL,
    PRIMARY KEY (mentor_id, c_company_id),
    FOREIGN KEY (mentor_id) REFERENCES mentors(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (c_company_id) REFERENCES companies(company_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (current_job_title_id) REFERENCES job_title(job_title_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE messages (
    message_id INT IDENTITY(1,1) PRIMARY KEY,
    content NVARCHAR(MAX) NOT NULL,
    sent_time DATETIME DEFAULT GETDATE(),
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES users(user_id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);

CREATE TABLE feedbacks (
    mentee_id INT NOT NULL,
    mentor_id INT NOT NULL,
    stars INT CHECK (stars BETWEEN 1 AND 5),
    content NVARCHAR(MAX) NOT NULL CHECK (
        LEN(LTRIM(RTRIM(content))) > 0
    ),
    sent_time DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (mentee_id, mentor_id),
    FOREIGN KEY (mentee_id) REFERENCES mentees(user_id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    FOREIGN KEY (mentor_id) REFERENCES mentors(user_id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);

CREATE TABLE categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    category_name NVARCHAR(100) NOT NULL,
    super_category_id INT NULL,
    FOREIGN KEY (super_category_id) REFERENCES categories(category_id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);

CREATE TABLE skills (
    skill_id INT IDENTITY(1,1) PRIMARY KEY,
    skill_name NVARCHAR(100) NOT NULL
);

CREATE TABLE set_skill(
    mentor_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (mentor_id, skill_id),
    FOREIGN KEY (mentor_id) REFERENCES mentors(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE own_skill(
    category_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (category_id, skill_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE plans(
    plan_id INT IDENTITY(1,1) PRIMARY KEY,
    plan_description NVARCHAR(MAX) NOT NULL,
    plan_charge DECIMAL(10,2) NOT NULL,
    plan_type NVARCHAR(50) NOT NULL,
    mentor_id INT NOT NULL,
    FOREIGN KEY (mentor_id) REFERENCES mentors(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE plan_sessions(
    sessions_id INT PRIMARY KEY,
    sessions_duration INT NOT NULL CHECK (sessions_duration > 0 AND sessions_duration <= 120),
    FOREIGN KEY (sessions_id) REFERENCES plans(plan_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE plan_mentorships(
    mentorships_id INT PRIMARY KEY,
    calls_per_month INT NOT NULL CHECK (calls_per_month > 0),
    minutes_per_call INT NOT NULL CHECK (minutes_per_call > 0 AND minutes_per_call <= 120),
    FOREIGN KEY (mentorships_id) REFERENCES plans(plan_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE mentorships_benefits(
    mentorships_id INT NOT NULL,
    benefit_description NVARCHAR(255) NOT NULL,
    PRIMARY KEY (mentorships_id, benefit_description),
    FOREIGN KEY (mentorships_id) REFERENCES plan_mentorships(mentorships_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE discounts(
    discount_id INT IDENTITY(1,1) PRIMARY KEY,
    discount_name NVARCHAR(100) NOT NULL,
    discount_type NVARCHAR(50) CHECK (discount_type IN (N'Percentage', N'Fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status NVARCHAR(20) CHECK (status IN (N'Active', N'Inactive')) DEFAULT N'Active',
    usage_limit INT NOT NULL,
    used_count INT DEFAULT 0
);

CREATE TABLE plan_registerations(
    registration_id INT IDENTITY(1,1) PRIMARY KEY,
    message NVARCHAR(MAX) NOT NULL,
    discount_id INT NOT NULL,
    FOREIGN KEY (discount_id) REFERENCES discounts(discount_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE bookings(
    mentee_id INT NOT NULL,
    plan_registerations_id INT NOT NULL,
    plan_id INT NOT NULL,
    PRIMARY KEY (mentee_id, plan_registerations_id),
    FOREIGN KEY (mentee_id) REFERENCES mentees(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (plan_registerations_id) REFERENCES plan_registerations(registration_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);

CREATE TABLE slots(
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    date DATE NOT NULL,
    mentor_id INT NOT NULL,
    status NVARCHAR(20) CHECK (status IN (N'Available', N'Booked', N'Cancelled')) DEFAULT N'Available',
    plan_id INT NOT NULL,
    PRIMARY KEY (mentor_id, start_time, end_time, date),
    FOREIGN KEY (mentor_id) REFERENCES mentors(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CHECK (end_time > start_time)
);

CREATE TABLE invoices(
    invoice_id INT IDENTITY(1,1) PRIMARY KEY,
    plan_registerations_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method NVARCHAR(50) NOT NULL,
    paid_time DATETIME DEFAULT GETDATE(),
    mentee_id INT NOT NULL,
    UNIQUE (invoice_id, plan_registerations_id),
    FOREIGN KEY (plan_registerations_id) REFERENCES plan_registerations(registration_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (mentee_id) REFERENCES mentees(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE meetings(
    meeting_id INT IDENTITY(1,1) PRIMARY KEY,
    invoice_id INT NOT NULL,
    plan_registerations_id INT NOT NULL,
    status NVARCHAR(20) CHECK (status IN (N'Pending',N'Scheduled', N'Completed', N'Cancelled')) DEFAULT N'Pending',
    location NVARCHAR(255) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    date DATE NOT NULL,
    mentor_id INT NOT NULL,
    UNIQUE (meeting_id, invoice_id, plan_registerations_id),
    FOREIGN KEY (invoice_id, plan_registerations_id) REFERENCES invoices(invoice_id, plan_registerations_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (mentor_id, start_time, end_time, date) REFERENCES slots(mentor_id, start_time, end_time, date)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
