from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LocationBase(BaseModel):
    city: str
    region: str
    country: str = "Bulgaria"


class LocationOut(LocationBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    username: str
    email: EmailStr
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    location_id: Optional[int] = None


class UserRegister(UserBase):
    password: str = Field(..., min_length=6)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserOut(UserBase):
    id: int
    profile_image: Optional[str] = None
    is_verified: bool
    is_premium: bool
    is_admin: bool = False
    status: str
    created_at: datetime
    location: Optional[LocationOut] = None

    model_config = ConfigDict(from_attributes=True)


class UserProfileUpdate(BaseModel):
    username: str = Field(..., min_length=3, max_length=80)
    first_name: Optional[str] = Field(default=None, max_length=80)
    last_name: Optional[str] = Field(default=None, max_length=80)
    phone: Optional[str] = Field(default=None, max_length=30)
    location_id: Optional[int] = None


class UserEmailUpdate(BaseModel):
    email: EmailStr
    current_password: str


class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class CategoryBase(BaseModel):
    name: str
    slug: str
    parent_id: Optional[int] = None
    icon: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class CategoryOut(CategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class CategoryTreeOut(CategoryOut):
    children: List["CategoryTreeOut"] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class AdImageOut(BaseModel):
    id: int
    ad_id: int
    image_url: str
    sort_order: Optional[int] = 0
    is_main: bool
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdBase(BaseModel):
    category_id: int
    location_id: Optional[int] = None
    title: str
    description: str
    price: Optional[Decimal] = None
    currency: str = "BGN"
    is_negotiable: bool = False
    item_condition: str = "not_specified"
    address_area: Optional[str] = None
    phone_visible: bool = True
    status: str = "active"


class AdCreate(AdBase):
    pass


class AdUpdate(BaseModel):
    category_id: Optional[int] = None
    location_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    currency: Optional[str] = None
    is_negotiable: Optional[bool] = None
    item_condition: Optional[str] = None
    address_area: Optional[str] = None
    phone_visible: Optional[bool] = None
    status: Optional[str] = None


class AdListOut(BaseModel):
    id: int
    title: str
    description: str
    price: Optional[Decimal] = None
    currency: str
    is_negotiable: bool
    item_condition: str
    address_area: Optional[str] = None
    status: str
    views_count: int
    created_at: datetime
    published_at: Optional[datetime] = None
    user: Optional[UserOut] = None
    category: Optional[CategoryOut] = None
    location: Optional[LocationOut] = None
    images: List[AdImageOut] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class AdDetailOut(AdListOut):
    expires_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class FavoriteCreate(BaseModel):
    ad_id: int


class FavoriteOut(BaseModel):
    id: int
    user_id: int
    ad_id: int
    created_at: datetime
    ad: Optional[AdListOut] = None

    model_config = ConfigDict(from_attributes=True)


class MessageCreate(BaseModel):
    receiver_id: int
    ad_id: Optional[int] = None
    message_text: str


class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    ad_id: Optional[int] = None
    message_text: str
    is_read: bool
    created_at: datetime
    sender: Optional[UserOut] = None
    receiver: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)


class SavedSearchOut(BaseModel):
    id: int
    user_id: int
    name: Optional[str] = None
    keyword: Optional[str] = None
    category_id: Optional[int] = None
    location_id: Optional[int] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    filters_json: Optional[Any] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReportCreate(BaseModel):
    ad_id: int
    reason: str
    description: Optional[str] = None


class ReportOut(BaseModel):
    id: int
    reporter_id: int
    ad_id: int
    reason: str
    description: Optional[str] = None
    status: str
    reviewed_by: Optional[int] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AdminStatsOut(BaseModel):
    users_count: int
    active_ads_count: int
    pending_reports_count: int
    messages_count: int


class AdminUserStatusUpdate(BaseModel):
    status: str


class AdminReportStatusUpdate(BaseModel):
    status: str


class AdminReportOut(BaseModel):
    id: int
    reporter_id: int
    reporter_username: str
    ad_id: int
    ad_title: str
    reason: str
    description: Optional[str] = None
    status: str
    reviewed_by: Optional[int] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None
