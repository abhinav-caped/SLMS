from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import Date, DateTime
from datetime import datetime, timedelta
from sqlalchemy import case
import os
from config import app, db
from models import Users, Department, Faculty, Students, Course, Teaches, Classroom, AcademicRecords,ClubsList
from models import Attendance, HostelRooms, HostelData, MessPlan, MessSubscription, Achievements, Clubs, Applications, WeeklySchedule
from datetime import datetime, date
from sqlalchemy import text
from flask import request
from sqlalchemy.orm import joinedload
from sqlalchemy import func


@app.route('/')
def index():
    if 'user_id' in session:
        if session['role'] == 'Admin':
            return redirect(url_for('admin_home'))
        elif session['role'] == 'Student':
            return redirect(url_for('student_home'))
    return render_template('login.html')


def create_default_admin():
    # Check if admin already exists
    admin = Users.query.filter_by(role='Admin').first()
    if admin:
        return  # Admin already exists
        
    # Create admin user directly without using the create method
    admin_user = Users(
        user_id='A1001',
        name='System Administrator',
        email_id='admin@example.com',
        phone_no='1234567890',
        username='admin',
        password='admin123',
        date_of_birth=datetime.strptime('1990-01-01', '%Y-%m-%d').date(),
        joining_date=datetime.now(),
        gender='Male',
        role='Admin'
    )
    
    db.session.add(admin_user)
    db.session.commit()
    print("Default admin user created successfully")



@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user_type = request.form.get('user_type')
        
        user = Users.query.filter_by(username=username).first()
        
        if user and user.password == password and user.role == user_type:

            session['user_id'] = user.user_id
            session['name'] = user.name
            session['role'] = user.role
            
            if user_type == 'Admin':
                return redirect(url_for('admin_home'))
            elif user_type == 'Student':
                return redirect(url_for('student_home'))
        else:
            flash('Invalid username, password, or user type', 'danger')
    
    return render_template('login.html')
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

# Admin routes
@app.route('/admin/home')
def admin_home():
    if 'user_id' not in session or session['role'] != 'Admin':
        return redirect(url_for('index'))
    
    total_students = Students.query.count()
    total_faculty = Faculty.query.count()
    total_courses = Course.query.count()
    total_departments = Department.query.count()
    
    # Sample recent activities (in a real app, you'd have a table for this)
    recent_activities = [
        {'date': '2025-04-12', 'description': 'Added new student', 'user': 'Admin'},
        {'date': '2025-04-11', 'description': 'Updated course schedule', 'user': 'Admin'},
        {'date': '2025-04-10', 'description': 'Approved leave application', 'user': 'Admin'}
    ]
    
    return render_template('admin/home.html', 
                          total_students=total_students,
                          total_faculty=total_faculty,
                          total_courses=total_courses,
                          total_departments=total_departments,
                          recent_activities=recent_activities)

@app.route('/admin/students', methods=['GET', 'POST'])
@app.route('/admin/students/<student_id>', methods=['GET', 'PUT', 'DELETE'])
def admin_students(student_id=None):
    if 'user_id' not in session or session['role'] != 'Admin':
        return redirect(url_for('index'))
    
    # Handle GET request for a specific student (API call)
    if student_id and request.method == 'GET':
        student = Students.query.join(Users, Students.student_id == Users.user_id).filter(Students.student_id == student_id).first()
        if student:
            # Combine data from both Students and Users tables
            student_data = {
                "student_id": student.student_id,
                "name": student.user.name,
                "email_id": student.user.email_id,
                "phone_no": student.user.phone_no,
                "username": student.user.username,
                "dept_name": student.dept_name,
                "total_credits": student.total_credits,
                "date_of_birth": student.user.date_of_birth.strftime('%Y-%m-%d') if student.user.date_of_birth else None,
                "gender": student.user.gender
            }
            return jsonify(student_data)
        else:
            return jsonify({"error": "Student not found"}), 404
    
    # Handle POST request to add a new student
    elif request.method == 'POST':
        try:
            # Get JSON data from request
            data = request.get_json()
            if not data:
                return jsonify({"success": False, "message": "No data provided"}), 400
            
            print(f"Received data: {data}")
            
            # Create new user
            new_user = Users(
                user_id=data['student_id'],
                name=data['name'],
                email_id=data['email_id'],
                phone_no=data['phone_no'],
                username=data['username'],
                password=data['password'],
                date_of_birth=datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date() if 'date_of_birth' in data else datetime.now().date(),
                joining_date=datetime.now().date(),
                gender=data['gender'] if 'gender' in data else 'Male',
                role='Student'
            )
            
            # Create new student
            new_student = Students(
                student_id=data['student_id'],
                dept_name=data['dept_name'] if data['dept_name'] else None,
                total_credits=data['total_credits'] if 'total_credits' in data else 0
            )
            
            # Add to database
            try:
                db.session.add(new_user)
                db.session.add(new_student)
                db.session.commit()
                print("Transaction committed successfully")
            except Exception as e:
                db.session.rollback()
                print(f"Error: {str(e)}")
                raise
            
            return jsonify({"success": True, "message": "Student added successfully"})
        except Exception as e:
            db.session.rollback()
            import traceback
            print(f"Error adding student: {str(e)}")
            print(traceback.format_exc())
            return jsonify({"success": False, "message": str(e)}), 500
    
    # Handle PUT request to update a student
    elif student_id and request.method == 'PUT':
        try:
            data = request.get_json()
            if not data:
                return jsonify({"success": False, "message": "Invalid data provided"}), 400
            
            # Get existing records
            student = Students.query.get(student_id)
            user = Users.query.get(student_id)
            
            if not student or not user:
                return jsonify({"success": False, "message": "Student not found"}), 404
            
            # Update user data
            if 'name' in data:
                user.name = data['name']
            if 'email_id' in data:
                user.email_id = data['email_id']
            if 'phone_no' in data:
                user.phone_no = data['phone_no']
            if 'username' in data:
                user.username = data['username']
            if 'password' in data and data['password']:
                user.password = data['password']
            if 'date_of_birth' in data:
                user.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            if 'gender' in data:
                user.gender = data['gender']
            
            # Update student data
            if 'dept_name' in data:
                student.dept_name = data['dept_name'] if data['dept_name'] else None
            if 'total_credits' in data:
                student.total_credits = data['total_credits']
            
            db.session.commit()
            return jsonify({"success": True, "message": "Student updated successfully"})
        except Exception as e:
            db.session.rollback()
            print(f"Error updating student: {str(e)}")
            return jsonify({"success": False, "message": str(e)}), 500
    
    # Handle DELETE request to delete a student
    elif student_id and request.method == 'DELETE':
        try:
            # Get existing records
            student = Students.query.get(student_id)
            user = Users.query.get(student_id)
            
            if not student or not user:
                return jsonify({"success": False, "message": "Student not found"}), 404
            
            # Delete records
            db.session.delete(student)
            db.session.delete(user)
            db.session.commit()
            
            return jsonify({"success": True, "message": "Student deleted successfully"})
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting student: {str(e)}")
            return jsonify({"success": False, "message": str(e)}), 500
    
    # Handle regular GET request for the students page
    page = request.args.get('page', 1, type=int)
    per_page = 10  # Number of students per page
    
    # Use SQLAlchemy's paginate method
    paginated_students = Students.query.join(Users, Students.student_id == Users.user_id).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    departments = Department.query.all()
    
    return render_template('admin/student_management.html', 
                          students=paginated_students.items,
                          departments=departments,
                          current_page=paginated_students.page,
                          total_pages=paginated_students.pages)




