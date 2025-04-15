# List of SQL Queries in main.py

This document categorizes the SQL queries used in the Flask application (`main.py`) into **basic** and **advanced** queries, as identified from the provided code. Each query includes its purpose, the route where it’s used, and its approximate SQL equivalent (translated from SQLAlchemy ORM where necessary).

## Basic Queries

1. **Check for Existing Admin User**
   - **Route**: `create_default_admin()`
   - **Purpose**: Checks if an admin user exists before creating a default one.
   - **SQL Equivalent**:
     ```sql
     SELECT * FROM Users WHERE role = 'Admin' LIMIT 1;
     ```

2. **Login User Authentication**
   - **Route**: `/login`
   - **Purpose**: Verifies username and role for login.
   - **SQL Equivalent**:
     ```sql
     SELECT * FROM Users WHERE username = :username LIMIT 1;
     ```

3. **Count Total Students**
   - **Route**: `/admin/home`
   - **Purpose**: Counts the total number of students for the admin dashboard.
   - **SQL Equivalent**:
     ```sql
     SELECT COUNT(*) FROM Students;
     ```

4. **Count Total Faculty**
   - **Route**: `/admin/home`
   - **Purpose**: Counts the total number of faculty for the admin dashboard.
   - **SQL Equivalent**:
     ```sql
     SELECT COUNT(*) FROM Faculty;
     ```

5. **Count Total Courses**
   - **Route**: `/admin/home`
   - **Purpose**: Counts the total number of courses for the admin dashboard.
   - **SQL Equivalent**:
     ```sql
     SELECT COUNT(*) FROM Course;
     ```

6. **Count Total Departments**
   - **Route**: `/admin/home`
   - **Purpose**: Counts the total number of departments for the admin dashboard.
   - **SQL Equivalent**:
     ```sql
     SELECT COUNT(*) FROM Department;
     ```

7. **Fetch Specific Student by ID (API)**
   - **Route**: `/admin/students/<student_id>` (GET)
   - **Purpose**: Retrieves details of a specific student for API response.
   - **SQL Equivalent**:
     ```sql
     SELECT s.*, u.name, u.email_id, u.phone_no, u.username, u.date_of_birth, u.gender
     FROM Students s
     JOIN Users u ON s.student_id = u.user_id
     WHERE s.student_id = :student_id;
     ```

8. **Add New User**
   - **Route**: `/admin/students` (POST)
   - **Purpose**: Inserts a new user into the `Users` table when adding a student.
   - **SQL Equivalent**:
     ```sql
     INSERT INTO Users (user_id, name, email_id, phone_no, username, password, date_of_birth, joining_date, gender, role)
     VALUES (:user_id, :name, :email_id, :phone_no, :username, :password, :date_of_birth, :joining_date, :gender, 'Student');
     ```

9. **Add New Student**
   - **Route**: `/admin/students` (POST)
   - **Purpose**: Inserts a new student into the `Students` table.
   - **SQL Equivalent**:
     ```sql
     INSERT INTO Students (student_id, dept_name, total_credits)
     VALUES (:student_id, :dept_name, :total_credits);
     ```

10. **Update Student**
    - **Route**: `/admin/students/<student_id>` (PUT)
    - **Purpose**: Updates user and student records for a given student ID.
    - **SQL Equivalent**:
      ```sql
      UPDATE Users
      SET name = :name, email_id = :email_id, phone_no = :phone_no, username = :username,
          password = :password, date_of_birth = :date_of_birth, gender = :gender
      WHERE user_id = :student_id;

      UPDATE Students
      SET dept_name = :dept_name, total_credits = :total_credits
      WHERE student_id = :student_id;
      ```

11. **Delete Student**
    - **Route**: `/admin/students/<student_id>` (DELETE)
    - **Purpose**: Deletes records from `Students` and `Users` tables for a given student ID.
    - **SQL Equivalent**:
      ```sql
      DELETE FROM Students WHERE student_id = :student_id;
      DELETE FROM Users WHERE user_id = :student_id;
      ```

