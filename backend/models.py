from sqlalchemy import Column, Integer, String, ForeignKey, Float
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    created_at = Column(String, nullable=False)


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    contact_no = Column(String, nullable=False)
    address = Column(String, nullable=False)


class Comments(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment = Column(String, nullable=False)
    created_at = Column(String, nullable=False)


class StatusVerificationHistory(Base):
    __tablename__ = "status_verification_histories"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, nullable=False)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    created_at = Column(String, nullable=False)


class CreateReport(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    crime_type_id = Column(Integer, nullable=False)
    verification_id = Column(Integer, nullable=False)
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    date_time = Column(String, nullable=False)
    status = Column(String, nullable=False)
    img_url = Column(String, nullable=True)


class CrimeType(Base):
    __tablename__ = "crime_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)


class CrimeVerification(Base):
    __tablename__ = "crime_verifications"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String, nullable=False)


class alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(String, nullable=False)
    created_at = Column(String, nullable=False)
