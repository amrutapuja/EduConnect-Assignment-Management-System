# backend/models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

# Explicitly define what symbols should be exported when this module is imported.
# This can sometimes help with stubborn import errors.
__all__ = ["User", "Assignment", "Submission"]

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)  # "teacher" or "student"

    # Define relationships
    assignments = relationship("Assignment", back_populates="teacher")
    submissions = relationship("Submission", back_populates="student")

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    due_date = Column(DateTime)
    teacher_id = Column(Integer, ForeignKey("users.id"))

    # Define relationships
    teacher = relationship("User", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    submission_text = Column(String, nullable=True) # For text-based submissions
    file_path = Column(String, nullable=True) # For file-based submissions
    submitted_at = Column(DateTime, default=func.now())

    # Define relationships
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")
