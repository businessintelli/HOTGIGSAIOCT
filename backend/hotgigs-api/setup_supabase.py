"""
Supabase PostgreSQL Setup and Migration Script for HotGigs.ai

This script:
1. Tests Supabase connection
2. Creates database schema
3. Seeds initial data
4. Verifies setup

Usage:
    python setup_supabase.py --test          # Test connection only
    python setup_supabase.py --migrate       # Run migrations
    python setup_supabase.py --seed          # Seed initial data
    python setup_supabase.py --full          # Full setup (migrate + seed)
"""

import sys
import argparse
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
import os
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.core.config import settings

def test_connection():
    """Test database connection"""
    print("🔍 Testing Supabase PostgreSQL connection...")
    print(f"📍 Database URL: {settings.DATABASE_URL[:50]}...")
    
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connection successful!")
            print(f"📊 PostgreSQL Version: {version[:80]}...")
            return True
    except OperationalError as e:
        print(f"❌ Connection failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def run_migrations():
    """Run database migrations"""
    print("\n🚀 Running database migrations...")
    
    schema_file = Path(__file__).parent / "database_schema.sql"
    
    if not schema_file.exists():
        print(f"❌ Schema file not found: {schema_file}")
        return False
    
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        # Read schema file
        with open(schema_file, 'r') as f:
            schema_sql = f.read()
        
        # Split into individual statements
        statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip()]
        
        print(f"📝 Found {len(statements)} SQL statements to execute...")
        
        with engine.connect() as conn:
            # Start transaction
            trans = conn.begin()
            
            try:
                executed = 0
                for i, statement in enumerate(statements, 1):
                    # Skip comments and empty statements
                    if statement.startswith('--') or not statement:
                        continue
                    
                    try:
                        conn.execute(text(statement))
                        executed += 1
                        
                        if executed % 10 == 0:
                            print(f"⏳ Executed {executed} statements...")
                    
                    except Exception as e:
                        # Some statements might fail if objects already exist
                        error_msg = str(e)
                        if "already exists" in error_msg.lower():
                            print(f"⚠️  Skipping (already exists): Statement {i}")
                        else:
                            print(f"⚠️  Error in statement {i}: {error_msg[:100]}")
                            # Continue with other statements
                
                trans.commit()
                print(f"✅ Successfully executed {executed} SQL statements!")
                return True
                
            except Exception as e:
                trans.rollback()
                print(f"❌ Migration failed: {e}")
                return False
                
    except Exception as e:
        print(f"❌ Error running migrations: {e}")
        return False

def seed_data():
    """Seed initial data"""
    print("\n🌱 Seeding initial data...")
    
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        with engine.connect() as conn:
            trans = conn.begin()
            
            try:
                # Check if skills already exist
                result = conn.execute(text("SELECT COUNT(*) FROM skills"))
                skill_count = result.fetchone()[0]
                
                if skill_count > 0:
                    print(f"ℹ️  Skills already seeded ({skill_count} skills found)")
                else:
                    # Insert common skills
                    skills = [
                        ('React', 'Frontend'),
                        ('Vue.js', 'Frontend'),
                        ('Angular', 'Frontend'),
                        ('Node.js', 'Backend'),
                        ('Python', 'Backend'),
                        ('Java', 'Backend'),
                        ('Go', 'Backend'),
                        ('TypeScript', 'Frontend'),
                        ('JavaScript', 'Frontend'),
                        ('PostgreSQL', 'Database'),
                        ('MySQL', 'Database'),
                        ('MongoDB', 'Database'),
                        ('Redis', 'Database'),
                        ('AWS', 'Cloud'),
                        ('Azure', 'Cloud'),
                        ('GCP', 'Cloud'),
                        ('Docker', 'DevOps'),
                        ('Kubernetes', 'DevOps'),
                        ('CI/CD', 'DevOps'),
                        ('GraphQL', 'Backend'),
                        ('REST API', 'Backend'),
                        ('Machine Learning', 'AI'),
                        ('Data Science', 'AI'),
                        ('TensorFlow', 'AI'),
                        ('PyTorch', 'AI'),
                        ('Git', 'Tools'),
                        ('Agile', 'Methodology'),
                        ('Scrum', 'Methodology'),
                        ('UI/UX Design', 'Design'),
                        ('Figma', 'Design')
                    ]
                    
                    for skill_name, category in skills:
                        conn.execute(
                            text("INSERT INTO skills (name, category) VALUES (:name, :category) ON CONFLICT (name) DO NOTHING"),
                            {"name": skill_name, "category": category}
                        )
                    
                    print(f"✅ Seeded {len(skills)} skills")
                
                # Insert default email templates
                result = conn.execute(text("SELECT COUNT(*) FROM email_templates"))
                template_count = result.fetchone()[0]
                
                if template_count > 0:
                    print(f"ℹ️  Email templates already seeded ({template_count} templates found)")
                else:
                    templates = [
                        {
                            'name': 'application_received',
                            'subject': 'Application Received - {{job_title}}',
                            'body': 'Dear {{candidate_name}},\n\nThank you for applying to {{job_title}} at {{company_name}}. We have received your application and will review it shortly.\n\nBest regards,\n{{company_name}} Team'
                        },
                        {
                            'name': 'interview_invitation',
                            'subject': 'Interview Invitation - {{job_title}}',
                            'body': 'Dear {{candidate_name}},\n\nWe are pleased to invite you for an interview for the {{job_title}} position at {{company_name}}.\n\nDate: {{interview_date}}\nTime: {{interview_time}}\nLocation: {{interview_location}}\n\nBest regards,\n{{company_name}} Team'
                        },
                        {
                            'name': 'offer_letter',
                            'subject': 'Job Offer - {{job_title}}',
                            'body': 'Dear {{candidate_name}},\n\nCongratulations! We are pleased to offer you the position of {{job_title}} at {{company_name}}.\n\nSalary: {{offer_amount}}\n\nPlease review the attached offer letter and let us know your decision.\n\nBest regards,\n{{company_name}} Team'
                        },
                        {
                            'name': 'rejection_letter',
                            'subject': 'Application Update - {{job_title}}',
                            'body': 'Dear {{candidate_name}},\n\nThank you for your interest in the {{job_title}} position at {{company_name}}. After careful consideration, we have decided to move forward with other candidates.\n\nWe appreciate your time and interest in our company.\n\nBest regards,\n{{company_name}} Team'
                        }
                    ]
                    
                    for template in templates:
                        conn.execute(
                            text("""
                                INSERT INTO email_templates (name, subject, body) 
                                VALUES (:name, :subject, :body) 
                                ON CONFLICT (name) DO NOTHING
                            """),
                            template
                        )
                    
                    print(f"✅ Seeded {len(templates)} email templates")
                
                trans.commit()
                print("✅ Data seeding completed successfully!")
                return True
                
            except Exception as e:
                trans.rollback()
                print(f"❌ Seeding failed: {e}")
                return False
                
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        return False

