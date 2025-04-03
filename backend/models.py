from config import db

class Users(db.Model):
    user_id = db.Column(db.String(5), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email_id = db.Column(db.String(50), unique=True, nullable=False)
    phone_no = db.Column(db.String(15), unique=True, nullable=False)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    joining_date = db.Column(db.Date, nullable=False)
    age = db.Column(db.Integer, nullable=True)
    gender = db.Column(db.String(10), nullable=False)
    role = db.Column(db.String(20), nullable=False)

    def to_json(self):
        return {
            "user_id": self.user_id,
            "name": self.name,
            "email_id": self.email_id,
            "phone_no": self.phone_no,
            "username": self.username,
            "date_of_birth": str(self.date_of_birth),
            "joining_date": str(self.joining_date),
            "age": self.age,
            "gender": self.gender,
            "role": self.role
        }

class Department(db.Model):
    dept_name = db.Column(db.String(20), primary_key=True)
    building = db.Column(db.String(15))
    budget = db.Column(db.Numeric(12,2))

    def to_json(self):
        return {
            "dept_name": self.dept_name,
            "building": self.building,
            "budget": float(self.budget)
        }

class Faculty(db.Model):
    faculty_id = db.Column(db.String(5), primary_key=True)
    dept_name = db.Column(db.String(20), db.ForeignKey('department.dept_name'))
    salary = db.Column(db.Numeric(8,2))

    def to_json(self):
        return {
            "faculty_id": self.faculty_id,
            "dept_name": self.dept_name,
            "salary": float(self.salary)
        }

class Students(db.Model):
    student_id = db.Column(db.String(5), primary_key=True)
    dept_name = db.Column(db.String(20), db.ForeignKey('department.dept_name'))
    total_credits = db.Column(db.Integer)

    def to_json(self):
        return {
            "student_id": self.student_id,
            "dept_name": self.dept_name,
            "total_credits": self.total_credits
        }

class Course(db.Model):
    course_id = db.Column(db.String(8), primary_key=True)
    title = db.Column(db.String(50))
    dept_name = db.Column(db.String(20), db.ForeignKey('department.dept_name'))
    credits = db.Column(db.Integer)

    def to_json(self):
        return {
            "course_id": self.course_id,
            "title": self.title,
            "dept_name": self.dept_name,
            "credits": self.credits
        }

class Teaches(db.Model):
    faculty_id = db.Column(db.String(5), db.ForeignKey('faculty.faculty_id'), primary_key=True)
    course_id = db.Column(db.String(8), db.ForeignKey('course.course_id'), primary_key=True)

    def to_json(self):
        return {
            "faculty_id": self.faculty_id,
            "course_id": self.course_id
        }

class Classroom(db.Model):
    building = db.Column(db.String(15), primary_key=True)
    room_number = db.Column(db.String(7), primary_key=True)
    capacity = db.Column(db.Integer)

    def to_json(self):
        return {
            "building": self.building,
            "room_number": self.room_number,
            "capacity": self.capacity
        }

class AcademicRecords(db.Model):
    __tablename__ = 'academicrecords'
    student_id = db.Column(db.String(5), db.ForeignKey('students.student_id'), primary_key=True)
    course_id = db.Column(db.String(8), db.ForeignKey('course.course_id'), primary_key=True)
    semester = db.Column(db.String(6))
    credits = db.Column(db.Numeric(2,0))
    year = db.Column(db.Numeric(4,0))
    internal_marks = db.Column(db.Numeric(3,0))
    final_marks = db.Column(db.Numeric(3,0))
    grade = db.Column(db.String(2))
    gpa = db.Column(db.Numeric(4,2))
    cgpa = db.Column(db.Numeric(4,2))
    
    def to_json(self):
        return {
            "student_id": self.student_id,
            "course_id": self.course_id,
            "semester": self.semester,
            "credits": float(self.credits),
            "year": int(self.year),
            "internal_marks": float(self.internal_marks),
            "final_marks": float(self.final_marks),
            "grade": self.grade,
            "gpa": float(self.gpa),
            "cgpa": float(self.cgpa)
        }

class Attendance(db.Model):
    __tablename__ = 'attendance'
    student_id = db.Column(db.String(5), db.ForeignKey('students.student_id'), primary_key=True)
    semester = db.Column(db.String(2), primary_key=True)
    course_name = db.Column(db.String(20), primary_key=True)
    course_id = db.Column(db.String(8), db.ForeignKey('course.course_id'))
    total_classes = db.Column(db.Integer)
    present = db.Column(db.Integer)

    def to_json(self):
        return {
            "student_id": self.student_id,
            "semester": self.semester,
            "course_name": self.course_name,
            "course_id": self.course_id,
            "total_classes": self.total_classes,
            "present": self.present
        }

class HostelRooms(db.Model):
    __tablename__ = 'hostelrooms'
    room_type = db.Column(db.String(15), primary_key=True)
    room_fees = db.Column(db.Numeric(6,2))

    def to_json(self):
        return {
            "room_type": self.room_type,
            "room_fees": float(self.room_fees)
        }

class HostelData(db.Model):
    __tablename__ = 'hosteldata'
    student_id = db.Column(db.String(5), db.ForeignKey('students.student_id'), primary_key=True)
    year = db.Column(db.Numeric(4,0), primary_key=True)
    hostel_block = db.Column(db.String(5))
    room_number = db.Column(db.String(7))
    room_type = db.Column(db.String(15), db.ForeignKey('hostelrooms.room_type'))

    def to_json(self):
        return {
            "student_id": self.student_id,
            "year": int(self.year),
            "hostel_block": self.hostel_block,
            "room_number": self.room_number,
            "room_type": self.room_type
        }

class MessPlan(db.Model):
    __tablename__ = 'messplan'
    mess_name = db.Column(db.String(20), primary_key=True)
    monthly_fee = db.Column(db.Numeric(6,2))

    def to_json(self):
        return {
            "mess_name": self.mess_name,
            "monthly_fee": float(self.monthly_fee)
        }

class MessSubscription(db.Model):
    __tablename__ = 'messsubscription'
    student_id = db.Column(db.String(5), db.ForeignKey('students.student_id'), primary_key=True)
    mess_name = db.Column(db.String(20), db.ForeignKey('messplan.mess_name'), primary_key=True)
    month = db.Column(db.String(10), primary_key=True)

    def to_json(self):
        return {
            "student_id": self.student_id,
            "mess_name": self.mess_name,
            "month": self.month
        }

class Achievements(db.Model):
    __tablename__ = 'achievements'
    student_id = db.Column(db.String(5), db.ForeignKey('students.student_id'), primary_key=True)
    achievement_type = db.Column(db.String(20), primary_key=True)
    description = db.Column(db.String(255))
    achievement_date = db.Column(db.Date, primary_key=True)

    def to_json(self):
        return {
            "student_id": self.student_id,
            "achievement_type": self.achievement_type,
            "description": self.description,
            "achievement_date": str(self.achievement_date)
        }

class Clubs(db.Model):
    __tablename__ = 'clubs'
    student_id = db.Column(db.String(5), db.ForeignKey('students.student_id'), primary_key=True)
    club_name = db.Column(db.String(20), primary_key=True)
    status = db.Column(db.String(10))
    
    def to_json(self):
        return {
            "student_id": self.student_id,
            "club_name": self.club_name,
            "status": self.status
        }

class Applications(db.Model):
    __tablename__ = 'applications'
    app_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.String(5), db.ForeignKey('students.student_id'))
    app_type = db.Column(db.String(20))
    app_status = db.Column(db.String(20))
    submission_date = db.Column(db.Date)

    def to_json(self):  
        return {
            "app_id": self.app_id,
            "student_id": self.student_id,
            "app_type": self.app_type,
            "app_status": self.app_status,
            "submission_date": str(self.submission_date)
        }

class WeeklySchedule(db.Model):
    __tablename__ = 'weeklyschedule'
    student_id = db.Column(db.String(5), db.ForeignKey('students.student_id'), primary_key=True)
    faculty_id = db.Column(db.String(5), db.ForeignKey('faculty.faculty_id'))
    course_id = db.Column(db.String(8), db.ForeignKey('course.course_id'), primary_key=True)
    day_of_week = db.Column(db.String(10), primary_key=True)
    start_time = db.Column(db.TIMESTAMP, primary_key=True)
    end_time = db.Column(db.TIMESTAMP)

    def to_json(self):
        return {
            "student_id": self.student_id,
            "faculty_id": self.faculty_id,
            "course_id": self.course_id,
            "day_of_week": self.day_of_week,
            "start_time": str(self.start_time),
            "end_time": str(self.end_time)
        }
