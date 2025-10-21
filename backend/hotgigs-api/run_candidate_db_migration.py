#!/usr/bin/env python3
"""
Run Candidate Database Migration

This script runs the SQL migration to create the multi-level candidate database tables.
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()


def get_database_url():
    """Get database URL from environment variables"""
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        # Construct from individual components
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "5432")
        db_name = os.getenv("DB_NAME", "hotgigs")
        db_user = os.getenv("DB_USER", "postgres")
        db_password = os.getenv("DB_PASSWORD", "")
        
        database_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    return database_url


def run_migration():
    """Run the candidate database migration"""
    print("=" * 80)
    print("HotGigs.ai - Candidate Database Migration")
    print("=" * 80)
    print()
    
    # Get database URL
    database_url = get_database_url()
    print(f"Database URL: {database_url.split('@')[1] if '@' in database_url else 'Not configured'}")
    print()
    
    # Read migration file
    migration_file = os.path.join(
        os.path.dirname(__file__),
        "migrations",
        "create_candidate_database_tables.sql"
    )
    
    if not os.path.exists(migration_file):
        print(f"❌ Migration file not found: {migration_file}")
        return False
    
    print(f"📄 Reading migration file: {migration_file}")
    with open(migration_file, 'r') as f:
        migration_sql = f.read()
    
    print(f"✅ Migration file loaded ({len(migration_sql)} characters)")
    print()
    
    # Connect to database
    print("🔌 Connecting to database...")
    try:
        conn = psycopg2.connect(database_url)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        print("✅ Connected to database")
        print()
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        return False
    
    # Run migration
    print("🚀 Running migration...")
    print("-" * 80)
    try:
        cursor.execute(migration_sql)
        print("-" * 80)
        print("✅ Migration completed successfully!")
        print()
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        cursor.close()
        conn.close()
        return False
    
    # Verify tables were created
    print("🔍 Verifying tables...")
    tables_to_check = [
        'recruiter_candidates',
        'candidate_shares',
        'candidate_activities',
        'candidate_tags',
        'candidate_notes',
        'candidate_lists',
        'candidate_list_items'
    ]
    
    for table in tables_to_check:
        cursor.execute(f"""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = '{table}'
            );
        """)
        exists = cursor.fetchone()[0]
        status = "✅" if exists else "❌"
        print(f"  {status} {table}")
    
    print()
    
    # Check functions
    print("🔍 Verifying functions...")
    functions_to_check = [
        'add_candidate_to_recruiter',
        'log_candidate_activity',
        'share_candidate_with_recruiter',
        'update_candidate_list_count'
    ]
    
    for function in functions_to_check:
        cursor.execute(f"""
            SELECT EXISTS (
                SELECT FROM pg_proc 
                WHERE proname = '{function}'
            );
        """)
        exists = cursor.fetchone()[0]
        status = "✅" if exists else "❌"
        print(f"  {status} {function}()")
    
    print()
    
    # Check views
    print("🔍 Verifying views...")
    views_to_check = [
        'recruiter_candidate_summary',
        'candidate_activity_summary'
    ]
    
    for view in views_to_check:
        cursor.execute(f"""
            SELECT EXISTS (
                SELECT FROM information_schema.views 
                WHERE table_schema = 'public' 
                AND table_name = '{view}'
            );
        """)
        exists = cursor.fetchone()[0]
        status = "✅" if exists else "❌"
        print(f"  {status} {view}")
    
    print()
    
    # Close connection
    cursor.close()
    conn.close()
    
    print("=" * 80)
    print("✅ Migration completed successfully!")
    print("=" * 80)
    print()
    print("Next steps:")
    print("1. Update SQLAlchemy models to include new tables")
    print("2. Create API endpoints for candidate database operations")
    print("3. Build frontend UI for candidate management")
    print()
    
    return True


if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)

