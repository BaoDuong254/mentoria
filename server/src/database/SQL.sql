CREATE TABLE users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    first_name NVARCHAR(50) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    sex NVARCHAR(10) CHECK (sex IN (N'Male', N'Female')),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    avatar_url NVARCHAR(255) NULL,
    country NVARCHAR(100) NULL,
    role NVARCHAR(50) CHECK (role IN (N'Mentee', N'Mentor', N'Admin')) DEFAULT N'Mentee',
    timezone NVARCHAR(50) NULL,
    status NVARCHAR(20) CHECK (status IN (N'Active', N'Banned', N'Pending')) DEFAULT N'Active'
    is_email_verified BOOLEAN DEFAULT 0
    otp NVARCHAR(6) NULL,
    otp_expiration DATETIME NULL
);
