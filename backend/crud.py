# backend/crud.py
from sqlalchemy.orm import Session
from models import User, Assignment, Submission
from schemas import UserCreate, AssignmentCreate, SubmissionCreate
from datetime import datetime

# Explicitly define what symbols should be exported when this module is imported.
__all__ = [
    "get_user_by_username", "create_user",
    "create_assignment", "get_assignments", "get_assignment_by_id",
    "create_submission", "get_submissions_for_assignment", "get_submission_by_id"
]

# User operations
def get_user_by_username(db: Session, username: str):
    """
    Retrieves a user from the database by their username.
    """
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, username: str, hashed_password: str, role: str):
    """
    Creates a new user in the database.
    """
    db_user = User(username=username, hashed_password=hashed_password, role=role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Assignment operations
def create_assignment(db: Session, assignment: AssignmentCreate, teacher_id: int):
    """
    Creates a new assignment in the database.
    """
    db_assignment = Assignment(
        title=assignment.title,
        description=assignment.description,
        due_date=assignment.due_date,
        teacher_id=teacher_id
    )
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

def get_assignments(db: Session):
    """
    Retrieves all assignments from the database.
    """
    return db.query(Assignment).all()

def get_assignment_by_id(db: Session, assignment_id: int):
    """
    Retrieves a specific assignment by its ID.
    """
    return db.query(Assignment).filter(Assignment.id == assignment_id).first()

# Submission operations
def create_submission(db: Session, assignment_id: int, student_id: int, submission_text: str = None, file_path: str = None):
    """
    Creates a new submission for an assignment.
    """
    db_submission = Submission(
        assignment_id=assignment_id,
        student_id=student_id,
        submission_text=submission_text,
        file_path=file_path,
        submitted_at=datetime.utcnow()
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission

def get_submissions_for_assignment(db: Session, assignment_id: int):
    """
    Retrieves all submissions for a given assignment ID.
    """
    return db.query(Submission).filter(Submission.assignment_id == assignment_id).all()

def get_submission_by_id(db: Session, submission_id: int):
    """
    Retrieves a specific submission by its ID.
    """
    return db.query(Submission).filter(Submission.id == submission_id).first()