@app.route('/admin/student/academic')
def admin_student_academic():
    if 'user_id' not in session or session['role'] != 'Admin':
        return redirect(url_for('index'))
    
    students = Students.query.join(Users, Students.student_id == Users.user_id).all()
    courses = Course.query.all()
    
    return render_template('admin/student_academic.html', 
                          students=students,
                          courses=courses)

@app.route('/admin/student/attendance')
def admin_student_attendance():
    if 'user_id' not in session or session['role'] != 'Admin':
        return redirect(url_for('index'))
    
    students = Students.query.join(Users, Students.student_id == Users.user_id).all()
    courses = Course.query.all()
    
    return render_template('admin/student_attendance.html', 
                          students=students,
                          courses=courses)

@app.route('/admin/student/hostel')
def admin_student_hostel():
    if 'user_id' not in session or session['role'] != 'Admin':
        return redirect(url_for('index'))
    
    students = Students.query.join(Users, Students.student_id == Users.user_id).all()
    hostel_rooms = HostelRooms.query.all()
    
    return render_template('admin/student_hostel.html', 
                          students=students,
                          hostel_rooms=hostel_rooms)

@app.route('/admin/student/mess')
def admin_student_mess():
    if 'user_id' not in session or session['role'] != 'Admin':
        return redirect(url_for('index'))
    
    students = Students.query.join(Users, Students.student_id == Users.user_id).all()
    mess_plans = MessPlan.query.all()
    
    return render_template('admin/student_mess.html', 
                          students=students,
                          mess_plans=mess_plans)

@app.route('/admin/student/achievements')
def admin_student_achievements():
    if 'user_id' not in session or session['role'] != 'Admin':
        return redirect(url_for('index'))
    
    students = Students.query.join(Users, Students.student_id == Users.user_id).all()
    
    return render_template('admin/student_achievements.html', 
                          students=students)

@app.route('/admin/student/clubs')
def admin_student_clubs():
    if 'user_id' not in session or session['role'] != 'Admin':
        return redirect(url_for('index'))
    
    students = Students.query.join(Users, Students.student_id == Users.user_id).all()
    
    return render_template('admin/student_clubs.html', 
                          students=students)

@app.route('/admin/student/applications')
def admin_student_applications():
    if 'user_id' not in session or session['role'] != 'Admin':
        return redirect(url_for('index'))
    
    applications = Applications.query.join(Students, Applications.student_id == Students.student_id)\
                  .join(Users, Students.student_id == Users.user_id).all()
    
    return render_template('admin/student_applications.html', 
                          applications=applications)

@app.route('/admin/student/schedule')
def admin_student_schedule():
    if 'user_id' not in session or session['role'] != 'Admin':
        return redirect(url_for('index'))
    
    students = Students.query.join(Users, Students.student_id == Users.user_id).all()
    courses = Course.query.all()
    faculty = Faculty.query.join(Users, Faculty.faculty_id == Users.user_id).all()
    
    return render_template('admin/student_schedule.html', 
                          students=students,
                          courses=courses,
                          faculty=faculty)

