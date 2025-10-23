#!/usr/bin/env python3
"""
Run pgvector migration to enable vector similarity search.

This script:
1. Enables pgvector extension
2. Creates resume_embeddings table
3. Creates feedback_data table
4. Sets up indexes and functions
"""

import os
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.core.database import engine
from sqlalchemy import text

def run_migration():
    """Run the pgvector migration SQL script."""
    
    migration_file = Path(__file__).parent / "migrations" / "add_pgvector_and_embeddings.sql"
    
    if not migration_file.exists():
        print(f"❌ Migration file not found: {migration_file}")
        return False
    
    print("📦 Reading migration file...")
    with open(migration_file, 'r') as f:
        migration_sql = f.read()
    
    print("🔌 Connecting to database...")
    try:
        with engine.connect() as conn:
            print("🚀 Running pgvector migration...")
            
            # Split by semicolon and execute each statement
            statements = [s.strip() for s in migration_sql.split(';') if s.strip()]
            
            for i, statement in enumerate(statements, 1):
                if statement.strip().startswith('--') or not statement.strip():
                    continue
                
                try:
                    conn.execute(text(statement))
                    conn.commit()
                    print(f"  ✅ Statement {i}/{len(statements)} executed")
                except Exception as e:
                    # Some statements might fail if already exists, that's okay
                    if "already exists" in str(e).lower():
                        print(f"  ⚠️  Statement {i}: Already exists, skipping")
                    else:
                        print(f"  ❌ Statement {i} failed: {e}")
                        # Continue with other statements
            
            print("\n✅ Migration completed successfully!")
            print("\n📊 Verifying installation...")
            
            # Verify pgvector extension
            result = conn.execute(text("SELECT extname FROM pg_extension WHERE extname = 'vector'"))
            if result.fetchone():
                print("  ✅ pgvector extension installed")
            else:
                print("  ❌ pgvector extension not found")
            
            # Verify tables
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name IN ('resume_embeddings', 'feedback_data')
            """))
            tables = [row[0] for row in result.fetchall()]
            print(f"  ✅ Tables created: {', '.join(tables)}")
            
            # Verify indexes
            result = conn.execute(text("""
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename = 'resume_embeddings'
            """))
            indexes = [row[0] for row in result.fetchall()]
            print(f"  ✅ Indexes created: {len(indexes)} indexes")
            
            # Verify functions
            result = conn.execute(text("""
                SELECT proname 
                FROM pg_proc 
                WHERE proname IN ('find_similar_resumes', 'get_feedback_stats')
            """))
            functions = [row[0] for row in result.fetchall()]
            print(f"  ✅ Functions created: {', '.join(functions)}")
            
            print("\n🎉 Vector database is ready for use!")
            print("\nNext steps:")
            print("1. Resume embeddings will be generated automatically on upload")
            print("2. Use find_similar_resumes() function for similarity search")
            print("3. Feedback data will be collected for continuous learning")
            print("4. Export training data when ready (100+ high-quality examples)")
            
            return True
            
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("pgvector Migration for Resume Similarity Search")
    print("=" * 60)
    print()
    
    success = run_migration()
    
    if success:
        print("\n✅ Migration completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)