12. **Fetch All Departments**
    - **Route**: `/admin/students`, `/admin/faculty`, `/admin/courses`, `/admin/departments`
    - **Purpose**: Retrieves all departments for dropdowns or listings.
    - **SQL Equivalent**:
      ```sql
      SELECT * FROM Department;
      ```

13. **Fetch All Courses**
    - **Route**: `/admin/student/academic`, `/admin/student/attendance`, `/admin/student/schedule`
    - **Purpose**: Retrieves all courses for dropdowns or listings.
    - **SQL Equivalent**:
      ```sql
      SELECT * FROM Course;
      ```

14. **Fetch All Hostel Rooms**
    - **Route**: `/admin/student/hostel`
    - **Purpose**: Retrieves all hostel rooms for display.
    - **SQL Equivalent**:
      ```sql
      SELECT * FROM HostelRooms;
      ```

15. **Fetch All Mess Plans**
    - **Route**: `/admin/student/mess`
    - **Purpose**: Retrieves all mess plans for display.
    - **SQL Equivalent**:
      ```sql
      SELECT * FROM MessPlan;
      ```

16. **Fetch Specific Faculty by ID**
    - **Route**: `/admin/faculty/<faculty_id>` (GET)
    - **Purpose**: Retrieves details of a specific faculty for API response.
    - **SQL Equivalent**:
      ```sql
      SELECT * FROM Faculty WHERE faculty_id = :faculty_id;
      ```

17. **Add New Faculty**
    - **Route**: `/admin/faculty` (POST)
    - **Purpose**: Inserts a new faculty into the `Faculty` table.
    - **SQL Equivalent**:
      ```sql
      INSERT INTO Faculty (faculty_id, name, email_id, phone_no, dept_name, salary, date_of_birth, joining_date, gender)
      VALUES (:faculty_id, :name, :email_id, :phone_no, :dept_name, :salary, :date_of_birth, :joining_date, :gender);
      ```

18. **Update Faculty**
    - **Route**: `/admin/faculty/<faculty_id>` (PUT)
    - **Purpose**: Updates faculty details for a given faculty ID.
    - **SQL Equivalent**:
      ```sql
      UPDATE Faculty
      SET name = :name, email_id = :email_id, phone_no = :phone_no, dept_name = :dept_name,
          salary = :salary, date_of_birth = :date_of_birth, gender = :gender
      WHERE faculty_id = :faculty_id;
      ```

19. **Delete Faculty**
    - **Route**: `/admin/faculty/<faculty_id>` (DELETE)
    - **Purpose**: Deletes a faculty record.
    - **SQL Equivalent**:
      ```sql
      DELETE FROM Faculty WHERE faculty_id = :faculty_id;
      ```

20. **Fetch Specific Course by ID**
    - **Route**: `/admin/courses` (GET with `course_id`)
    - **Purpose**: Retrieves details of a specific course for API response.
    - **SQL Equivalent**:
      ```sql
      SELECT * FROM Course WHERE course_id = :course_id;
      ```

21. **Add New Course**
    - **Route**: `/admin/courses` (POST)
    - **Purpose**: Inserts a new course into the `Course` table.
    - **SQL Equivalent**:
      ```sql
      INSERT INTO Course (course_id, title, dept_name, credits)
      VALUES (:course_id, :title, :dept_name, :credits);
      ```

22. **Update Course**
    - **Route**: `/admin/courses` (PUT)
    - **Purpose**: Updates course details for a given course ID.
    - **SQL Equivalent**:
      ```sql
      UPDATE Course
      SET title = :title, dept_name = :dept_name, credits = :credits
      WHERE course_id = :course_id;
      ```

23. **Delete Course**
    - **Route**: `/admin/courses` (DELETE)
    - **Purpose**: Deletes a course record.
    - **SQL Equivalent**:
      ```sql
      DELETE FROM Course WHERE course_id = :course_id;
      ```

24. **Fetch Specific Department by Name**
    - **Route**: `/admin/departments` (GET with `dept_name`)
    - **Purpose**: Retrieves details of a specific department for API response.
    - **SQL Equivalent**:
      ```sql
      SELECT * FROM Department WHERE dept_name = :dept_name;
      ```

