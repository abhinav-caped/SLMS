from flask import request, jsonify
from config import app, db
from models import Users, Department,Faculty,Students,Course,Teaches,Classroom,AcademicRecords,Attendance,HostelRooms,HostelData,MessPlan,MessSubscription,Achievements,Clubs,Applications,WeeklySchedule

@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Student Management System API!"})

@app.route("/users", methods=["GET"])
def get_users():
    users = Users.query.all()
    return jsonify([user.to_json() for user in users])

@app.route("/create_user", methods=["POST"])
def create_user():
    data = request.get_json()
    new_user = Users(
        username=data["username"],
        password=data["password"],
        role=data["role"]
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully!"}), 201

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

    app.run(debug=True)