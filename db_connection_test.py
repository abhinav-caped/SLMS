import cx_Oracle

def drop_tables():
    # Connect to your Oracle database
    connection = cx_Oracle.connect('system/Abhinav123@localhost:1521/xe')
    cursor = connection.cursor()

    # List of tables to drop in the correct order (including case variations)
    tables_to_drop = [
        'WeeklySchedule', 'WEEKLYSCHEDULE', 
        'Applications', 'APPLICATIONS', 
        'Clubs', 'CLUBS', 
        'Achievements', 'ACHIEVEMENTS',
        'MessSubscription', 'MESSSUBSCRIPTION', 
        'MessPlan', 'MESSPLAN', 
        'HostelData', 'HOSTELDATA', 
        'HostelRooms', 'HOSTELROOMS',
        'AcademicRecords', 'ACADEMICRECORDS', 
        'Classroom', 'CLASSROOM', 
        'Teaches', 'TEACHES', 
        'Course', 'COURSE',
        'Faculty', 'FACULTY', 
        'Students', 'STUDENTS', 
        'Department', 'DEPARTMENT', 
        'Users', 'USERS',
        'Attendance', 'ATTENDANCE',
        'ClubsList', 'CLUBSLIST'
    ]

    for table in tables_to_drop:
        try:
            # Use double quotes to preserve case
            cursor.execute(f'DROP TABLE "{table}" CASCADE CONSTRAINTS')
            print(f'Dropped table {table} (if it existed)')
        except cx_Oracle.Error as e:
            print(f'Error dropping {table}: {e}')

    # Commit changes and close connection
    connection.commit()
    cursor.close()
    connection.close()

# Call the function to drop tables
drop_tables()