25. **Add New Department**
    - **Route**: `/admin/departments` (POST)
    - **Purpose**: Inserts a new department into the `Department` table.
    - **SQL Equivalent**:
      ```sql
      INSERT INTO Department (dept_name, building, budget)
      VALUES (:dept_name, :building, :budget);
      ```

26. **Update Department**
    - **Route**: `/admin/departments` (PUT)
    - **Purpose**: Updates department details for a given department name.
    - **SQL Equivalent**:
      ```sql
      UPDATE Department
      SET building = :building, budget = :budget
      WHERE dept_name = :dept_name;
      ```

27. **Delete Department**
    - **Route**: `/admin/departments` (DELETE)
    - **Purpose**: Deletes a department record.
    - **SQL Equivalent**:
      ```sql
      DELETE FROM Department WHERE dept_name = :dept_name;
      ```

28. **Check for Existing Clubs**
    - **Route**: `initialize_clubs()`
    - **Purpose**: Checks if clubs exist before initializing default ones.
    - **SQL Equivalent**:
      ```sql
      SELECT COUNT(*) FROM ClubsList;
      ```

29. **Add New Club**
    - **Route**: `initialize_clubs()`
    - **Purpose**: Inserts new clubs into the `ClubsList` table.
    - **SQL Equivalent**:
      ```sql
      INSERT INTO ClubsList (club_name, description, founded_date)
      VALUES (:club_name, :description, :founded_date);
      ```

30. **Fetch Academic Records for CGPA Calculation**
    - **Route**: `/student/home`
    - **Purpose**: Retrieves all academic records for a student to calculate CGPA.
    - **SQL Equivalent**:
      ```sql
      SELECT * FROM AcademicRecords WHERE student_id = :student_id;
      ```

31. **Fetch Recent Applications**
    - **Route**: `/student/home`
    - **Purpose**: Retrieves the 3 most recent applications for a student.
    - **SQL Equivalent**:
      ```sql
      SELECT * FROM Applications
      WHERE student_id = :student_id
      ORDER BY submission_date DESC
      LIMIT 3;
      ```

32. **Fetch Recent Achievements**
    - **Route**: `/student/home`
    - **Purpose**: Retrieves the 3 most recent achievements for a student.
    - **SQL Equivalent**:
      ```sql
      SELECT * FROM Achievements
      WHERE student_id = :student_id
      ORDER BY achievement_date DESC
      LIMIT 3;
      ```

33. **Fetch Club Memberships**
    - **Route**: `/student/home`, `/student/clubs`
    - **Purpose**: Retrieves all club memberships for a student.
    - **SQL Equivalent**:
      ```sql
      SELECT * FROM Clubs WHERE student_id = :student_id;
      ```

34. **Fetch All Clubs**
    - **Route**: `/student/clubs`
    - **Purpose**: Retrieves all available clubs.
    - **SQL Equivalent**:
      ```sql
      SELECT * FROM ClubsList;
      ```

35. **Add New Application**
    - **Route**: `/student/applications` (POST)
    - **Purpose**: Inserts a new application for a student.
    - **SQL Equivalent**:
      ```sql
      INSERT INTO Applications (student_id, app_type, app_status, submission_date, description)
      VALUES (:student_id, :app_type, 'Pending', :submission_date, :description);
      ```

## Advanced Queries

1. **Fetch Paginated Students**
   - **Route**: `/admin/students`
   - **Purpose**: Retrieves a paginated list of students with user details.
   - **SQL Equivalent**:
     ```sql
     SELECT s.*, u.name, u.email_id, u.phone_no, u.username, u.date_of_birth, u.gender
     FROM Students s
     JOIN Users u ON s.student_id = u.user_id
     LIMIT 10 OFFSET (:page - 1) * 10;
     ```

2. **Fetch All Students with User Details**
   - **Route**: `/admin/student/academic`, `/admin/student/attendance`, `/admin/student/hostel`, `/admin/student/mess`, `/admin/student/achievements`, `/admin/student/clubs`, `/admin/student/schedule`
   - **Purpose**: Retrieves all students joined with user details for various admin pages.
   - **SQL Equivalent**:
     ```sql
     SELECT s.*, u.name, u.email_id, u.phone_no, u.username, u.date_of_birth, u.gender
     FROM Students s
     JOIN Users u ON s.student_id = u.user_id;
     ```

