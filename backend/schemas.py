from pydantic import BaseModel
from typing import Optional


# User Schemas
class UserBase(BaseModel):
    username: str
    email: str


class UserCreate(UserBase):
    password: str
    name: str
    surname: str


class UserRead(UserBase):
    id: int
    role: str

    class Config:
        orm_mode = True


# CrimeType Schemas
class CrimeTypeBase(BaseModel):
    name: str


class CrimeTypeRead(CrimeTypeBase):
    id: int

    class Config:
        orm_mode = True


# StatusVerification Schemas
class StatusVerificationBase(BaseModel):
    label: str


class StatusVerificationRead(StatusVerificationBase):
    id: int

    class Config:
        orm_mode = True


# Report Schemas
class ReportBase(BaseModel):
    title: str
    description: Optional[str] = None
    img_url: Optional[str] = None
    crime_type_id: Optional[int] = None
    statuts_verification_id: Optional[int] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None


class ReportCreate(ReportBase):
    user_id: int


class ReportRead(ReportBase):
    id: int
    status: str
    date_time: Optional[str]
    created_at: Optional[str]
    user: Optional[UserRead]
    crime_type: Optional[CrimeTypeRead]
    status_verification: Optional[StatusVerificationRead]

    class Config:
        orm_mode = True
