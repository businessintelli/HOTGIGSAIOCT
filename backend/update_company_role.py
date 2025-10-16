import sys
import os
sys.path.insert(0, '/home/ubuntu/hotgigs/backend/hotgigs-api/src')
os.chdir('/home/ubuntu/hotgigs/backend/hotgigs-api/src')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.base import Base
from models.user import User

# Database connection
DATABASE_URL = 'postgresql://hotgigs_user:hotgigs_password@localhost:5432/hotgigs_db'
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def update_company_user():
    db = SessionLocal()
    try:
        # Find the company user
        company_user = db.query(User).filter(User.email == 'company@example.com').first()
        
        if company_user:
            company_user.role = 'company'
            db.commit()
            print(f"✅ Updated user role to 'company' for {company_user.email}")
            print(f"   User ID: {company_user.id}")
            print(f"   Role: {company_user.role}")
        else:
            print("❌ Company user not found")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_company_user()
