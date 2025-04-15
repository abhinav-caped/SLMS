from config import db
from sqlalchemy import text


class Users(db.Model):
    __tablename__ = 'USERS'
    user_id = db.Column(db.String(5), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email_id = db.Column(db.String(50), unique=True, nullable=False)
    phone_no = db.Column(db.String(15), unique=True, nullable=False)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)  
    date_of_birth = db.Column(db.Date, nullable=False)
    joining_date = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    
    @classmethod
    def create(cls, **kwargs):
        kwargs['date_of_birth'] = text("TO_DATE(:date_of_birth, 'YYYY-MM-DD')")
        kwargs['joining_date'] = text("TO_DATE(:joining_date, 'YYYY-MM-DD HH24:MI:SS')")
        return cls(**kwargs)
    
    # Relationship with Students
    student_profile = db.relationship('Students', backref='user', uselist=False, cascade='all, delete-orphan')
    
    def to_json(self):
        return {
            "user_id": self.user_id,
            "name": self.name,
            "email_id": self.email_id,
            "phone_no": self.phone_no,
            "username": self.username,
            "password": self.password,  # Including password in JSON for development
            "date_of_birth": self.date_of_birth.strftime('%Y-%m-%d') if self.date_of_birth else None,
            "joining_date": self.joining_date.strftime('%Y-%m-%d') if self.joining_date else None,
            "gender": self.gender,
            "role": self.role
        }


class Department(db.Model):
    __tablename__ = 'DEPARTMENT'
    dept_name = db.Column(db.String(20), primary_key=True)
    building = db.Column(db.String(15))
    budget = db.Column(db.Numeric(12, 2))
    
    # Relationships
    faculty = db.relationship('Faculty', backref='department')
    students = db.relationship('Students', backref='department')
    courses = db.relationship('Course', backref='department')
    
    def to_json(self):
        return {
            "dept_name": self.dept_name,
            "building": self.building,
            "budget": float(self.budget) if self.budget else 0
        }


