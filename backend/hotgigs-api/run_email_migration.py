"""
Run email tables migration script

This script creates the email-related tables in the Supabase database.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import psycopg2

# Load environment variables
load_dotenv()

def run_migration():
    """Run the email tables migration"""
    
    # Get database URL from environment
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL not found in environment variables")
        print("Please set DATABASE_URL in your .env file")
        sys.exit(1)
    
    # Read migration SQL file
    migration_file = Path(__file__).parent / 'migrations' / 'create_email_tables.sql'
    
    if not migration_file.exists():
        print(f"❌ Migration file not found: {migration_file}")
        sys.exit(1)
    
    with open(migration_file, 'r') as f:
        migration_sql = f.read()
    
    print("🔄 Connecting to database...")
    
    try:
        # Connect to database
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        print("✅ Connected to database")
        print("🔄 Running migration...")
        
        # Execute migration
        cursor.execute(migration_sql)
        conn.commit()
        
        print("✅ Migration completed successfully!")
        
        # Verify tables were created
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('email_logs', 'email_clicks', 'email_templates', 'email_preferences')
            ORDER BY table_name
        """)
        
        tables = cursor.fetchall()
        
        print("\n📊 Created tables:")
        for table in tables:
            print(f"  ✅ {table[0]}")
        
        # Get row counts
        print("\n📈 Current row counts:")
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
            count = cursor.fetchone()[0]
            print(f"  {table[0]}: {count} rows")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 Email tables migration completed successfully!")
        
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("="*60)
    print("EMAIL TABLES MIGRATION")
    print("="*60)
    print()
    
    run_migration()