@app.route('/test_departments')
def test_departments():
    try:
        # Get all departments using SQLAlchemy ORM
        result1 = db.session.query(Department).all()
        
        # Execute raw SQL using the new connection-based approach
        with db.engine.connect() as conn:
            result2 = conn.execute(text("SELECT * FROM Department")).fetchall()
            result3 = conn.execute(text("SELECT * FROM DEPARTMENT")).fetchall()
        
        return jsonify({
            'count1': len(result1),
            'departments1': [d.dept_name for d in result1],
            'count2': len(result2),
            'departments2': [d[0] for d in result2],
            'count3': len(result3),
            'departments3': [d[0] for d in result3]
        })
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/admin/faculty', methods=['GET', 'POST'])
@app.route('/admin/faculty/<faculty_id>', methods=['GET', 'PUT', 'DELETE'])
@app.route('/api/faculty/<faculty_id>', methods=['GET'])  # Add this route for view faculty
def admin_faculty(faculty_id=None):
    if 'user_id' not in session or session['role'] != 'Admin':
        return redirect(url_for('index'))

    # Handle GET request for a specific faculty (API call)
    if faculty_id and request.method == 'GET':
        faculty = Faculty.query.get_or_404(faculty_id)
        return jsonify(faculty.to_json())
    
    # Handle PUT request to update a faculty
    elif faculty_id and request.method == 'PUT':
        data = request.json
        faculty = Faculty.query.get_or_404(faculty_id)
        try:
            faculty.name = data.get('name', faculty.name)
            faculty.email_id = data.get('email_id', faculty.email_id)
            faculty.phone_no = data.get('phone_no', faculty.phone_no)
            faculty.dept_name = data.get('dept_name', faculty.dept_name)
            faculty.salary = data.get('salary', faculty.salary)
            if 'date_of_birth' in data:
                faculty.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            if 'gender' in data:
                faculty.gender = data['gender']
            db.session.commit()
            return jsonify({"success": True, "message": "Faculty updated successfully"})
        except Exception as e:
            db.session.rollback()
            print(f"Error updating faculty: {str(e)}")
            return jsonify({"success": False, "message": str(e)})
    
    # Handle DELETE request to delete a faculty
    elif faculty_id and request.method == 'DELETE':
        faculty = Faculty.query.get_or_404(faculty_id)
        try:
            db.session.delete(faculty)
            db.session.commit()
            return jsonify({"success": True, "message": "Faculty deleted successfully"})
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting faculty: {str(e)}")
            return jsonify({"success": False, "message": str(e)})
    
    # Handle POST request to add a new faculty
    elif request.method == 'POST':
        data = request.json
        try:
            new_faculty = Faculty(
                faculty_id=data['faculty_id'],
                name=data['name'],
                email_id=data['email_id'],
                phone_no=data['phone_no'],
                dept_name=data['dept_name'] if data['dept_name'] else None,
                salary=data['salary'],
                date_of_birth=datetime.strptime(data.get('date_of_birth', '1980-01-01'), '%Y-%m-%d').date(),
                joining_date=datetime.now().date(),
                gender=data.get('gender', 'Male')
            )
            db.session.add(new_faculty)
            db.session.commit()
            return jsonify({"success": True, "message": "Faculty added successfully"})
        except Exception as e:
            db.session.rollback()
            print(f"Error adding faculty: {str(e)}")
            return jsonify({"success": False, "message": str(e)})
    
    # Handle regular GET request for the faculty page
    page = request.args.get('page', 1, type=int)
    per_page = 10  # Number of faculty per page
    
    # Apply filters if provided
    query = Faculty.query
    department = request.args.get('department')
    search = request.args.get('search')
    
    if department:
        query = query.filter(Faculty.dept_name == department)
    
    if search:
        query = query.filter(
            db.or_(
                Faculty.name.ilike(f'%{search}%'),
                Faculty.faculty_id.ilike(f'%{search}%'),
                Faculty.email_id.ilike(f'%{search}%')
            )
        )
    
    # Use SQLAlchemy's paginate method
    paginated_faculty = query.paginate(page=page, per_page=per_page, error_out=False)
    
    departments = Department.query.all()
    
    return render_template('admin/faculty.html', 
                          faculty=paginated_faculty.items,
                          departments=departments,
                          current_page=paginated_faculty.page,
                          total_pages=paginated_faculty.pages)


