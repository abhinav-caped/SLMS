from flask import request, jsonify
from config import app, db
from models import Users, Department,Faculty,Students,Course,Teaches,Classroom,AcademicRecords,Attendance,HostelRooms,HostelData,MessPlan,MessSubscription,Achievements,Clubs,Applications,WeeklySchedule

@app.route('/api/users', methods=['GET', 'POST'])
def handle_users():
    if request.method == 'GET':
        users = Users.query.all()
        return jsonify([user.to_dict() for user in users])
    elif request.method == 'POST':
        data = request.get_json()
        new_user = Users(**data)
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.to_dict()), 201





if __name__ == '__main__':
    with app.app_context():
        db.create_all()

    app.run(debug=True)