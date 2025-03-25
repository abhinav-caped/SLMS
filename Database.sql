CREATE DATABASE UniversityDB;
USE UniversityDB;

-- Classroom Table
CREATE TABLE Classroom (
    building VARCHAR(15),
    room_number VARCHAR(7),
    capacity NUMERIC(4,0) CONSTRAINT chk_capacity CHECK (capacity >= 65),
    PRIMARY KEY (building, room_number)
);

-- Department Table
CREATE TABLE Department (
    dept_name VARCHAR(20),
    building VARCHAR(15),
    budget NUMERIC(12,2) CONSTRAINT chk_budget CHECK (budget >= 200000000),
    PRIMARY KEY (dept_name)
);

-- Course Table
CREATE TABLE Course (
    course_id VARCHAR(8),
    title VARCHAR(50),
    dept_name VARCHAR(20),
    credits NUMERIC(2,0) CONSTRAINT chk_credits CHECK (credits > 0),
    PRIMARY KEY (course_id),
    FOREIGN KEY (dept_name) REFERENCES Department
        ON DELETE SET NULL
);

-- Instructor Table
CREATE TABLE Instructor (
    ID VARCHAR(5),
    name VARCHAR(20) NOT NULL,
    dept_name VARCHAR(20),
    salary NUMERIC(8,2) CONSTRAINT chk_salary CHECK (salary >= 50000),
    PRIMARY KEY (ID),
    FOREIGN KEY (dept_name) REFERENCES Department
        ON DELETE SET NULL
);

-- Teaches Table
CREATE TABLE Teaches (
    ID VARCHAR(5),
    course_id VARCHAR(8),
    PRIMARY KEY (ID, course_id),
    FOREIGN KEY (course_id) REFERENCES Course
        ON DELETE CASCADE,
    FOREIGN KEY (ID) REFERENCES Instructor
        ON DELETE CASCADE
);

-- Student Table
CREATE TABLE Student (
    ID VARCHAR(5),
    name VARCHAR(20) NOT NULL,
    dept_name VARCHAR(20),
    email_id VARCHAR(50) NOT NULL CONSTRAINT chk_email CHECK (email_id LIKE '%@%.%'),
    phone_no VARCHAR(15) NOT NULL CONSTRAINT chk_phone CHECK (phone_no REGEXP '^[0-9]{10}$'),
    username VARCHAR(20) NOT NULL,
    password VARCHAR(20) NOT NULL,
    tot_cred NUMERIC(3,0) CONSTRAINT chk_tot_cred CHECK (tot_cred >= 0),
    PRIMARY KEY (ID),
    FOREIGN KEY (dept_name) REFERENCES Department
        ON DELETE SET NULL
);

-- Semester Data Table
CREATE TABLE Semester (
    ID VARCHAR(5),
    semester VARCHAR(6),
    year NUMERIC(4,0),
    course_id VARCHAR(8),
    section VARCHAR(8),
    building VARCHAR(15),
    room_number VARCHAR(7),
    total_marks NUMERIC(3,0) CONSTRAINT chk_total_marks CHECK (total_marks BETWEEN 0 AND 100),
    internal_marks NUMERIC(3,0) CONSTRAINT chk_internal_marks CHECK (internal_marks BETWEEN 0 AND 50),
    final_marks NUMERIC(3,0) CONSTRAINT chk_final_marks CHECK (final_marks BETWEEN 0 AND 50),
    attendance_percent NUMERIC(3,0) CONSTRAINT chk_attendance CHECK (attendance_percent BETWEEN 0 AND 100),
    grade VARCHAR(2),
    gpa NUMERIC(3,2) CONSTRAINT chk_gpa CHECK (gpa BETWEEN 0 AND 10),
    cgpa NUMERIC(3,2) CONSTRAINT chk_cgpa CHECK (cgpa BETWEEN 0 AND 10),
    PRIMARY KEY (ID, semester, year, course_id),
    FOREIGN KEY (ID) REFERENCES Student
        ON DELETE CASCADE,
    FOREIGN KEY (building, room_number) REFERENCES Classroom
        ON DELETE SET NULL
);

-- Hostel Data Table
CREATE TABLE HostelData (
    ID VARCHAR(5),
    year NUMERIC(4,0),
    hostel_block VARCHAR(5),
    room_number VARCHAR(7),
    room_type VARCHAR(15),
    room_fees NUMERIC(6,2) CONSTRAINT chk_room_fees CHECK (room_fees <= 150000),
    PRIMARY KEY (ID, year),
    FOREIGN KEY (ID) REFERENCES Student
        ON DELETE CASCADE
);

-- Mess Data Table
CREATE TABLE MessData (
    ID VARCHAR(5),
    mess_name VARCHAR(20),
    month VARCHAR(10),
    mess_fees NUMERIC(6,2) CONSTRAINT chk_mess_fees CHECK (mess_fees <= 6500),
    PRIMARY KEY (ID, mess_name, month),
    FOREIGN KEY (ID) REFERENCES Student
        ON DELETE CASCADE
);

-- Achievements Table
CREATE TABLE Achievements (
    ID VARCHAR(5),
    achievement_type VARCHAR(20),
    description TEXT,
    achievement_date DATE,
    PRIMARY KEY (ID, achievement_type, achievement_date),
    FOREIGN KEY (ID) REFERENCES Student
        ON DELETE CASCADE
);

-- Clubs Table
CREATE TABLE Clubs (
    ID VARCHAR(5),
    club_name VARCHAR(20),
    status ENUM('Joined', 'Left'),
    PRIMARY KEY (ID, club_name),
    FOREIGN KEY (ID) REFERENCES Student
        ON DELETE CASCADE
);

-- Applications Table
CREATE TABLE Applications (
    app_id INT AUTO_INCREMENT,
    ID VARCHAR(5),
    app_type VARCHAR(20),
    app_status ENUM('Pending', 'Approved', 'Rejected'),
    submission_date DATE,
    PRIMARY KEY (app_id),
    FOREIGN KEY (ID) REFERENCES Student
        ON DELETE CASCADE
);

-- Weekly Schedule Table
CREATE TABLE WeeklySchedule (
    ID VARCHAR(5),
    instructor_id VARCHAR(5),
    instructor_name VARCHAR(20),
    day_of_week VARCHAR(10),
    course_id VARCHAR(8),
    start_time TIME,
    end_time TIME,
    PRIMARY KEY (ID, day_of_week, start_time),
    FOREIGN KEY (ID) REFERENCES Student
        ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES Instructor
        ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Course
        ON DELETE CASCADE
);