@app.route('/admin/courses', methods=['GET', 'POST', 'PUT', 'DELETE'])
def admin_courses():
    if 'user_id' not in session or session['role'] != 'Admin':
        return redirect(url_for('index'))
    
    # Handle GET request for a specific course (API call)
    course_id = request.args.get('course_id')
    if course_id and request.method == 'GET':
        course = Course.query.get(course_id)
        if course:
            course_data = {
                "course_id": course.course_id,
                "title": course.title,
                "dept_name": course.dept_name,
                "credits": int(course.credits) if course.credits else 0,
                "students": [],  # You can populate this if you implement a Takes table
                "faculty": []    # You can populate this if you implement a Teaches table
            }
            return jsonify(course_data)
        else:
            return jsonify({"error": "Course not found"}), 404
    
    # Handle POST request to add a new course
    elif request.method == 'POST':
        try:
            data = request.get_json()
            if not data:
                return jsonify({"success": False, "message": "No data provided"}), 400
            
            print(f"Received course data: {data}")
            
            # Create new course
            new_course = Course(
                course_id=data['course_id'],
                title=data['title'],
                dept_name=data['dept_name'],
                credits=data['credits']
            )
            
            # Add to database
            db.session.add(new_course)
            db.session.commit()
            
            return jsonify({"success": True, "message": "Course added successfully"})
        except Exception as e:
            db.session.rollback()
            print(f"Error adding course: {str(e)}")
            return jsonify({"success": False, "message": str(e)}), 500
    
    # Handle PUT request to update a course
    elif request.method == 'PUT':
        try:
            data = request.get_json()
            if not data or 'course_id' not in data:
                return jsonify({"success": False, "message": "Invalid data provided"}), 400
            
            # Get existing course
            course = Course.query.get(data['course_id'])
            
            if not course:
                return jsonify({"success": False, "message": "Course not found"}), 404
            
            # Update course data
            course.title = data['title']
            course.dept_name = data['dept_name']
            course.credits = data['credits']
            
            db.session.commit()
            return jsonify({"success": True, "message": "Course updated successfully"})
        except Exception as e:
            db.session.rollback()
            print(f"Error updating course: {str(e)}")
            return jsonify({"success": False, "message": str(e)}), 500
    
    # Handle DELETE request to delete a course
    elif request.method == 'DELETE':
        try:
            course_id = request.args.get('course_id')
            if not course_id:
                return jsonify({"success": False, "message": "No course ID provided"}), 400
            
            # Get existing course
            course = Course.query.get(course_id)
            
            if not course:
                return jsonify({"success": False, "message": "Course not found"}), 404
            
            # Delete course
            db.session.delete(course)
            db.session.commit()
            
            return jsonify({"success": True, "message": "Course deleted successfully"})
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting course: {str(e)}")
            return jsonify({"success": False, "message": str(e)}), 500
    
    # Handle regular GET request for the courses page
    # Apply filters if provided
    query = Course.query
    department = request.args.get('department')
    search = request.args.get('search')
    
    if department:
        query = query.filter(Course.dept_name == department)
    
    if search:
        query = query.filter(
            db.or_(
                Course.course_id.ilike(f'%{search}%'),
                Course.title.ilike(f'%{search}%')
            )
        )
    
    # Get page parameter from URL
    page = request.args.get('page', 1, type=int)
    per_page = 10  # Number of courses per page
    
    # Get courses with pagination
    paginated_courses = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Get all departments for the dropdown
    departments = Department.query.all()
    
    # Create an empty enrollment dictionary (since you don't have a Takes table)
    enrollment_dict = {course.course_id: 0 for course in paginated_courses.items}
    
    return render_template('admin/courses.html', 
                          courses=paginated_courses.items,
                          departments=departments,
                          current_page=paginated_courses.page,
                          total_pages=paginated_courses.pages,
                          enrollment_dict=enrollment_dict)



@app.route('/admin/departments', methods=['GET', 'POST', 'PUT', 'DELETE'])
def admin_departments():
    if 'user_id' not in session or session['role'] != 'Admin':
        return redirect(url_for('index'))
    
    # Handle GET request for a specific department
    dept_name = request.args.get('dept_name')
    if dept_name and request.method == 'GET':
        dept = Department.query.get_or_404(dept_name)
        faculty = Faculty.query.filter_by(dept_name=dept_name).all()
        courses = Course.query.filter_by(dept_name=dept_name).all()
        
        # Create response data
        response_data = dept.to_json()
        response_data['faculty'] = [f.to_json() for f in faculty] if faculty else []
        response_data['courses'] = [c.to_json() for c in courses] if courses else []
        
        return jsonify(response_data)
    
    # Handle POST request to add a new department
    elif request.method == 'POST':
        data = request.json
        try:
            new_dept = Department(
                dept_name=data['dept_name'],
                building=data['building'],
                budget=data['budget']
            )
            db.session.add(new_dept)
            db.session.commit()
            return jsonify({"success": True, "message": "Department added successfully"})
        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False, "message": str(e)})
    
    # Handle PUT request to update a department
    elif request.method == 'PUT':
        data = request.json
        try:
            dept = Department.query.get_or_404(data['dept_name'])
            dept.building = data['building']
            dept.budget = data['budget']
            db.session.commit()
            return jsonify({"success": True, "message": "Department updated successfully"})
        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False, "message": str(e)})
    
    # Handle DELETE request to delete a department
    elif request.method == 'DELETE':
        try:
            dept = Department.query.get_or_404(dept_name)
            db.session.delete(dept)
            db.session.commit()
            return jsonify({"success": True, "message": "Department deleted successfully"})
        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False, "message": str(e)})
    
    # Handle regular GET request for the departments page
    page = request.args.get('page', 1, type=int)
    per_page = 10  # Number of departments per page
    
    # Get departments with pagination
    departments = Department.query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Calculate faculty and student counts manually
    for dept in departments.items:
        faculty_count = Faculty.query.filter_by(dept_name=dept.dept_name).count()
        student_count = Students.query.filter_by(dept_name=dept.dept_name).count()
        
        # Add counts as attributes to department object
        setattr(dept, 'faculty_count', faculty_count)
        setattr(dept, 'student_count', student_count)
    
    return render_template('admin/departments.html', 
                           departments=departments.items,
                           current_page=departments.page,
                           total_pages=departments.pages)

