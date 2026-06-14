import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# Define the absolute clean database connection string directly here
db_url = "sqlite+aiosqlite:///./fixai.db"

# Create the async database engine directly
engine = create_async_engine(db_url, echo=False)

# Configure session handling structures
async_session = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

Base = declarative_base()

async def init_db():
    """
    Initializes local SQLite database instances.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# THE MISSING FUNCTION: Yields async database sessions to your API routes
async def get_db():
    async with async_session() as session:
        yield session