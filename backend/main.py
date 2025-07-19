# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import os
import shutil

# Import from local files
from database import SessionLocal, engine, Base
from models import User, Assignment, Submission
from schemas import UserCreate, UserLogin, Token, AssignmentCreate, AssignmentResponse, SubmissionCreate, SubmissionResponse, UserResponse
from auth import authenticate_user, create_access_token, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user
from crud import get_user_by_username, create_user, create_assignment, get_assignments, get_assignment_by_id, create_submission, get_submissions_for_assignment, get_submission_by_id

# Create all database tables
Base.metadata.create_all(bind=engine)

# This is the line that defines the 'app' object that Uvicorn looks for.
app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",  # React app default port
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Directory for file uploads
UPLOAD_DIRECTORY = "uploads"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

# OAuth2PasswordBearer for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    hashed_password = get_password_hash(user.password)
    new_user = create_user(db=db, username=user.username, hashed_password=hashed_password, role=user.role)
    return new_user

@app.post("/login", response_model=Token)
def login_for_access_token(user_login: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return an access token.
    """
    user = authenticate_user(db, user_login.username, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role, "username": user.username}

@app.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user's details.
    """
    return current_user

# Teacher APIs
@app.post("/assignments", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_assignment_endpoint(
    assignment: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new assignment (Teacher only).
    """
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create assignments"
        )
    return create_assignment(db=db, assignment=assignment, teacher_id=current_user.id)

@app.get("/assignments", response_model=List[AssignmentResponse])
def read_assignments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Get a list of all assignments (Teachers see all, Students see all).
    """
    assignments = get_assignments(db)
    return assignments

@app.get("/assignments/{assignment_id}", response_model=AssignmentResponse)
def read_assignment(assignment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Get a specific assignment by ID.
    """
    assignment = get_assignment_by_id(db, assignment_id)
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    return assignment

@app.get("/assignments/{assignment_id}/submissions", response_model=List[SubmissionResponse])
def view_submissions_for_assignment_endpoint(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    View all submissions for a specific assignment (Teacher only).
    """
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can view submissions"
        )
    submissions = get_submissions_for_assignment(db, assignment_id)
    return submissions

@app.get("/submissions/{submission_id}", response_model=SubmissionResponse)
def view_single_submission_endpoint(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    View a single submission by ID (Teacher only).
    """
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can view submissions"
        )
    submission = get_submission_by_id(db, submission_id)
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    return submission

# Student APIs
@app.post("/assignments/{assignment_id}/submit", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_assignment_endpoint(
    assignment_id: int,
    submission_text: Optional[str] = None,
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit an assignment (Student only).
    Allows text submission and/or file upload.
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can submit assignments"
        )

    assignment = get_assignment_by_id(db, assignment_id)
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    file_path = None
    if file:
        try:
            file_location = os.path.join(UPLOAD_DIRECTORY, file.filename)
            with open(file_location, "wb+") as file_object:
                shutil.copyfileobj(file.file, file_object)
            file_path = file_location
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Could not upload file: {e}")

    if not submission_text and not file_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either submission_text or a file must be provided"
        )

    submission = create_submission(
        db=db,
        assignment_id=assignment_id,
        student_id=current_user.id,
        submission_text=submission_text,
        file_path=file_path
    )
    return submission
