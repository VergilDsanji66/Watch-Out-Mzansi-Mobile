from sqlalchemy import Column, Integer, String, Text, ForeignKey, DECIMAL, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    reports = relationship("Report", back_populates="user", cascade="all, delete")


class CrimeType(Base):
    __tablename__ = "crime_types"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    reports = relationship("Report", back_populates="crime_type")


class StatusVerification(Base):
    __tablename__ = "statuts_verifications"
    id = Column(Integer, primary_key=True, index=True)
    label = Column(String, nullable=False)
    reports = relationship("Report", back_populates="status_verification")


class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String, nullable=False)
    description = Column(Text)
    img_url = Column(String)
    crime_type_id = Column(Integer, ForeignKey("crime_types.id"))
    statuts_verification_id = Column(Integer, ForeignKey("statuts_verifications.id"))
    location_lat = Column(DECIMAL(10, 7))
    location_lng = Column(DECIMAL(10, 7))
    status = Column(String, default="Pending")
    date_time = Column(TIMESTAMP(timezone=True), server_default=func.now())
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="reports")
    crime_type = relationship("CrimeType", back_populates="reports")
    status_verification = relationship("StatusVerification", back_populates="reports")