def initialize_clubs():
    # Check if clubs already exist
    if ClubsList.query.count() > 0:
        print("Clubs already initialized")
        return
    
    # List of clubs to add
    clubs_data = [
        {
            "club_name": "Manas",
            "description": "Manas is the official student club focused on AI and robotics.",
            "founded_date": datetime(2010, 5, 15).date()
        },
        {
            "club_name": "MRM",
            "description": "Manipal Racing Motorsports club for automotive enthusiasts.",
            "founded_date": datetime(2012, 3, 10).date()
        },
        {
            "club_name": "Formula Manipal",
            "description": "Student Formula racing team that designs and builds formula-style race cars.",
            "founded_date": datetime(2008, 7, 22).date()
        },
        {
            "club_name": "Aero Mit",
            "description": "Aeronautical engineering club focused on aircraft design and competitions.",
            "founded_date": datetime(2014, 9, 5).date()
        },
        {
            "club_name": "Thrust Mit",
            "description": "Rocketry and aerospace club for students interested in propulsion systems.",
            "founded_date": datetime(2016, 2, 18).date()
        }
    ]
    
    # Add clubs to database
    for club_data in clubs_data:
        club = ClubsList(**club_data)
        db.session.add(club)
    
    try:
        db.session.commit()
        print("Clubs initialized successfully")
    except Exception as e:
        db.session.rollback()
        print(f"Error initializing clubs: {str(e)}")



# Student routes
@app.route('/student/home')
def student_home():
    if 'user_id' not in session or session['role'] != 'Student':
        return redirect(url_for('index'))
    
    student_id = session['user_id']
    
    # Get student information
    student = Students.query.join(Users, Students.student_id == Users.user_id)\
             .filter(Students.student_id == student_id).first()
    
    # Get today's schedule (assuming current day)
    today = datetime.now().strftime('%A')  # e.g., 'Monday'
    today_schedule = WeeklySchedule.query.join(Course, WeeklySchedule.course_id == Course.course_id)\
                    .filter(WeeklySchedule.student_id == student_id, 
                            WeeklySchedule.day_of_week == today).all()
    
    # Calculate CGPA (simplified version)
    academic_records = AcademicRecords.query.filter_by(student_id=student_id).all()
    total_points = 0
    total_credits_taken = 0
    
    for record in academic_records:
        course = Course.query.filter_by(course_id=record.course_id).first()
        total_marks = record.internal_marks + record.final_marks
        
        # Simple grade calculation
        if total_marks >= 90:
            grade_point = 10
        elif total_marks >= 80:
            grade_point = 9
        elif total_marks >= 70:
            grade_point = 8
        elif total_marks >= 60:
            grade_point = 7
        elif total_marks >= 50:
            grade_point = 6
        else:
            grade_point = 0
        
        total_points += grade_point * course.credits
        total_credits_taken += course.credits
    
    cgpa = round(total_points / total_credits_taken, 2) if total_credits_taken > 0 else 0
    
    # Get average attendance
    attendance_sum = sum(record.attendance_percent for record in academic_records)
    attendance_avg = round(attendance_sum / len(academic_records)) if academic_records else 0
    
    # Get hostel data
    current_year = datetime.now().year
    hostel_data = HostelData.query.join(HostelRooms, HostelData.room_type == HostelRooms.room_type)\
                 .filter(HostelData.student_id == student_id, HostelData.year == current_year).first()
    
    # Get mess data
    current_month = datetime.now().strftime('%B')  # e.g., 'April'
    mess_data = MessSubscription.query.join(MessPlan, MessSubscription.mess_name == MessPlan.mess_name)\
               .filter(MessSubscription.student_id == student_id, 
                       MessSubscription.month == current_month).first()
    
    # Get recent applications
    recent_applications = Applications.query.filter_by(student_id=student_id)\
                         .order_by(Applications.submission_date.desc()).limit(3).all()
    
    # Get recent achievements
    recent_achievements = Achievements.query.filter_by(student_id=student_id)\
                         .order_by(Achievements.achievement_date.desc()).limit(3).all()
    
    # Get club memberships
    clubs = Clubs.query.filter_by(student_id=student_id).all()
    
    # Total required credits for graduation (example value)
    total_required_credits = 180
    
    return render_template('student/home.html',
                          student=student,
                          today_schedule=today_schedule,
                          cgpa=cgpa,
                          attendance_avg=attendance_avg,
                          hostel_data=hostel_data,
                          mess_data=mess_data,
                          recent_applications=recent_applications,
                          recent_achievements=recent_achievements,
                          clubs=clubs,
                          total_required_credits=total_required_credits)

