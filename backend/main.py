from flask import request, jsonify, make_response
from config import app, db
from models import Users, Department, Faculty, Students, Course, Teaches, Classroom, AcademicRecords
from models import Attendance, HostelRooms, HostelData, MessPlan, MessSubscription, Achievements, Clubs, Applications, WeeklySchedule
import jwt
from datetime import datetime, timedelta
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, verify_jwt_in_request, get_jwt_identity, get_jwt
from sqlalchemy import text

# Setup JWT
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this to a secure random key
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
jwt = JWTManager(app)

@app.route('/login', methods=['POST'])
def login():
    if not request.is_json:
        return jsonify({"message": "Missing JSON in request"}), 400
    
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    
    if not username or not password:
        return jsonify({"message": "Missing username or password"}), 400
    
    # For testing - direct login option
    if username == 'admin' and password == 'admin123':
        access_token = create_access_token(identity=username, additional_claims={
            "user_id": "admin1",
            "name": "Administrator",
            "role": "admin"
        })
        return jsonify({
            "token": access_token,
            "user_id": "admin1",
            "name": "Administrator",
            "role": "admin"
        }), 200
    
    # Try to authenticate student
    try:
        # Using parameterized query for security
        student_query = """
        SELECT s.student_id, u.name, u.password 
        FROM Students s
        JOIN Users u ON s.student_id = u.user_id
        WHERE u.username = :username
        """
        result = db.session.execute(text(student_query), {"username": username}).fetchone()
        
        if result and check_password_hash(result.password, password):
            access_token = create_access_token(identity=username, additional_claims={
                "user_id": result.student_id,
                "name": result.name,
                "role": "student"
            })
            return jsonify({
                "token": access_token,
                "user_id": result.student_id,
                "name": result.name,
                "role": "student"
            }), 200
    except Exception as e:
        print(f"Error during student login: {str(e)}")
    
    # Try to authenticate admin
    try:
        admin_query = "SELECT * FROM admin WHERE username = :username"
        result = db.session.execute(text(admin_query), {"username": username}).fetchone()
        
        if result and check_password_hash(result.password, password):
            access_token = create_access_token(identity=username, additional_claims={
                "user_id": result.admin_id,
                "name": result.name,
                "role": "admin"
            })
            return jsonify({
                "token": access_token,
                "user_id": result.admin_id,
                "name": result.name,
                "role": "admin"
            }), 200
    except Exception as e:
        print(f"Error during admin login: {str(e)}")
    
    return jsonify({"message": "Invalid username or password"}), 401



# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            claims = get_jwt()
            user_id = claims.get('user_id')
            role = claims.get('role')
            
            class UserObject:
                def __init__(self, user_id, role):
                    self.user_id = user_id
                    self.role = role
            
            current_user = UserObject(user_id, role)
            return f(current_user, *args, **kwargs)
        except Exception as e:
            return jsonify({'message': f'Authentication error: {str(e)}'}), 401
    
    return decorated

@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Student Management System API!"})

# The rest of the endpoints remain the same, just update the SQL queries to use text()
# For example:

@app.route('/users', methods=['GET'])
@token_required
def get_all_users(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Cannot perform that function!'}), 403
    
    users = Users.query.all()
    return jsonify([user.to_json() for user in users])

# ... (other endpoints remain the same)

@app.route('/check-admin-table')
def check_admin_table():
    try:
        # Check if admin table exists
        admin_table_exists = db.session.execute(
            text("SELECT COUNT(*) FROM user_tables WHERE table_name = 'ADMIN'")
        ).scalar()
        
        if admin_table_exists:
            # Try to count records in admin table
            admin_count = db.session.execute(text("SELECT COUNT(*) FROM admin")).scalar()
            return jsonify({
                "table_exists": True,
                "record_count": admin_count
            })
        else:
            return jsonify({
                "table_exists": False,
                "message": "Admin table does not exist"
            })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


@app.route('/dashboard/student/<student_id>', methods=['GET'])
@token_required
def get_student_dashboard(current_user, student_id):
    if current_user.role != 'admin' and current_user.user_id != student_id:
        return jsonify({'message': 'Cannot perform that function!'}), 403
    
    # Get student details
    student = Students.query.filter_by(student_id=student_id).first()
    if not student:
        return jsonify({'message': 'Student not found!'}), 404
    
    user = Users.query.filter_by(user_id=student_id).first()
    
    # Get department details
    department = Department.query.filter_by(dept_name=student.dept_name).first()
    
    # Get academic records with GPA calculation
    academic_records = AcademicRecords.query.filter_by(student_id=student_id).all()
    
    # Get attendance data with percentage calculation
    attendance_data = Attendance.query.filter_by(student_id=student_id).all()
    
    # Get hostel data
    hostel_data = HostelData.query.filter_by(student_id=student_id).first()
    
    # Get mess subscription data
    mess_data = db.session.query(
        MessSubscription, MessPlan
    ).join(
        MessPlan, MessPlan.mess_name == MessSubscription.mess_name
    ).filter(
        MessSubscription.student_id == student_id
    ).all()
    
    # Get achievements
    achievements = Achievements.query.filter_by(student_id=student_id).all()
    
    # Get club memberships
    clubs = Clubs.query.filter_by(student_id=student_id).all()
    
    # Get weekly schedule
    schedule = WeeklySchedule.query.filter_by(student_id=student_id).all()
    
    # Calculate academic statistics
    total_credits_earned = sum(float(record.credits) for record in academic_records)
    latest_cgpa = max([float(record.cgpa) for record in academic_records], default=0) if academic_records else 0
    
    # Calculate attendance statistics
    attendance_stats = {}
    for record in attendance_data:
        attendance_stats[record.course_id] = {
            'course_name': record.course_name,
            'total_classes': record.total_classes,
            'present': record.present,
            'percentage': round((record.present / record.total_classes) * 100, 2) if record.total_classes > 0 else 0
        }
    
    # Compile dashboard data
    dashboard_data = {
        'student_info': {
            'student_id': student_id,
            'name': user.name if user else '',
            'email': user.email_id if user else '',
            'department': student.dept_name,
            'total_credits': student.total_credits
        },
        'academic_summary': {
            'total_credits_earned': total_credits_earned,
            'latest_cgpa': latest_cgpa,
            'course_count': len(academic_records)
        },
        'attendance_summary': attendance_stats,
        'hostel_info': hostel_data.to_json() if hostel_data else {},
        'mess_subscriptions': [
            {
                'mess_name': subscription.mess_name,
                'month': subscription.month,
                'fee': float(plan.monthly_fee)
            } for subscription, plan in mess_data
        ],
        'achievements': [achievement.to_json() for achievement in achievements],
        'clubs': [club.to_json() for club in clubs],
        'schedule': [event.to_json() for event in schedule]
    }
    
    return jsonify(dashboard_data)

# ... (other endpoints remain the same)



def seed_users():
    try:
        print("Starting database seeding...")
        
        # Check if admin table exists using Oracle-specific approach
        admin_table_exists = db.session.execute(
            text("SELECT COUNT(*) FROM user_tables WHERE table_name = 'ADMIN'")
        ).scalar()
        
        print(f"Admin table exists check result: {admin_table_exists}")
        
        if not admin_table_exists:
            print("Creating admin table...")
            # Create admin table using Oracle syntax (without IF NOT EXISTS)
            db.session.execute(text("""
                CREATE TABLE admin (
                    admin_id INTEGER PRIMARY KEY,
                    username VARCHAR2(50) UNIQUE NOT NULL,
                    name VARCHAR2(100) NOT NULL,
                    password VARCHAR2(255) NOT NULL
                )
            """))
            print("Admin table created successfully")
            
            # Add admin user
            print("Adding admin user...")
            hashed_password = generate_password_hash('admin123')
            db.session.execute(
                text("INSERT INTO admin (admin_id, username, name, password) VALUES (:id, :username, :name, :password)"),
                {"id": 1, "username": "admin", "name": "Administrator", "password": hashed_password}
            )
            print("Admin user created successfully!")
        else:
            print("Admin table already exists, skipping creation")
        
        # Check if Users table exists
        try:
            users_table_exists = db.session.execute(
                text("SELECT COUNT(*) FROM user_tables WHERE table_name = 'USERS'")
            ).scalar()
            
            print(f"Users table exists check result: {users_table_exists}")
            
            if users_table_exists:
                # Check if test student exists
                student_count = db.session.execute(
                    text("SELECT COUNT(*) FROM Users WHERE username = 'student'")
                ).scalar()
                print(f"Student count: {student_count}")
                
                if student_count == 0:
                    # Add student user
                    print("Creating student user...")
                    hashed_password = generate_password_hash('student123')
                    
                    # Add to Users table
                    db.session.execute(
                        text("""INSERT INTO Users (user_id, username, name, email_id, phone_no, gender, joining_date, password) 
                        VALUES (:id, :username, :name, :email, :phone, :gender, :joining_date, :password)"""),
                        {
                            "id": "S1001", 
                            "username": "student", 
                            "name": "Test Student", 
                            "email": "student@example.com",
                            "phone": "1234567890",
                            "gender": "Male",
                            "joining_date": datetime.now(),
                            "password": hashed_password
                        }
                    )
                    
                    # Check if Students table exists
                    students_table_exists = db.session.execute(
                        text("SELECT COUNT(*) FROM user_tables WHERE table_name = 'STUDENTS'")
                    ).scalar()
                    
                    if students_table_exists:
                        # Add to Students table
                        db.session.execute(
                            text("""INSERT INTO Students (student_id, dept_name, total_credits, cgpa) 
                            VALUES (:id, :dept, :credits, :cgpa)"""),
                            {"id": "S1001", "dept": "Computer Science", "credits": 0, "cgpa": 0.0}
                        )
                        print("Student user created successfully!")
                    else:
                        print("Students table doesn't exist, skipping student creation in Students table")
            else:
                print("Users table doesn't exist, skipping student creation")
        except Exception as e:
            print(f"Error checking Users table: {str(e)}")
        
        db.session.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error seeding database: {str(e)}")
        import traceback
        traceback.print_exc()


@app.route('/test-db')
def test_db():
    try:
        result = db.session.execute(text("SELECT 1")).scalar()
        return jsonify({"message": "Database connection successful", "result": result})
    except Exception as e:
        return jsonify({"message": "Database connection failed", "error": str(e)}), 500
    
@app.route('/admin/students', methods=['GET'])
@token_required
def get_all_students(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized access'}), 403
    
    try:
        # Complex SQL query with joins to get comprehensive student data
        query = text("""
        SELECT s.student_id, u.name, u.email_id, u.phone_no, u.gender, 
               s.dept_name, s.total_credits, 
               (SELECT MAX(ar.cgpa) FROM academicrecords ar WHERE ar.student_id = s.student_id) as cgpa,
               (SELECT COUNT(*) FROM hosteldata hd WHERE hd.student_id = s.student_id AND hd.year = EXTRACT(YEAR FROM SYSDATE)) as has_hostel,
               (SELECT COUNT(*) FROM messsubscription ms WHERE ms.student_id = s.student_id AND ms.month = TO_CHAR(SYSDATE, 'MONTH')) as has_mess
        FROM Students s
        JOIN Users u ON s.student_id = u.user_id
        ORDER BY s.student_id
        """)
        
        result = db.session.execute(query)
        
        students = []
        for row in result:
            students.append({
                'student_id': row.student_id,
                'name': row.name,
                'email': row.email_id,
                'phone': row.phone_no,
                'gender': row.gender,
                'department': row.dept_name,
                'total_credits': row.total_credits,
                'cgpa': float(row.cgpa) if row.cgpa else 0,
                'has_hostel': row.has_hostel > 0,
                'has_mess': row.has_mess > 0
            })
        
        return jsonify(students)
    except Exception as e:
        print(f"Error fetching students: {str(e)}")
        return jsonify({'message': f'Database error: {str(e)}'}), 500

@app.route('/admin/departments', methods=['GET'])
@token_required
def get_all_departments(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized access'}), 403
    
    try:
        # Complex SQL query with subqueries to get department statistics
        query = text("""
        SELECT d.dept_name, d.building, d.budget,
               (SELECT COUNT(*) FROM Students s WHERE s.dept_name = d.dept_name) as student_count,
               (SELECT COUNT(*) FROM Course c WHERE c.dept_name = d.dept_name) as course_count,
               (SELECT COUNT(*) FROM Faculty f WHERE f.dept_name = d.dept_name) as faculty_count,
               (SELECT AVG(f.salary) FROM Faculty f WHERE f.dept_name = d.dept_name) as avg_salary
        FROM Department d
        ORDER BY d.dept_name
        """)
        
        result = db.session.execute(query)
        
        departments = []
        for row in result:
            departments.append({
                'dept_name': row.dept_name,
                'building': row.building,
                'budget': float(row.budget),
                'student_count': row.student_count,
                'course_count': row.course_count,
                'faculty_count': row.faculty_count,
                'avg_salary': float(row.avg_salary) if row.avg_salary else 0,
                'hod_name': 'Department Head', # You can add actual HOD data if available
                'description': 'Department description' # You can add actual description if available
            })
        
        return jsonify(departments)
    except Exception as e:
        print(f"Error fetching departments: {str(e)}")
        return jsonify({'message': f'Database error: {str(e)}'}), 500

@app.route('/admin/attendance/<course_id>', methods=['GET'])
@token_required
def get_course_attendance(current_user, course_id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized access'}), 403
    
    date = request.args.get('date', None)
    
    try:
        # Complex SQL query to get attendance data for a specific date
        query = text("""
        SELECT s.student_id, u.name, 
               a.present, a.total_classes,
               CASE WHEN a.total_classes > 0 THEN ROUND((a.present / a.total_classes) * 100, 2) ELSE 0 END as percentage
        FROM Students s
        JOIN Users u ON s.student_id = u.user_id
        LEFT JOIN Attendance a ON s.student_id = a.student_id AND a.course_id = :course_id
        JOIN AcademicRecords ar ON s.student_id = ar.student_id AND ar.course_id = :course_id
        WHERE ar.year = EXTRACT(YEAR FROM SYSDATE)
        ORDER BY s.student_id
        """)
        
        result = db.session.execute(query, {"course_id": course_id})
        
        attendance_records = []
        for row in result:
            attendance_records.append({
                'student_id': row.student_id,
                'name': row.name,
                'present': row.present > 0 if row.present else False,
                'total_classes': row.total_classes if row.total_classes else 0,
                'percentage': float(row.percentage) if row.percentage else 0
            })
        
        return jsonify(attendance_records)
    except Exception as e:
        print(f"Error fetching attendance: {str(e)}")
        return jsonify({'message': f'Database error: {str(e)}'}), 500


if __name__ == '__main__':
    with app.app_context():
        try:
            # Create all tables first
            db.create_all()
            print("Tables created successfully")
            
            # Then seed users
            seed_users()
            
            # Print confirmation
            print("Database initialized and users seeded")
        except Exception as e:
            print(f"Error initializing database: {str(e)}")
            import traceback
            traceback.print_exc()

    app.run(debug=True)