def verify_setup():
    """Verify database setup"""
    print("\n🔍 Verifying database setup...")
    
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        with engine.connect() as conn:
            # Check tables
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """))
            
            tables = [row[0] for row in result.fetchall()]
            
            if not tables:
                print("❌ No tables found in database!")
                return False
            
            print(f"✅ Found {len(tables)} tables:")
            for table in tables:
                print(f"   📋 {table}")
            
            # Check key tables
            required_tables = [
                'users', 'companies', 'jobs', 'applications', 
                'candidate_profiles', 'skills'
            ]
            
            missing_tables = [t for t in required_tables if t not in tables]
            
            if missing_tables:
                print(f"\n⚠️  Missing required tables: {', '.join(missing_tables)}")
                return False
            
            print(f"\n✅ All required tables present!")
            
            # Check row counts
            print(f"\n📊 Row counts:")
            for table in ['users', 'companies', 'jobs', 'applications', 'skills']:
                if table in tables:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.fetchone()[0]
                    print(f"   {table}: {count} rows")
            
            return True
            
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Supabase PostgreSQL Setup for HotGigs.ai')
    parser.add_argument('--test', action='store_true', help='Test connection only')
    parser.add_argument('--migrate', action='store_true', help='Run migrations')
    parser.add_argument('--seed', action='store_true', help='Seed initial data')
    parser.add_argument('--full', action='store_true', help='Full setup (migrate + seed)')
    parser.add_argument('--verify', action='store_true', help='Verify setup')
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("🚀 HotGigs.ai - Supabase PostgreSQL Setup")
    print("=" * 70)
    
    # If no arguments, show help
    if not any(vars(args).values()):
        parser.print_help()
        return
    
    # Test connection first
    if not test_connection():
        print("\n❌ Cannot proceed without database connection!")
        print("\n💡 Tips:")
        print("   1. Check your DATABASE_URL in .env file")
        print("   2. Ensure Supabase project is running")
        print("   3. Verify network connectivity")
        return
    
    # Run requested operations
    if args.test:
        print("\n✅ Connection test passed!")
    
    if args.migrate or args.full:
        if not run_migrations():
            print("\n❌ Migration failed!")
            return
    
    if args.seed or args.full:
        if not seed_data():
            print("\n❌ Seeding failed!")
            return
    
    if args.verify or args.full:
        if not verify_setup():
            print("\n❌ Verification failed!")
            return
    
    print("\n" + "=" * 70)
    print("✅ Setup completed successfully!")
    print("=" * 70)
    print("\n📚 Next steps:")
    print("   1. Update your application code to use the new schema")
    print("   2. Test API endpoints with the new database")
    print("   3. Monitor database performance")
    print("\n🎉 Your HotGigs.ai database is ready!")

if __name__ == "__main__":
    main()

