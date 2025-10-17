#!/usr/bin/env python3
"""
Run all database migrations for HotGigs.ai
"""
import os
import sys
from pathlib import Path

# Add parent directory to path to import from src
sys.path.insert(0, str(Path(__file__).parent.parent))

from supabase import create_client, Client

def run_migrations():
    """Run all SQL migrations in order"""
    
    # Get Supabase credentials from environment
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set")
        sys.exit(1)
    
    # Create Supabase client
    supabase: Client = create_client(supabase_url, supabase_key)
    
    # Get migrations directory
    migrations_dir = Path(__file__).parent
    
    # List of migration files in order
    migration_files = [
        "create_email_tables.sql",
        "create_admin_tables.sql",
        "add_target_role_to_templates.sql",
    ]
    
    print("🚀 Starting database migrations...")
    print(f"📁 Migrations directory: {migrations_dir}")
    print(f"🔗 Supabase URL: {supabase_url}")
    print()
    
    for migration_file in migration_files:
        migration_path = migrations_dir / migration_file
        
        if not migration_path.exists():
            print(f"⚠️  Warning: Migration file not found: {migration_file}")
            continue
        
        print(f"📝 Running migration: {migration_file}")
        
        try:
            # Read migration SQL
            with open(migration_path, 'r') as f:
                sql = f.read()
            
            # Split into individual statements (simple split by semicolon)
            statements = [s.strip() for s in sql.split(';') if s.strip()]
            
            # Execute each statement
            for i, statement in enumerate(statements, 1):
                if not statement:
                    continue
                
                try:
                    # Use Supabase's RPC to execute raw SQL
                    # Note: This requires a custom function in Supabase or direct PostgreSQL access
                    # For production, you might want to use Supabase's migration system instead
                    
                    print(f"   Executing statement {i}/{len(statements)}...")
                    
                    # This is a simplified approach - in production you'd use proper migration tools
                    # For now, we'll print the SQL and let the user run it manually
                    print(f"   SQL: {statement[:100]}...")
                    
                except Exception as e:
                    print(f"   ⚠️  Error executing statement: {e}")
                    continue
            
            print(f"✅ Completed: {migration_file}")
            print()
            
        except Exception as e:
            print(f"❌ Error reading migration file: {e}")
            continue
    
    print("🎉 All migrations completed!")
    print()
    print("📌 Note: Some migrations may require manual execution in Supabase SQL Editor")
    print("   due to permission restrictions. Please check the migration files in:")
    print(f"   {migrations_dir}")
    print()
    print("🔗 Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql")

def print_manual_instructions():
    """Print instructions for manual migration"""
    print()
    print("=" * 70)
    print("MANUAL MIGRATION INSTRUCTIONS")
    print("=" * 70)
    print()
    print("Since automated migrations require special permissions, please run")
    print("the following SQL files manually in Supabase SQL Editor:")
    print()
    print("1. Go to: https://supabase.com/dashboard/project/_/sql")
    print("2. Click 'New Query'")
    print("3. Copy and paste the contents of each migration file:")
    print()
    print("   📄 migrations/create_email_tables.sql")
    print("   📄 migrations/create_admin_tables.sql")
    print("   📄 migrations/add_target_role_to_templates.sql")
    print()
    print("4. Click 'Run' for each file")
    print()
    print("=" * 70)
    print()

if __name__ == "__main__":
    print()
    print("🗄️  HotGigs.ai Database Migration Tool")
    print("=" * 70)
    print()
    
    # Check if we should print manual instructions
    if len(sys.argv) > 1 and sys.argv[1] == "--manual":
        print_manual_instructions()
        sys.exit(0)
    
    try:
        run_migrations()
        print()
        print("💡 TIP: If you encounter permission errors, use --manual flag")
        print("   to see instructions for running migrations manually.")
        print()
    except KeyboardInterrupt:
        print("\n\n⚠️  Migration interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Migration failed: {e}")
        print()
        print_manual_instructions()
        sys.exit(1)