@app.route('/student/academic')
def student_academic_records():
    if 'user_id' not in session or session['role'] != 'Student':
        return redirect(url_for('index'))
    
    student_id = session['user_id']
    page = request.args.get('page', 1, type=int)
    per_page = 10  # Number of records per page
    semester_filter = request.args.get('semester')
    
    try:
        # Get student information
        student = Students.query.filter_by(student_id=student_id).first()
        
        # Optimize query by joining with Course table to avoid multiple queries later
        base_query = db.session.query(
            AcademicRecords, Course.title, Course.credits
        ).join(
            Course, AcademicRecords.course_id == Course.course_id
        ).filter(
            AcademicRecords.student_id == student_id
        )
        
        # Apply semester filter if provided
        if semester_filter:
            semester, year = semester_filter.split()
            base_query = base_query.filter(
                AcademicRecords.semester == semester,
                AcademicRecords.year == year
            )
        
        # Get unique semesters for filter dropdown
        semesters = db.session.query(
            AcademicRecords.semester, AcademicRecords.year
        ).filter(
            AcademicRecords.student_id == student_id
        ).distinct().all()
        
        semester_list = [f"{s.semester} {s.year}" for s in semesters]
        
        # Paginate the results
        paginated_records = base_query.order_by(
            AcademicRecords.year.desc(),
            AcademicRecords.semester.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        # Pre-calculate semester GPAs (optimized to use joined query data)
        semester_gpas = {}
        for semester_year in semester_list:
            semester, year = semester_year.split()
            
            # Get all records for this semester in a single query
            semester_data = db.session.query(
                AcademicRecords, Course.credits
            ).join(
                Course, AcademicRecords.course_id == Course.course_id
            ).filter(
                AcademicRecords.student_id == student_id,
                AcademicRecords.semester == semester,
                AcademicRecords.year == year
            ).all()
            
            total_points = 0
            total_credits = 0
            
            for record, credits in semester_data:
                total_marks = record.internal_marks + record.final_marks
                
                # Simple grade calculation
                if total_marks >= 90:
                    grade_point = 10
                elif total_marks >= 80:
                    grade_point = 9
                elif total_marks >= 70:
                    grade_point = 8
                elif total_marks >= 60:
                    grade_point = 7
                elif total_marks >= 50:
                    grade_point = 6
                else:
                    grade_point = 0
                
                total_points += grade_point * credits
                total_credits += credits
            
            semester_gpas[semester_year] = round(total_points / total_credits, 2) if total_credits > 0 else 0
        
        # Calculate CGPA in a single optimized query
        cgpa_data = db.session.query(
            AcademicRecords, Course.credits
        ).join(
            Course, AcademicRecords.course_id == Course.course_id
        ).filter(
            AcademicRecords.student_id == student_id
        ).all()
        
        total_points = 0
        total_credits = 0
        courses_completed = 0
        
        for record, credits in cgpa_data:
            total_marks = record.internal_marks + record.final_marks
            
            # Count completed courses
            if total_marks >= 50:
                courses_completed += 1
            
            # Simple grade calculation
            if total_marks >= 90:
                grade_point = 10
            elif total_marks >= 80:
                grade_point = 9
            elif total_marks >= 70:
                grade_point = 8
            elif total_marks >= 60:
                grade_point = 7
            elif total_marks >= 50:
                grade_point = 6
            else:
                grade_point = 0
            
            total_points += grade_point * credits
            total_credits += credits
        
        cgpa = round(total_points / total_credits, 2) if total_credits > 0 else 0
        
        return render_template('student/academic_records.html',
                              academic_records=paginated_records.items,
                              pagination=paginated_records,
                              semesters=sorted(semester_list),
                              semester_gpas=semester_gpas,
                              cgpa=cgpa,
                              total_credits=student.total_credits,
                              courses_completed=courses_completed,
                              current_semester=semester_filter)
    
    except Exception as e:
        print(f"Error in student_academic_records: {str(e)}")
        flash("An error occurred while retrieving academic records. Please try again later.", "error")
        return redirect(url_for('student_home'))


@app.route('/student/attendance')
def student_attendance():
    if 'user_id' not in session or session['role'] != 'Student':
        return redirect(url_for('index'))
    
    student_id = session['user_id']
    page = request.args.get('page', 1, type=int)
    per_page = 10  # Number of attendance records per page
    course_filter = request.args.get('course_id')
    
    try:
        # Get student information
        student = Students.query.join(Users, Students.student_id == Users.user_id)\
                 .filter(Students.student_id == student_id).first()
        
        # Build the base query with joins to avoid multiple queries
        base_query = Attendance.query.join(
            Course, Attendance.course_id == Course.course_id
        ).filter(
            Attendance.student_id == student_id
        )
        
        # Apply course filter if provided
        if course_filter:
            base_query = base_query.filter(Attendance.course_id == course_filter)
        
        # Get all courses for filter dropdown
        courses = db.session.query(
            Course.course_id, Course.title
        ).join(
            Attendance, Attendance.course_id == Course.course_id
        ).filter(
            Attendance.student_id == student_id
        ).distinct().all()
        
        course_dict = {c.course_id: c.title for c in courses}
        
        # Paginate the results
        paginated_attendance = base_query.order_by(
            Attendance.year.desc(),
            Attendance.semester.desc(),
            Attendance.course_id
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        # Calculate overall attendance percentage
        overall_attendance = db.session.query(
            func.avg(Attendance.attendance_percentage)
        ).filter(
            Attendance.student_id == student_id
        ).scalar()
        
        overall_attendance = round(overall_attendance) if overall_attendance else 0
        
        return render_template('student/attendance.html',
                              student=student,
                              attendance_records=paginated_attendance.items,
                              pagination=paginated_attendance,
                              courses=course_dict,
                              overall_attendance=overall_attendance,
                              selected_course=course_filter)
    
    except Exception as e:
        print(f"Error in student_attendance: {str(e)}")
        flash("An error occurred while retrieving attendance data. Please try again later.", "error")
        return redirect(url_for('student_home'))


@app.route('/student/hostel')
def student_hostel():
    if 'user_id' not in session or session['role'] != 'Student':
        return redirect(url_for('index'))
    
    student_id = session['user_id']
    
    try:
        # Get student information
        student = Students.query.join(Users, Students.student_id == Users.user_id)\
                 .filter(Students.student_id == student_id).first()
        
        # Get hostel data for all years with room fees in a single query
        hostel_history = db.session.query(
            HostelData, HostelRooms.room_fees
        ).join(
            HostelRooms, HostelData.room_type == HostelRooms.room_type
        ).filter(
            HostelData.student_id == student_id
        ).order_by(
            HostelData.year.desc()
        ).all()
        
        # Get current year hostel data
        current_year = datetime.now().year
        current_hostel = next((h for h, _ in hostel_history if h.year == current_year), None)
        
        # Get all room types for reference
        room_types = HostelRooms.query.all()
        
        return render_template('student/hostel.html',
                              student=student,
                              hostel_history=hostel_history,
                              current_hostel=current_hostel,
                              room_types=room_types)
    
    except Exception as e:
        print(f"Error in student_hostel: {str(e)}")
        flash("An error occurred while retrieving hostel data. Please try again later.", "error")
        return redirect(url_for('student_home'))


@app.route('/student/mess')
def student_mess():
    if 'user_id' not in session or session['role'] != 'Student':
        return redirect(url_for('index'))
    
    student_id = session['user_id']
    
    try:
        # Get student information
        student = Students.query.join(Users, Students.student_id == Users.user_id)\
                 .filter(Students.student_id == student_id).first()
        
        # Get current and past mess subscriptions
        current_month = datetime.now().strftime('%B')
        current_year = datetime.now().year
        
        # Get all mess plans for reference
        mess_plans = MessPlan.query.all()
        
        # Get current subscription
        current_subscription = MessSubscription.query.join(
            MessPlan, MessSubscription.mess_name == MessPlan.mess_name
        ).filter(
            MessSubscription.student_id == student_id,
            MessSubscription.month == current_month
        ).first()
        
        # Get subscription history (past 6 months)
        months = []
        for i in range(6):
            past_date = datetime.now() - timedelta(days=30*i)
            months.append(past_date.strftime('%B'))
        
        subscription_history = MessSubscription.query.join(
            MessPlan, MessSubscription.mess_name == MessPlan.mess_name
        ).filter(
            MessSubscription.student_id == student_id,
            MessSubscription.month.in_(months)
        ).order_by(
            # Sort by month (this is approximate since month names don't sort chronologically)
            case(
                [(MessSubscription.month == m, i) for i, m in enumerate(months)],
                else_=99
            )
        ).all()
        
        return render_template('student/mess.html',
                              student=student,
                              current_subscription=current_subscription,
                              subscription_history=subscription_history,
                              mess_plans=mess_plans,
                              current_month=current_month,
                              current_year=current_year)
    
    except Exception as e:
        # Log the error
        print(f"Error in student_mess: {str(e)}")
        # Flash a message to the user
        flash("An error occurred while retrieving mess data. Please try again later.", "error")
        # Return to dashboard
        return redirect(url_for('student_home'))
    



@app.route('/student/achievements')
def student_achievements():
    if 'user_id' not in session or session['role'] != 'Student':
        return redirect(url_for('index'))
    
    student_id = session['user_id']
    page = request.args.get('page', 1, type=int)
    per_page = 10  # Number of achievements per page
    
    try:
        # Get student information
        student = Students.query.join(Users, Students.student_id == Users.user_id)\
                 .filter(Students.student_id == student_id).first()
        
        # Get achievements with pagination
        achievements_pagination = Achievements.query.filter_by(student_id=student_id)\
                                .order_by(Achievements.achievement_date.desc())\
                                .paginate(page=page, per_page=per_page, error_out=False)
        
        # Get achievement types for filtering
        achievement_types = db.session.query(Achievements.achievement_type)\
                          .filter_by(student_id=student_id)\
                          .distinct().all()
        achievement_types = [t[0] for t in achievement_types]
        
        return render_template('student/achievements.html',
                              student=student,
                              achievements=achievements_pagination.items,
                              achievement_types=achievement_types,
                              pagination=achievements_pagination)
    
    except Exception as e:
        print(f"Error in student_achievements: {str(e)}")
        flash("An error occurred while retrieving achievement data. Please try again later.", "error")
        return redirect(url_for('student_home'))

@app.route('/student/clubs', methods=['GET', 'POST'])
def student_clubs():
    if 'user_id' not in session or session['role'] != 'Student':
        return redirect(url_for('index'))
    
    student_id = session['user_id']
    
    try:
        # Get student information
        student = Students.query.join(Users, Students.student_id == Users.user_id)\
                 .filter(Students.student_id == student_id).first()
        
        # Handle club join/leave requests
        if request.method == 'POST' and request.is_json:
            data = request.get_json()
            
            # Validate input data
            if not data or 'club_name' not in data or 'action' not in data:
                return jsonify({"success": False, "message": "Invalid request data"}), 400
            
            club_name = data['club_name']
            action = data['action']
            
            # Validate club exists
            club = ClubsList.query.filter_by(club_name=club_name).first()
            if not club:
                return jsonify({"success": False, "message": "Club not found"}), 404
            
            # Process join/leave action
            existing_membership = Clubs.query.filter_by(
                student_id=student_id, 
                club_name=club_name
            ).first()
            
            if action == 'join':
                if existing_membership and existing_membership.status == 'Joined':
                    return jsonify({"success": False, "message": "Already a member of this club"}), 400
                
                if existing_membership:
                    # Update existing record
                    existing_membership.status = 'Joined'
                    existing_membership.join_date = datetime.now().date()
                else:
                    # Create new membership
                    new_membership = Clubs(
                        student_id=student_id,
                        club_name=club_name,
                        status='Joined',
                        join_date=datetime.now().date()
                    )
                    db.session.add(new_membership)
                
                db.session.commit()
                return jsonify({"success": True, "message": "Successfully joined the club"})
            
            elif action == 'leave':
                if not existing_membership or existing_membership.status == 'Left':
                    return jsonify({"success": False, "message": "Not a member of this club"}), 400
                
                existing_membership.status = 'Left'
                db.session.commit()
                return jsonify({"success": True, "message": "Successfully left the club"})
            
            else:
                return jsonify({"success": False, "message": "Invalid action"}), 400
        
        # Get student's club memberships
        memberships = Clubs.query.filter_by(student_id=student_id).all()
        
        # Get all available clubs
        all_clubs = ClubsList.query.all()
        
        # Create a dictionary of membership status for each club
        membership_status = {}
        for club in all_clubs:
            membership = next((m for m in memberships if m.club_name == club.club_name), None)
            if membership:
                membership_status[club.club_name] = membership.status
            else:
                membership_status[club.club_name] = None
        
        return render_template('student/clubs.html',
                              student=student,
                              memberships=memberships,
                              all_clubs=all_clubs,
                              membership_status=membership_status)
    
    except Exception as e:
        print(f"Error in student_clubs: {str(e)}")
        if request.is_json:
            return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
        flash("An error occurred while retrieving club data. Please try again later.", "error")
        return redirect(url_for('student_home'))

@app.route('/student/applications', methods=['GET', 'POST'])
def student_applications():
    if 'user_id' not in session or session['role'] != 'Student':
        return redirect(url_for('index'))
    
    student_id = session['user_id']
    page = request.args.get('page', 1, type=int)
    per_page = 5  # Number of applications per page
    
    try:
        # Get student information
        student = Students.query.join(Users, Students.student_id == Users.user_id)\
                 .filter(Students.student_id == student_id).first()
        
        # Handle new application submission
        if request.method == 'POST':
            # Validate form data
            app_type = request.form.get('app_type')
            description = request.form.get('description')
            
            if not app_type:
                flash("Application type is required.", "error")
                return redirect(url_for('student_applications'))
            
            # Create new application
            new_application = Applications(
                student_id=student_id,
                app_type=app_type,
                app_status='Pending',
                submission_date=datetime.now().date(),
                description=description
            )
            
            db.session.add(new_application)
            db.session.commit()
            
            flash("Your application has been submitted successfully.", "success")
            return redirect(url_for('student_applications'))
        
        # Get applications with pagination
        applications_pagination = Applications.query.filter_by(student_id=student_id)\
                                .order_by(Applications.submission_date.desc())\
                                .paginate(page=page, per_page=per_page, error_out=False)
        
        # Get application types for the form
        app_types = ['Leave Request', 'Certificate Request', 'Scholarship Application', 
                    'Hostel Change Request', 'Mess Change Request', 'Other']
        
        return render_template('student/applications.html',
                              student=student,
                              applications=applications_pagination.items,
                              pagination=applications_pagination,
                              app_types=app_types)
    
    except Exception as e:
        db.session.rollback()
        print(f"Error in student_applications: {str(e)}")
        flash("An error occurred while processing your request. Please try again later.", "error")
        return redirect(url_for('student_home'))

@app.route('/student/schedule')
def student_schedule():
    if 'user_id' not in session or session['role'] != 'Student':
        return redirect(url_for('index'))
    
    student_id = session['user_id']
    
    try:
        # Get student information
        student = Students.query.join(Users, Students.student_id == Users.user_id)\
                 .filter(Students.student_id == student_id).first()
        
        # Get weekly schedule grouped by day
        days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
        schedule_by_day = {}
        for day in days_of_week:
            day_schedule = WeeklySchedule.query.join(
                Course, WeeklySchedule.course_id == Course.course_id
            ).outerjoin(
                Faculty, WeeklySchedule.faculty_id == Faculty.faculty_id
            ).filter(
                WeeklySchedule.student_id == student_id,
                WeeklySchedule.day_of_week == day
            ).order_by(
                WeeklySchedule.start_time
            ).all()
            
            schedule_by_day[day] = day_schedule
        
        # Highlight today's schedule
        today = datetime.now().strftime('%A')  # e.g., 'Monday'
        
        # Get all courses for reference
        courses = {course.course_id: course.title for course in Course.query.all()}
        
        # Get all faculty for reference
        faculty_dict = {f.faculty_id: f.name for f in Faculty.query.all()}
        
        return render_template('student/schedule.html',
                              student=student,
                              schedule_by_day=schedule_by_day,
                              days_of_week=days_of_week,
                              today=today,
                              courses=courses,
                              faculty=faculty_dict)
    
    except Exception as e:
        print(f"Error in student_schedule: {str(e)}")
        flash("An error occurred while retrieving schedule data. Please try again later.", "error")
        return redirect(url_for('student_home'))



if __name__ == "__main__":
    with app.app_context():
        try:
            db.create_all()  # Create tables first
            print("Tables created successfully")
            
            # Test database connection
            db.session.query(Users).first()
            print("Database connection successful")
            
            # Create default admin if needed
            create_default_admin()
            #initialize clubs
            initialize_clubs()
            
        except Exception as e:
            print(f"Database initialization failed: {e}")
            import traceback
            print(traceback.format_exc())
        
        app.run(debug=True)
