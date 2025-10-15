import sys
sys.path.insert(0, '/home/ubuntu/hotgigs/backend/hotgigs-api')

from src.db.session import SessionLocal
from src.models.user import User, UserRole
import bcrypt

def get_password_hash(password: str) -> str:
    # Encode password and hash it
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def create_test_users():
    db = SessionLocal()
    try:
        # Check if test users already exist
        existing_candidate = db.query(User).filter(User.email == "test@example.com").first()
        existing_company = db.query(User).filter(User.email == "company@example.com").first()
        
        if not existing_candidate:
            # Create test candidate user
            candidate = User(
                email="test@example.com",
                hashed_password=get_password_hash("password123"),
                full_name="Test Candidate",
                role=UserRole.CANDIDATE,
                is_active=True
            )
            db.add(candidate)
            print("✅ Created candidate user: test@example.com / password123")
        else:
            print("ℹ️  Candidate user already exists: test@example.com")
        
        if not existing_company:
            # Create test company user
            company = User(
                email="company@example.com",
                hashed_password=get_password_hash("password123"),
                full_name="Test Company",
                role=UserRole.EMPLOYER,
                is_active=True
            )
            db.add(company)
            print("✅ Created company user: company@example.com / password123")
        else:
            print("ℹ️  Company user already exists: company@example.com")
        
        db.commit()
        print("\n✅ Test users are ready!")
        print("\nCandidate Login:")
        print("  Email: test@example.com")
        print("  Password: password123")
        print("\nCompany Login:")
        print("  Email: company@example.com")
        print("  Password: password123")
        
    except Exception as e:
        print(f"❌ Error creating test users: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users()
