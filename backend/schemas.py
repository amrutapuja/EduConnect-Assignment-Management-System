# backend/schemas.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Explicitly define what symbols should be exported when this module is imported.
__all__ = ["UserCreate", "UserLogin", "Token", "TokenData",
           "AssignmentCreate", "AssignmentResponse",
           "SubmissionCreate", "SubmissionResponse", "UserResponse"]

# User Schemas
class UserBase(BaseModel):
    username: str
    role: str # "teacher" or "student"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        orm_mode = True

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# Assignment Schemas
class AssignmentBase(BaseModel):
    title: str
    description: str
    due_date: datetime

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentResponse(AssignmentBase):
    id: int
    teacher_id: int

    class Config:
        orm_mode = True

# Submission Schemas
class SubmissionBase(BaseModel):
    submission_text: Optional[str] = None
    file_path: Optional[str] = None # Path to the uploaded file

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionResponse(SubmissionBase):
    id: int
    assignment_id: int
    student_id: int
    submitted_at: datetime

    class Config:
        orm_mode = True
