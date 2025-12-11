from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db

import models
from database import SessionLocal, engine

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# User Models
class UserCreate(BaseModel):
    name: str
    surname: str
    username: str
    email: str
    password_hash: str
    role: str


class UserOut(BaseModel):
    id: int
    name: str
    surname: str
    username: str
    email: str
    role: str
    created_at: str

    class Config:
        orm_mode = True


# report Models
class ReportCreate(BaseModel):
    user_id: int
    title: str
    description: str
    crime_type_id: int
    verification_id: int
    location_lat: float
    location_lng: float
    date_time: str
    status: str
    img_url: Optional[str] = None


class ReportOut(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    crime_type_id: int
    verification_id: int
    location_lat: float
    location_lng: float
    date_time: str
    status: str
    img_url: Optional[str]

    class Config:
        orm_mode = True


class CrimeType(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


# Create a user
@app.post("/users/", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(
        name=user.name,
        surname=user.surname,
        username=user.username,
        email=user.email,
        password_hash=user.password_hash,
        role=user.role,
        created_at="2025-12-05",  # You can use datetime.now() in real code
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# Get a single user
@app.get("/users/{user_id}", response_model=UserOut)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


# Get all users
@app.get("/users/", response_model=List[UserOut])
def read_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users


# Create a report
@app.post("/reports/", response_model=ReportOut)
def create_report(report: ReportCreate, db: Session = Depends(get_db)):
    db_report = models.CreateReport(
        user_id=report.user_id,
        title=report.title,
        description=report.description,
        crime_type_id=report.crime_type_id,
        verification_id=report.verification_id,
        location_lat=report.location_lat,
        location_lng=report.location_lng,
        date_time=report.date_time,
        status=report.status,
        img_url=report.img_url,
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


# Get a single report
@app.get("/reports/{report_id}", response_model=ReportOut)
def read_report(report_id: int, db: Session = Depends(get_db)):
    db_report = (
        db.query(models.CreateReport)
        .filter(models.CreateReport.id == report_id)
        .first()
    )
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    return db_report


# Get all reports
@app.get("/reports/", response_model=List[ReportOut])
def read_reports(db: Session = Depends(get_db)):
    reports = db.query(models.CreateReport).all()
    return reports


# Get crime types
@app.get("/crimetype/", response_model=List[CrimeType])
def read_crimeType(db: Session = Depends(get_db)):
    crime = db.query(models.CrimeType).all()
    return crime
