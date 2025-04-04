from flask import request, jsonify
from config import app, db
from models import Users, Department,Faculty,Students,Course,Teaches,Classroom,AcademicRecords,Attendance,HostelRooms,HostelData,MessPlan,MessSubscription,Achievements,Clubs,Applications,WeeklySchedule

@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Student Management System API!"})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

    app.run(debug=True)