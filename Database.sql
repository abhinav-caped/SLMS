-- Users Table
CREATE TABLE Users (
    user_id VARCHAR2(5) PRIMARY KEY,
    name VARCHAR2(50) NOT NULL,
    email_id VARCHAR2(50) UNIQUE NOT NULL CHECK (email_id LIKE '%@%.%'),
    phone_no VARCHAR2(15) UNIQUE NOT NULL CHECK (phone_no LIKE '__________'),
    username VARCHAR2(20) UNIQUE NOT NULL,
    password VARCHAR2(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    joining_date DATE NOT NULL,
    gender VARCHAR2(10) CHECK (gender IN ('Male', 'Female', 'Other')) NOT NULL,
    role VARCHAR2(20) CHECK (role IN ('Student', 'Faculty', 'Admin')) NOT NULL
);

-- Department Table
CREATE TABLE Department (
    dept_name VARCHAR2(20) PRIMARY KEY,
    building VARCHAR2(15),
    budget NUMERIC(12,2) CHECK (budget >= 200000000)
);

-- Faculty Table (without User constraint)
CREATE TABLE Faculty (
    faculty_id VARCHAR2(5) PRIMARY KEY,
    name VARCHAR2(50) NOT NULL,
    email_id VARCHAR2(50) UNIQUE NOT NULL CHECK (email_id LIKE '%@%.%'),
    phone_no VARCHAR2(15) UNIQUE NOT NULL CHECK (phone_no LIKE '__________'),
    dept_name VARCHAR2(20),
    salary NUMERIC(8,2) CHECK (salary >= 50000),
    date_of_birth DATE,
    joining_date DATE,
    gender VARCHAR2(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    FOREIGN KEY (dept_name) REFERENCES Department(dept_name) ON DELETE SET NULL
);

-- Student Table
CREATE TABLE Students (
    student_id VARCHAR2(5) PRIMARY KEY,
    dept_name VARCHAR2(20),
    total_credits NUMERIC(3,0) CHECK (total_credits >= 0),
    FOREIGN KEY (student_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (dept_name) REFERENCES Department(dept_name) ON DELETE SET NULL
);

-- Course Table
CREATE TABLE Course (
    course_id VARCHAR2(8) PRIMARY KEY,
    title VARCHAR2(50),
    dept_name VARCHAR2(20),
    credits NUMERIC(2,0) CHECK (credits > 0),
    FOREIGN KEY (dept_name) REFERENCES Department(dept_name) ON DELETE SET NULL
);

-- Teaches Table (Faculty-Course Association)
CREATE TABLE Teaches (
    faculty_id VARCHAR2(5),
    course_id VARCHAR2(8),
    PRIMARY KEY (faculty_id, course_id),
    FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Course(course_id) ON DELETE CASCADE
);

-- Classroom Table
CREATE TABLE Classroom (
    building VARCHAR2(15),
    room_number VARCHAR2(7),
    capacity NUMERIC(4,0) CHECK (capacity >= 65),
    PRIMARY KEY (building, room_number)
);

-- Academic Records Table (with composite primary key)
CREATE TABLE AcademicRecords (
    student_id VARCHAR2(5),
    course_id VARCHAR2(8),
    semester VARCHAR2(6),
    year NUMERIC(4,0),
    internal_marks NUMERIC(3,0) CHECK (internal_marks BETWEEN 0 AND 50),
    final_marks NUMERIC(3,0) CHECK (final_marks BETWEEN 0 AND 50),
    grade VARCHAR2(2) CHECK (grade in ('A+', 'A', 'B', 'C', 'D', 'E', 'F', 'DT')),
    gpa NUMERIC(4,2) CHECK (gpa BETWEEN 0 AND 10.00),
    cgpa NUMERIC(4,2) CHECK (cgpa BETWEEN 0 AND 10.00),
    PRIMARY KEY (student_id, course_id, semester, year),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Course(course_id) ON DELETE CASCADE
);

-- Attendance Table (with composite primary key)
CREATE TABLE Attendance (
    student_id VARCHAR2(5),
    course_id VARCHAR2(8),
    semester VARCHAR2(6),
    year NUMERIC(4,0),
    total_classes NUMBER(2,0) CHECK (total_classes >= 0),
    present NUMBER(2,0) CHECK (present >= 0),
    absent NUMBER(2,0) GENERATED ALWAYS AS (total_classes - present) VIRTUAL,
    attendance_percentage NUMBER(5,2) GENERATED ALWAYS AS (
        CASE WHEN total_classes > 0 THEN (present / total_classes) * 100 ELSE 0 END
    ) VIRTUAL,
    PRIMARY KEY (student_id, course_id, semester, year),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Course(course_id) ON DELETE CASCADE
);

-- Hostel Rooms Table
CREATE TABLE HostelRooms (
    room_type VARCHAR2(15) PRIMARY KEY,
    room_fees NUMERIC(6,2) CHECK (room_fees <= 150000)
);

-- Hostel Data Table
CREATE TABLE HostelData (
    student_id VARCHAR2(5),
    year NUMERIC(4,0),
    hostel_block VARCHAR2(5),
    room_number VARCHAR2(7),
    room_type VARCHAR2(15),
    PRIMARY KEY (student_id, year),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (room_type) REFERENCES HostelRooms(room_type)
);

-- Mess Plan Table
CREATE TABLE MessPlan (
    mess_name VARCHAR2(20) PRIMARY KEY,
    monthly_fee NUMERIC(6,2) CHECK (monthly_fee <= 6500)
);

-- Mess Subscription Table
CREATE TABLE MessSubscription (
    student_id VARCHAR2(5),
    mess_name VARCHAR2(20),
    month VARCHAR2(10),
    PRIMARY KEY (student_id, mess_name, month),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (mess_name) REFERENCES MessPlan(mess_name)
);

-- Achievements Table
CREATE TABLE Achievements (
    student_id VARCHAR2(5),
    achievement_type VARCHAR2(20),
    description VARCHAR2(255),
    achievement_date DATE,
    PRIMARY KEY (student_id, achievement_type, achievement_date),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
);

-- Clubs List Table
CREATE TABLE ClubsList (
    club_name VARCHAR2(20) PRIMARY KEY,
    description VARCHAR2(255),
    founded_date DATE
);

-- Clubs Table
CREATE TABLE Clubs (
    student_id VARCHAR2(5),
    club_name VARCHAR2(20),
    status VARCHAR2(10) CHECK (status IN ('Joined', 'Left')),
    join_date DATE,
    PRIMARY KEY (student_id, club_name),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (club_name) REFERENCES ClubsList(club_name) ON DELETE CASCADE
);

-- Applications Table
CREATE TABLE Applications (
    app_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    student_id VARCHAR2(5),
    app_type VARCHAR2(20),
    app_status VARCHAR2(20) CHECK (app_status IN ('Pending', 'Approved', 'Rejected')),
    submission_date DATE,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
);

-- Weekly Schedule Table
CREATE TABLE WeeklySchedule (
    student_id VARCHAR2(5),
    faculty_id VARCHAR2(5),
    course_id VARCHAR2(8),
    day_of_week VARCHAR2(10),
    start_time VARCHAR2(5), -- Format: "HH:MM"
    end_time VARCHAR2(5),   -- Format: "HH:MM"
    PRIMARY KEY (student_id, course_id, day_of_week, start_time),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Course(course_id) ON DELETE CASCADE
);
