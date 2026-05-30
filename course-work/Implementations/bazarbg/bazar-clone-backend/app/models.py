from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    DECIMAL,
    ForeignKey,
    Enum,
    JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String(100), nullable=False)
    region = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False, default="Bulgaria")

    users = relationship("User", back_populates="location")
    ads = relationship("Ad", back_populates="location")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), nullable=False, unique=True)
    email = Column(String(150), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(30))
    first_name = Column(String(80))
    last_name = Column(String(80))
    profile_image = Column(String(255))
    location_id = Column(Integer, ForeignKey("locations.id"))
    is_verified = Column(Boolean, nullable=False, default=False)
    is_premium = Column(Boolean, nullable=False, default=False)
    is_admin = Column(Boolean, nullable=False, default=False)
    status = Column(Enum("active", "inactive", "blocked"), nullable=False, default="active")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    location = relationship("Location", back_populates="users")
    ads = relationship("Ad", back_populates="user", cascade="all, delete")
    sent_messages = relationship(
        "Message",
        foreign_keys="Message.sender_id",
        back_populates="sender",
        cascade="all, delete"
    )
    received_messages = relationship(
        "Message",
        foreign_keys="Message.receiver_id",
        back_populates="receiver",
        cascade="all, delete"
    )
    favorites = relationship("FavoriteAd", back_populates="user", cascade="all, delete")
    saved_searches = relationship("SavedSearch", back_populates="user", cascade="all, delete")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    slug = Column(String(150), nullable=False, unique=True)
    parent_id = Column(Integer, ForeignKey("categories.id"))
    icon = Column(String(100))
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, nullable=False, default=True)

    parent = relationship("Category", remote_side=[id], backref="children")
    ads = relationship("Ad", back_populates="category")


class Ad(Base):
    __tablename__ = "ads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(DECIMAL(10, 2))
    currency = Column(String(10), nullable=False, default="BGN")
    is_negotiable = Column(Boolean, nullable=False, default=False)
    item_condition = Column(
        Enum("new", "used", "for_parts", "not_specified"),
        nullable=False,
        default="not_specified"
    )
    address_area = Column(String(150))
    phone_visible = Column(Boolean, nullable=False, default=True)
    status = Column(
        Enum("pending", "active", "sold", "expired", "rejected", "deleted"),
        nullable=False,
        default="pending"
    )
    views_count = Column(Integer, nullable=False, default=0)
    published_at = Column(DateTime)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="ads")
    category = relationship("Category", back_populates="ads")
    location = relationship("Location", back_populates="ads")
    images = relationship("AdImage", back_populates="ad", cascade="all, delete")
    favorites = relationship("FavoriteAd", back_populates="ad", cascade="all, delete")
    messages = relationship("Message", back_populates="ad")


class AdImage(Base):
    __tablename__ = "ad_images"

    id = Column(Integer, primary_key=True, index=True)
    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=False)
    image_url = Column(String(255), nullable=False)
    sort_order = Column(Integer, default=0)
    is_main = Column(Boolean, nullable=False, default=False)
    uploaded_at = Column(DateTime, server_default=func.now())

    ad = relationship("Ad", back_populates="images")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ad_id = Column(Integer, ForeignKey("ads.id"))
    message_text = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now())

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")
    ad = relationship("Ad", back_populates="messages")


class FavoriteAd(Base):
    __tablename__ = "favorite_ads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="favorites")
    ad = relationship("Ad", back_populates="favorites")


class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(150))
    keyword = Column(String(150))
    category_id = Column(Integer, ForeignKey("categories.id"))
    location_id = Column(Integer, ForeignKey("locations.id"))
    min_price = Column(DECIMAL(10, 2))
    max_price = Column(DECIMAL(10, 2))
    filters_json = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="saved_searches")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=False)
    reason = Column(
        Enum("fraud", "wrong_category", "forbidden_item", "duplicate", "spam", "other"),
        nullable=False
    )
    description = Column(Text)
    status = Column(
        Enum("pending", "reviewed", "resolved", "rejected"),
        nullable=False,
        default="pending"
    )
    reviewed_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())
    reviewed_at = Column(DateTime)


class Promotion(Base):
    __tablename__ = "promotions"

    id = Column(Integer, primary_key=True, index=True)
    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=False)
    promotion_type = Column(
        Enum("top", "vip", "highlighted", "urgent"),
        nullable=False
    )
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    payment_status = Column(
        Enum("pending", "paid", "failed", "refunded"),
        nullable=False,
        default="pending"
    )
    created_at = Column(DateTime, server_default=func.now())


class Blacklist(Base):
    __tablename__ = "blacklists"

    id = Column(Integer, primary_key=True, index=True)
    blocker_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    blocked_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewed_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ad_id = Column(Integer, ForeignKey("ads.id"))
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    created_at = Column(DateTime, server_default=func.now())