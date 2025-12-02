from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import SessionLocal, engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Crime Reporting API")


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Users
@app.post("/users/", response_model=schemas.UserRead)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = (
        db.query(models.User).filter(models.User.username == user.username).first()
    )
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    new_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=user.password,
        name=user.name,
        surname=user.surname,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# Reports
@app.post("/reports/", response_model=schemas.ReportRead)
def create_report(report: schemas.ReportCreate, db: Session = Depends(get_db)):
    new_report = models.Report(**report.dict())
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report


@app.get("/reports/{report_id}", response_model=schemas.ReportRead)
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


# Create a new crime type
@app.post("/crime-types/", response_model=schemas.CrimeTypeRead)
def create_crime_type(crime_type: schemas.CrimeTypeBase, db: Session = Depends(get_db)):
    db_type = (
        db.query(models.CrimeType)
        .filter(models.CrimeType.name == crime_type.name)
        .first()
    )
    if db_type:
        raise HTTPException(status_code=400, detail="Crime type already exists")
    new_type = models.CrimeType(**crime_type.dict())
    db.add(new_type)
    db.commit()
    db.refresh(new_type)
    return new_type


# Get all crime types
@app.get("/crime-types/", response_model=list[schemas.CrimeTypeRead])
def get_crime_types(db: Session = Depends(get_db)):
    return db.query(models.CrimeType).all()


# Get crime type by ID
@app.get("/crime-types/{crime_type_id}", response_model=schemas.CrimeTypeRead)
def get_crime_type(crime_type_id: int, db: Session = Depends(get_db)):
    crime_type = (
        db.query(models.CrimeType).filter(models.CrimeType.id == crime_type_id).first()
    )
    if not crime_type:
        raise HTTPException(status_code=404, detail="Crime type not found")
    return crime_type


# Update crime type
@app.put("/crime-types/{crime_type_id}", response_model=schemas.CrimeTypeRead)
def update_crime_type(
    crime_type_id: int, crime_type: schemas.CrimeTypeBase, db: Session = Depends(get_db)
):
    db_type = (
        db.query(models.CrimeType).filter(models.CrimeType.id == crime_type_id).first()
    )
    if not db_type:
        raise HTTPException(status_code=404, detail="Crime type not found")
    db_type.name = crime_type.name
    db.commit()
    db.refresh(db_type)
    return db_type


# Delete crime type
@app.delete("/crime-types/{crime_type_id}")
def delete_crime_type(crime_type_id: int, db: Session = Depends(get_db)):
    db_type = (
        db.query(models.CrimeType).filter(models.CrimeType.id == crime_type_id).first()
    )
    if not db_type:
        raise HTTPException(status_code=404, detail="Crime type not found")
    db.delete(db_type)
    db.commit()
    return {"detail": "Crime type deleted"}


# Create a new status verification
@app.post("/status-verifications/", response_model=schemas.StatusVerificationRead)
def create_status_verification(
    status_ver: schemas.StatusVerificationBase, db: Session = Depends(get_db)
):
    new_status = models.StatusVerification(**status_ver.dict())
    db.add(new_status)
    db.commit()
    db.refresh(new_status)
    return new_status


# Get all status verifications
@app.get("/status-verifications/", response_model=list[schemas.StatusVerificationRead])
def get_status_verifications(db: Session = Depends(get_db)):
    return db.query(models.StatusVerification).all()


# Get status verification by ID
@app.get(
    "/status-verifications/{status_id}", response_model=schemas.StatusVerificationRead
)
def get_status_verification(status_id: int, db: Session = Depends(get_db)):
    status = (
        db.query(models.StatusVerification)
        .filter(models.StatusVerification.id == status_id)
        .first()
    )
    if not status:
        raise HTTPException(status_code=404, detail="Status verification not found")
    return status


# Update status verification
@app.put(
    "/status-verifications/{status_id}", response_model=schemas.StatusVerificationRead
)
def update_status_verification(
    status_id: int,
    status_ver: schemas.StatusVerificationBase,
    db: Session = Depends(get_db),
):
    db_status = (
        db.query(models.StatusVerification)
        .filter(models.StatusVerification.id == status_id)
        .first()
    )
    if not db_status:
        raise HTTPException(status_code=404, detail="Status verification not found")
    db_status.label = status_ver.label
    db.commit()
    db.refresh(db_status)
    return db_status


# Delete status verification
@app.delete("/status-verifications/{status_id}")
def delete_status_verification(status_id: int, db: Session = Depends(get_db)):
    db_status = (
        db.query(models.StatusVerification)
        .filter(models.StatusVerification.id == status_id)
        .first()
    )
    if not db_status:
        raise HTTPException(status_code=404, detail="Status verification not found")
    db.delete(db_status)
    db.commit()
    return {"detail": "Status verification deleted"}
