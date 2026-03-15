from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
from config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    database = None

db = Database()

async def connect_to_mongo():
    """Create database connection"""
    try:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        db.database = db.client[settings.DATABASE_NAME]
        
        # Test connection
        await db.client.admin.command('ping')
        logger.info(f"Connected to MongoDB: {settings.DATABASE_NAME}")
        
        # Create indexes for better performance
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def disconnect_from_mongo():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes for better performance"""
    try:
        # Users collection indexes
        await db.database.users.create_index("email", unique=True)
        await db.database.users.create_index("student_id", unique=True)
        
        # Students collection indexes
        await db.database.students.create_index("user_id")
        await db.database.students.create_index("student_id", unique=True)
        
        # Resumes collection indexes
        await db.database.resumes.create_index("student_id")
        await db.database.resumes.create_index("uploaded_at")
        
        # Interviews collection indexes
        await db.database.interviews.create_index("student_id")
        await db.database.interviews.create_index("interview_date")
        
        # Chat messages collection indexes
        await db.database.chat_messages.create_index([("student_id", ASCENDING), ("timestamp", ASCENDING)])
        
        # Companies collection indexes
        await db.database.companies.create_index("name")
        await db.database.companies.create_index("industry")
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Failed to create indexes: {e}")

def get_database():
    """Get database instance"""
    return db.database
