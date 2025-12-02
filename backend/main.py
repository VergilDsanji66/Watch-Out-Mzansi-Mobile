from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Annotated
import models
from database import SessionLocal, engine
from sqlalchemy.orm import Session

app = FastAPI()
models.Base.metadata.create_all(bind=engine)


class User(BaseModel):
    id: int
    name: int
    surname: str
    username: str
    email: str
    password_hash: str
    role: str
    created_at: str


class user_profile(BaseModel):
    user_id: int
    contact_no: str
    address: str


class comments(BaseModel):
    id: int
    report_id: int
    user_id: int
    comment: str
    created_at: str


class status_Verification_history(BaseModel):
    id: int
    report_id: int
    admin_id: int
    action: str
    reason: str
    created_at: str


class createReport(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    crime_type_id: int
    verification_id: int
    location_lat: float
    location_lng: float
    date_time: str
    satus: str
    img_url: str | None = None


class crimeType(BaseModel):
    id: int
    name: str


class crime_verification(BaseModel):
    id: int
    label: str


class alerts(BaseModel):
    id: int
    user_id: int
    report_id: int
    title: str
    message: str
    location_lat: float
    location_lng: float
    radius: float
    created_at: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]


# User
@app.post("/users/")
async def create_user(user: User, db: db_dependency):
    db_user = models.User(
        user.id,
        user.name,
        user.surname,
        user.username,
        user.email,
        user.password_hash,
        user.role,
        user.created_at,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.get("/users/{user_id}")
async def read_user(user_id: int, db: db_dependency):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


#  Report


@app.post("/reports/")
async def create_report(report: createReport, db: db_dependency):
    db_report = models.createReport(
        report.id,
        report.user_id,
        report.title,
        report.description,
        report.crime_type_id,
        report.verification_id,
        report.location_lat,
        report.location_lng,
        report.date_time,
        report.satus,
        report.img_url,
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


@app.get("/reports/{report_id}")
async def read_report(report_id: int, db: db_dependency):
    db_report = (
        db.query(models.createReport)
        .filter(models.createReport.id == report_id)
        .first()
    )
    if db_report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return db_report
