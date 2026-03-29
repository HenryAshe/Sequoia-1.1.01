import os
from flask import Flask, jsonify
from flask_cors import CORS # Add this
from canvasapi import Canvas

app = Flask(__name__)
CORS(app) # This allows any website to "talk" to your API

# CONFIGURATION
CANVAS_URL = "https://auburn.instructure.com" # Replace this
CANVAS_API_KEY = "4~NGQuxULC9yQRYKTePWFanneez4ACvVKMNJz2KRV6Nan4RAty636ZQAea379FLYtA"        # Replace this

# Initialize the Canvas object
canvas = Canvas(CANVAS_URL, CANVAS_API_KEY)

@app.route('/')
def home():
    return "Canvas Analytics Test Server is Live!"
# Add this helper to the top of your app.py
def safe_data(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            # This ensures your website doesn't just "white screen"
            return jsonify({"error": str(e), "status": "failed"}), 500
    wrapper.__name__ = func.__name__
    return wrapper

# Use it like this on your routes:
@app.route('/my-courses')
@safe_data
def get_courses():
    # Fetches active courses for the student
    courses = canvas.get_courses(enrollment_state='active')
    data = [{"id": c.id, "course_name": getattr(c, 'name', 'N/A')} for c in courses]
    return jsonify(data)

@app.route('/full-data')
def get_full_data():
    all_data = []
    courses = canvas.get_courses(enrollment_state='active')

    for course in courses:
        # 1. Basic Course Info
        course_info = {
            "course_name": getattr(course, 'name', 'N/A'),
            "assignments": [],
            "weights": []
        }

        # 2. Fetch Assignments & Due Dates
        # We only pull 'published' assignments that students can actually see
        assignments = course.get_assignments()
        for assignment in assignments:
            course_info["assignments"].append({
                "title": assignment.name,
                "due_at": assignment.due_at,
                "points_possible": assignment.points_possible
            })

        # 3. Fetch Weights (Assignment Groups)
        # This shows if "Exams" are 40%, "Homework" is 20%, etc.
        groups = course.get_assignment_groups()
        for group in groups:
            course_info["weights"].append({
                "group_name": group.name,
                "group_weight": group.group_weight
            })

        all_data.append(course_info)

    return jsonify(all_data)

@app.route('/schedule')
def get_schedule():
    # This pulls events for the next 30 days
    events = canvas.get_calendar_events(all_events=True, type='event')
    schedule = []
    for event in events:
        schedule.append({
            "title": event.title,
            "start": event.start_at,
            "location": getattr(event, 'location_name', 'No location set')
        })
    return jsonify(schedule)
# SYLABUS SCRAPER

@app.route('/my-grades')
def get_grades():
    results = []
    courses = canvas.get_courses(enrollment_state='active')
    for course in courses:
        # Get your own enrollments to see your current score in the class
        enrollments = course.get_enrollments(user_id='self')
        current_score = next((e.grades.get('current_score') for e in enrollments if hasattr(e, 'grades')), "N/A")

        course_data = {"course": getattr(course, 'name', 'N/A'), "total_grade": current_score, "details": []}
        
        # Get submissions for all assignments in this course
        submissions = course.get_multiple_submissions(student_ids=['self'], include=['assignment'])
        for sub in submissions:
            course_data["details"].append({
                "assignment": sub.assignment['name'],
                "score": sub.score,
                "status": sub.workflow_state # 'graded', 'submitted', 'unsubmitted'
            })
        results.append(course_data)
    return jsonify(results)

@app.route('/announcements')
def get_announcements():
    courses = canvas.get_courses(enrollment_state='active')
    # Create a list of 'context codes' like ['course_123', 'course_456']
    course_ids = [f"course_{c.id}" for c in courses]
    
    # Fetch announcements from the last 14 days for these courses
    announcements = canvas.get_announcements(context_codes=course_ids)
    data = [{
        "title": a.title,
        "message": a.message,
        "posted_at": a.posted_at,
        "course_id": a.context_code
    } for a in announcements]
    return jsonify(data)

@app.route('/profile')
def get_profile():
    try:
        # Get the 'self' user object
        user = canvas.get_user('self')
        
        # We use getattr() with a default value to prevent crashes 
        # if a specific field is hidden by Auburn's Canvas settings
        profile = {
            "name": getattr(user, 'short_name', 'Auburn Student'),
            "timezone": getattr(user, 'time_zone', 'America/Chicago'),
            "id": getattr(user, 'id', 'N/A')
        }
        return jsonify(profile)
    except Exception as e:
        # This will show the EXACT error in your browser instead of a 500 error
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    # Starts the local server on http://127.0.0.1:5000
    app.run(debug=True, port=5001)