3. **Fetch Applications with Student Details**
   - **Route**: `/admin/student/applications`
   - **Purpose**: Retrieves all applications joined with student and user details.
   - **SQL Equivalent**:
     ```sql
     SELECT a.*, s.*, u.name, u.email_id
     FROM Applications a
     JOIN Students s ON a.student_id = s.student_id
     JOIN Users u ON s.student_id = u.user_id;
     ```

4. **Test Departments (ORM and Raw SQL)**
   - **Route**: `/test_departments`
   - **Purpose**: Retrieves all departments using both ORM and raw SQL for testing.
   - **SQL Equivalent**:
     ```sql
     SELECT * FROM Department;
     SELECT * FROM DEPARTMENT;
     ```

5. **Fetch Paginated Faculty with Filters**
   - **Route**: `/admin/faculty`
   - **Purpose**: Retrieves a paginated list of faculty with optional department and search filters.
   - **SQL Equivalent**:
     ```sql
     SELECT * FROM Faculty
     WHERE (:department IS NULL OR dept_name = :department)
     AND (:search IS NULL OR name ILIKE '%' || :search || '%'
          OR faculty_id ILIKE '%' || :search || '%'
          OR email_id ILIKE '%' || :search || '%')
     LIMIT 10 OFFSET (:page - 1) * 10;
     ```

6. **Fetch Faculty by Department**
   - **Route**: `/admin/departments` (GET with `dept_name`)
   - **Purpose**: Retrieves all faculty for a specific department.
   - **SQL Equivalent**:
     ```sql
     SELECT * FROM Faculty WHERE dept_name = :dept_name;
     ```

7. **Fetch Courses by Department**
   - **Route**: `/admin/departments` (GET with `dept_name`)
   - **Purpose**: Retrieves all courses for a specific department.
   - **SQL Equivalent**:
     ```sql
     SELECT * FROM Course WHERE dept_name = :dept_name;
     ```

8. **Fetch Paginated Courses with Filters**
   - **Route**: `/admin/courses`
   - **Purpose**: Retrieves a paginated list of courses with optional department and search filters.
   - **SQL Equivalent**:
     ```sql
     SELECT * FROM Course
     WHERE (:department IS NULL OR dept_name = :department)
     AND (:search IS NULL OR course_id ILIKE '%' || :search || '%'
          OR title ILIKE '%' || :search || '%')
     LIMIT 10 OFFSET (:page - 1) * 10;
     ```

9. **Fetch Student Information for Student Dashboard**
   - **Route**: `/student/home`
   - **Purpose**: Retrieves student and user details for the student dashboard.
   - **SQL Equivalent**:
     ```sql
     SELECT s.*, u.name, u.email_id, u.phone_no, u.username, u.date_of_birth, u.gender
     FROM Students s
     JOIN Users u ON s.student_id = u.user_id
     WHERE s.student_id = :student_id;
     ```

10. **Fetch Today’s Schedule**
    - **Route**: `/student/home`
    - **Purpose**: Retrieves the student’s schedule for the current day.
    - **SQL Equivalent**:
      ```sql
      SELECT w.*, c.title
      FROM WeeklySchedule w
      JOIN Course c ON w.course_id = c.course_id
      WHERE w.student_id = :student_id AND w.day_of_week = :today;
      ```

11. **Fetch Current Year Hostel Data**
    - **Route**: `/student/home`
    - **Purpose**: Retrieves hostel data for the current year for a student.
    - **SQL Equivalent**:
      ```sql
      SELECT hd.*, hr.room_fees
      FROM HostelData hd
      JOIN HostelRooms hr ON hd.room_type = hr.room_type
      WHERE hd.student_id = :student_id AND hd.year = :current_year
      LIMIT 1;
      ```