class Faculty(db.Model):
    __tablename__ = 'FACULTY'
    faculty_id = db.Column(db.String(5), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email_id = db.Column(db.String(50), unique=True, nullable=False)
    phone_no = db.Column(db.String(15), unique=True, nullable=False)
    dept_name = db.Column(db.String(20), db.ForeignKey('DEPARTMENT.dept_name', ondelete='SET NULL'))
    salary = db.Column(db.Numeric(8, 2))
    date_of_birth = db.Column(db.Date)
    joining_date = db.Column(db.Date)
    gender = db.Column(db.String(10))
    
    # Relationships
    teaches = db.relationship('Teaches', backref='faculty', cascade='all, delete-orphan')
    schedules = db.relationship('WeeklySchedule', backref='faculty', cascade='all, delete-orphan')
    
    def to_json(self):
        return {
            "faculty_id": self.faculty_id,
            "name": self.name,
            "email_id": self.email_id,
            "phone_no": self.phone_no,
            "dept_name": self.dept_name,
            "salary": float(self.salary) if self.salary else 0,
            "date_of_birth": self.date_of_birth.strftime('%Y-%m-%d') if self.date_of_birth else None,
            "joining_date": self.joining_date.strftime('%Y-%m-%d') if self.joining_date else None,
            "gender": self.gender
        }


class Students(db.Model):
    __tablename__ = 'STUDENTS'
    student_id = db.Column(db.String(5), db.ForeignKey('USERS.user_id', ondelete='CASCADE'), primary_key=True)
    dept_name = db.Column(db.String(20), db.ForeignKey('DEPARTMENT.dept_name', ondelete='SET NULL'))
    total_credits = db.Column(db.Numeric(3, 0))
    
    # Relationships
    academic_records = db.relationship('AcademicRecords', backref='student', cascade='all, delete-orphan')
    attendance = db.relationship('Attendance', backref='student', cascade='all, delete-orphan')
    hostel_data = db.relationship('HostelData', backref='student', cascade='all, delete-orphan')
    mess_subscriptions = db.relationship('MessSubscription', backref='student', cascade='all, delete-orphan')
    achievements = db.relationship('Achievements', backref='student', cascade='all, delete-orphan')
    clubs = db.relationship('Clubs', backref='student', cascade='all, delete-orphan')
    applications = db.relationship('Applications', backref='student', cascade='all, delete-orphan')
    schedules = db.relationship('WeeklySchedule', backref='student', cascade='all, delete-orphan')
    
    def to_json(self):
        return {
            "student_id": self.student_id,
            "dept_name": self.dept_name,
            "total_credits": int(self.total_credits) if self.total_credits else 0,
            "name": self.user.name if self.user else None,
            "email_id": self.user.email_id if self.user else None,
            "phone_no": self.user.phone_no if self.user else None
        }


class Course(db.Model):
    __tablename__ = 'COURSE'
    course_id = db.Column(db.String(8), primary_key=True)
    title = db.Column(db.String(50))
    dept_name = db.Column(db.String(20), db.ForeignKey('DEPARTMENT.dept_name', ondelete='SET NULL'))
    credits = db.Column(db.Numeric(2, 0))
    
    # Relationships
    teaches = db.relationship('Teaches', backref='course', cascade='all, delete-orphan')
    academic_records = db.relationship('AcademicRecords', backref='course', cascade='all, delete-orphan')
    attendance = db.relationship('Attendance', backref='course', cascade='all, delete-orphan')
    schedules = db.relationship('WeeklySchedule', backref='course', cascade='all, delete-orphan')
    
    def to_json(self):
        return {
            "course_id": self.course_id,
            "title": self.title,
            "dept_name": self.dept_name,
            "credits": int(self.credits) if self.credits else 0
        }


class Teaches(db.Model):
    __tablename__ = 'TEACHES'
    faculty_id = db.Column(db.String(5), db.ForeignKey('FACULTY.faculty_id', ondelete='CASCADE'), primary_key=True)
    course_id = db.Column(db.String(8), db.ForeignKey('COURSE.course_id', ondelete='CASCADE'), primary_key=True)


class Classroom(db.Model):
    __tablename__ = 'CLASSROOM'  # Changed to uppercase
    building = db.Column(db.String(15), primary_key=True)
    room_number = db.Column(db.String(7), primary_key=True)
    capacity = db.Column(db.Numeric(4, 0))
    
    def to_json(self):
        return {
            "building": self.building,
            "room_number": self.room_number,
            "capacity": int(self.capacity) if self.capacity else 0
        }


class AcademicRecords(db.Model):
    __tablename__ = 'ACADEMICRECORDS'
    student_id = db.Column(db.String(5), db.ForeignKey('STUDENTS.student_id', ondelete='CASCADE'), primary_key=True)
    course_id = db.Column(db.String(8), db.ForeignKey('COURSE.course_id', ondelete='CASCADE'), primary_key=True)
    semester = db.Column(db.String(6), primary_key=True)
    year = db.Column(db.Numeric(4, 0), primary_key=True)
    internal_marks = db.Column(db.Numeric(3, 0))
    final_marks = db.Column(db.Numeric(3, 0))
    grade = db.Column(db.String(2))
    gpa = db.Column(db.Numeric(4, 2))
    cgpa = db.Column(db.Numeric(4, 2))
    
    def to_json(self):
        return {
            "student_id": self.student_id,
            "course_id": self.course_id,
            "semester": self.semester,
            "year": int(self.year) if self.year else 0,
            "internal_marks": int(self.internal_marks) if self.internal_marks else 0,
            "final_marks": int(self.final_marks) if self.final_marks else 0,
            "grade": self.grade,
            "gpa": float(self.gpa) if self.gpa else 0,
            "cgpa": float(self.cgpa) if self.cgpa else 0
        }


class Attendance(db.Model):
    __tablename__ = 'ATTENDANCE'
    student_id = db.Column(db.String(5), db.ForeignKey('STUDENTS.student_id', ondelete='CASCADE'), primary_key=True)
    course_id = db.Column(db.String(8), db.ForeignKey('COURSE.course_id', ondelete='CASCADE'), primary_key=True)
    semester = db.Column(db.String(6), primary_key=True)
    year = db.Column(db.Numeric(4, 0), primary_key=True)
    total_classes = db.Column(db.Numeric(2, 0))
    present = db.Column(db.Numeric(2, 0))
    
    def to_json(self):
        total = int(self.total_classes) if self.total_classes else 0
        present = int(self.present) if self.present else 0
        absent = total - present
        attendance_percentage = (present / total * 100) if total > 0 else 0
        
        return {
            "student_id": self.student_id,
            "course_id": self.course_id,
            "semester": self.semester,
            "year": int(self.year) if self.year else 0,
            "total_classes": total,
            "present": present,
            "absent": absent,
            "attendance_percentage": round(attendance_percentage, 2)
        }


class HostelRooms(db.Model):
    __tablename__ = 'HOSTELROOMS'
    room_type = db.Column(db.String(15), primary_key=True)
    room_fees = db.Column(db.Numeric(6, 2))
    
    # Relationship
    hostel_data = db.relationship('HostelData', backref='hostel_room')
    
    def to_json(self):
        return {
            "room_type": self.room_type,
            "room_fees": float(self.room_fees) if self.room_fees else 0
        }


class HostelData(db.Model):
    __tablename__ = 'HOSTELDATA'
    student_id = db.Column(db.String(5), db.ForeignKey('STUDENTS.student_id', ondelete='CASCADE'), primary_key=True)
    year = db.Column(db.Numeric(4, 0), primary_key=True)
    hostel_block = db.Column(db.String(5))
    room_number = db.Column(db.String(7))
    room_type = db.Column(db.String(15), db.ForeignKey('HOSTELROOMS.room_type'))
    
    def to_json(self):
        return {
            "student_id": self.student_id,
            "year": int(self.year) if self.year else 0,
            "hostel_block": self.hostel_block,
            "room_number": self.room_number,
            "room_type": self.room_type
        }


class MessPlan(db.Model):
    __tablename__ = 'MESSPLAN'
    mess_name = db.Column(db.String(20), primary_key=True)
    monthly_fee = db.Column(db.Numeric(6, 2))
    
    # Relationship
    subscriptions = db.relationship('MessSubscription', backref='mess_plan')
    
    def to_json(self):
        return {
            "mess_name": self.mess_name,
            "monthly_fee": float(self.monthly_fee) if self.monthly_fee else 0
        }


class MessSubscription(db.Model):
    __tablename__ = 'MESSSUBSCRIPTION'
    student_id = db.Column(db.String(5), db.ForeignKey('STUDENTS.student_id', ondelete='CASCADE'), primary_key=True)
    mess_name = db.Column(db.String(20), db.ForeignKey('MESSPLAN.mess_name'), primary_key=True)
    month = db.Column(db.String(10), primary_key=True)
    
    def to_json(self):
        return {
            "student_id": self.student_id,
            "mess_name": self.mess_name,
            "month": self.month
        }


class Achievements(db.Model):
    __tablename__ = 'ACHIEVEMENTS'
    student_id = db.Column(db.String(5), db.ForeignKey('STUDENTS.student_id', ondelete='CASCADE'), primary_key=True)
    achievement_type = db.Column(db.String(20), primary_key=True)
    description = db.Column(db.String(255))
    achievement_date = db.Column(db.Date, primary_key=True)
    
    def to_json(self):
        return {
            "student_id": self.student_id,
            "achievement_type": self.achievement_type,
            "description": self.description,
            "achievement_date": self.achievement_date.strftime('%Y-%m-%d') if self.achievement_date else None
        }


class ClubsList(db.Model):
    __tablename__ = 'CLUBSLIST'
    club_name = db.Column(db.String(20), primary_key=True)
    description = db.Column(db.String(255))
    founded_date = db.Column(db.Date)
    
    # Relationship
    members = db.relationship('Clubs', backref='club')
    
    def to_json(self):
        return {
            "club_name": self.club_name,
            "description": self.description,
            "founded_date": self.founded_date.strftime('%Y-%m-%d') if self.founded_date else None
        }


class Clubs(db.Model):
    __tablename__ = 'CLUBS'
    student_id = db.Column(db.String(5), db.ForeignKey('STUDENTS.student_id', ondelete='CASCADE'), primary_key=True)
    club_name = db.Column(db.String(20), db.ForeignKey('CLUBSLIST.club_name', ondelete='CASCADE'), primary_key=True)
    status = db.Column(db.String(10))
    join_date = db.Column(db.Date)
    
    def to_json(self):
        return {
            "student_id": self.student_id,
            "club_name": self.club_name,
            "status": self.status,
            "join_date": self.join_date.strftime('%Y-%m-%d') if self.join_date else None
        }


class Applications(db.Model):
    __tablename__ = 'APPLICATIONS'
    app_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(5), db.ForeignKey('STUDENTS.student_id', ondelete='CASCADE'))
    app_type = db.Column(db.String(20))
    app_status = db.Column(db.String(20))
    submission_date = db.Column(db.Date)
    
    def to_json(self):
        return {
            "app_id": self.app_id,
            "student_id": self.student_id,
            "app_type": self.app_type,
            "app_status": self.app_status,
            "submission_date": self.submission_date.strftime('%Y-%m-%d') if self.submission_date else None
        }


class WeeklySchedule(db.Model):
    __tablename__ = 'WEEKLYSCHEDULE'
    student_id = db.Column(db.String(5), db.ForeignKey('STUDENTS.student_id', ondelete='CASCADE'), primary_key=True)
    faculty_id = db.Column(db.String(5), db.ForeignKey('FACULTY.faculty_id', ondelete='CASCADE'))
    course_id = db.Column(db.String(8), db.ForeignKey('COURSE.course_id', ondelete='CASCADE'), primary_key=True)
    day_of_week = db.Column(db.String(10), primary_key=True)
    start_time = db.Column(db.String(5), primary_key=True)
    end_time = db.Column(db.String(5))
    
    def to_json(self):
        return {
            "student_id": self.student_id,
            "faculty_id": self.faculty_id,
            "course_id": self.course_id,
            "day_of_week": self.day_of_week,
            "start_time": self.start_time,
            "end_time": self.end_time
        }