12. **Fetch Current Month Mess Subscription**
    - **Route**: `/student/home`
    - **Purpose**: Retrieves mess subscription for the current month.
    - **SQL Equivalent**:
      ```sql
      SELECT ms.*, mp.monthly_fee
      FROM MessSubscription ms
      JOIN MessPlan mp ON ms.mess_name = mp.mess_name
      WHERE ms.student_id = :student_id AND ms.month = :current_month
      LIMIT 1;
      ```

13. **Fetch Paginated Academic Records with Course Details**
    - **Route**: `/student/academic`
    - **Purpose**: Retrieves paginated academic records joined with course details, with optional semester filter.
    - **SQL Equivalent**:
      ```sql
      SELECT ar.*, c.title, c.credits
      FROM AcademicRecords ar
      JOIN Course c ON ar.course_id = c.course_id
      WHERE ar.student_id = :student_id
      AND (:semester IS NULL OR (ar.semester = :semester AND ar.year = :year))
      ORDER BY ar.year DESC, ar.semester DESC
      LIMIT 10 OFFSET (:page - 1) * 10;
      ```

14. **Fetch Unique Semesters**
    - **Route**: `/student/academic`
    - **Purpose**: Retrieves distinct semesters for a student for the filter dropdown.
    - **SQL Equivalent**:
      ```sql
      SELECT DISTINCT semester, year
      FROM AcademicRecords
      WHERE student_id = :student_id;
      ```

15. **Calculate Semester GPAs**
    - **Route**: `/student/academic`
    - **Purpose**: Calculates GPA for each semester by joining academic records with course credits.
    - **SQL Equivalent**:
      ```sql
      SELECT ar.*, c.credits
      FROM AcademicRecords ar
      JOIN Course c ON ar.course_id = c.course_id
      WHERE ar.student_id = :student_id AND ar.semester = :semester AND ar.year = :year;
      ```

16. **Calculate Overall CGPA**
    - **Route**: `/student/academic`
    - **Purpose**: Calculates CGPA across all semesters using academic records and course credits.
    - **SQL Equivalent**:
      ```sql
      SELECT ar.*, c.credits
      FROM AcademicRecords ar
      JOIN Course c ON ar.course_id = c.course_id
      WHERE ar.student_id = :student_id;
      ```

17. **Fetch Paginated Attendance Records**
    - **Route**: `/student/attendance`
    - **Purpose**: Retrieves paginated attendance records with course details and optional course filter.
    - **SQL Equivalent**:
      ```sql
      SELECT a.*, c.title
      FROM Attendance a
      JOIN Course c ON a.course_id = c.course_id
      WHERE a.student_id = :student_id
      AND (:course_id IS NULL OR a.course_id = :course_id)
      ORDER BY a.year DESC, a.semester DESC, a.course_id
      LIMIT 10 OFFSET (:page - 1) * 10;
      ```

18. **Fetch Courses for Attendance Filter**
    - **Route**: `/student/attendance`
    - **Purpose**: Retrieves distinct courses with attendance records for a student.
    - **SQL Equivalent**:
      ```sql
      SELECT DISTINCT c.course_id, c.title
      FROM Course c
      JOIN Attendance a ON a.course_id = c.course_id
      WHERE a.student_id = :student_id;
      ```

19. **Calculate Overall Attendance Percentage**
    - **Route**: `/student/attendance`
    - **Purpose**: Calculates the average attendance percentage for a student.
    - **SQL Equivalent**:
      ```sql
      SELECT AVG(attendance_percentage)
      FROM Attendance
      WHERE student_id = :student_id;
      ```

20. **Fetch Hostel History**
    - **Route**: `/student/hostel`
    - **Purpose**: Retrieves all hostel data for a student with room fees, ordered by year.
    - **SQL Equivalent**:
      ```sql
      SELECT hd.*, hr.room_fees
      FROM HostelData hd
      JOIN HostelRooms hr ON hd.room_type = hr.room_type
      WHERE hd.student_id = :student_id
      ORDER BY hd.year DESC;
      ```

21. **Fetch Current Mess Subscription with History**
    - **Route**: `/student/mess`
    - **Purpose**: Retrieves the current mess subscription and past 6 months’ subscriptions.
    - **SQL Equivalent**:
      ```sql
      SELECT ms.*, mp.monthly_fee
      FROM MessSubscription ms
      JOIN MessPlan mp ON ms.mess_name = mp.mess_name
      WHERE ms.student_id = :student_id AND ms.month = :current_month
      LIMIT 1;

      SELECT ms.*, mp.monthly_fee
      FROM MessSubscription ms
      JOIN MessPlan mp ON ms.mess_name = mp.mess_name
      WHERE ms.student_id = :student_id AND ms.month IN (:month1, :month2, ..., :month6)
      ORDER BY CASE ms.month
          WHEN :month1 THEN 0
          WHEN :month2 THEN 1
          ...
          ELSE 99
      END;
      ```

22. **Fetch Paginated Achievements**
    - **Route**: `/student/achievements`
    - **Purpose**: Retrieves paginated achievements for a student, ordered by date.
    - **SQL Equivalent**:
      ```sql
      SELECT * FROM Achievements
      WHERE student_id = :student_id
      ORDER BY achievement_date DESC
      LIMIT 10 OFFSET (:page - 1) * 10;
      ```

23. **Fetch Achievement Types**
    - **Route**: `/student/achievements`
    - **Purpose**: Retrieves distinct achievement types for a student.
    - **SQL Equivalent**:
      ```sql
      SELECT DISTINCT achievement_type
      FROM Achievements
      WHERE student_id = :student_id;
      ```

24. **Check Existing Club Membership**
    - **Route**: `/student/clubs` (POST)
    - **Purpose**: Checks if a student is already a member of a club before joining/leaving.
    - **SQL Equivalent**:
      ```sql
      SELECT * FROM Clubs
      WHERE student_id = :student_id AND club_name = :club_name
      LIMIT 1;
      ```

25. **Join Club**
    - **Route**: `/student/clubs` (POST)
    - **Purpose**: Inserts or updates a club membership for a student.
    - **SQL Equivalent**:
      ```sql
      INSERT INTO Clubs (student_id, club_name, status, join_date)
      VALUES (:student_id, :club_name, 'Joined', :join_date);

      UPDATE Clubs
      SET status = 'Joined', join_date = :join_date
      WHERE student_id = :student_id AND club_name = :club_name;
      ```

26. **Leave Club**
    - **Route**: `/student/clubs` (POST)
    - **Purpose**: Updates a club membership to ‘Left’ status.
    - **SQL Equivalent**:
      ```sql
      UPDATE Clubs
      SET status = 'Left'
      WHERE student_id = :student_id AND club_name = :club_name;
      ```

27. **Fetch Paginated Applications**
    - **Route**: `/student/applications`
    - **Purpose**: Retrieves paginated applications for a student, ordered by submission date.
    - **SQL Equivalent**:
      ```sql
      SELECT * FROM Applications
      WHERE student_id = :student_id
      ORDER BY submission_date DESC
      LIMIT 5 OFFSET (:page - 1) * 5;
      ```

28. **Fetch Weekly Schedule by Day**
    - **Route**: `/student/schedule`
    - **Purpose**: Retrieves the student’s schedule for each day of the week, joined with course and faculty details.
    - **SQL Equivalent**:
      ```sql
      SELECT w.*, c.title, f.name
      FROM WeeklySchedule w
      JOIN Course c ON w.course_id = c.course_id
      LEFT JOIN Faculty f ON w.faculty_id = f.faculty_id
      WHERE w.student_id = :student_id AND w.day_of_week = :day
      ORDER BY w.start_time;
      ```

29. **Fetch All Courses for Schedule Reference**
    - **Route**: `/student/schedule`
    - **Purpose**: Retrieves all courses for reference in the schedule page.
    - **SQL Equivalent**:
      ```sql
      SELECT course_id, title FROM Course;
      ```

30. **Fetch All Faculty for Schedule Reference**
    - **Route**: `/student/schedule`
    - **Purpose**: Retrieves all faculty for reference in the schedule page.
    - **SQL Equivalent**:
      ```sql
      SELECT faculty_id, name FROM Faculty;
      ```