"""Simple test script for Supabase connection"""
import psycopg2
import socket

# Test DNS resolution
print("Testing DNS resolution...")
try:
    ip = socket.gethostbyname("db.rhzetgynouwyegixzshj.supabase.co")
    print(f"✅ DNS resolved to: {ip}")
except Exception as e:
    print(f"❌ DNS resolution failed: {e}")
    print("\nTrying alternative method...")
    import socket
    try:
        result = socket.getaddrinfo("db.rhzetgynouwyegixzshj.supabase.co", 5432)
        print(f"✅ getaddrinfo result: {result[0][4][0]}")
    except Exception as e2:
        print(f"❌ getaddrinfo also failed: {e2}")

# Test database connection
print("\nTesting database connection...")
try:
    conn = psycopg2.connect(
        host="db.rhzetgynouwyegixzshj.supabase.co",
        port=5432,
        database="postgres",
        user="postgres",
        password="h-6B2wH8PSi4Rtn",
        connect_timeout=10
    )
    print("✅ Connection successful!")
    
    # Test query
    cur = conn.cursor()
    cur.execute("SELECT version()")
    version = cur.fetchone()[0]
    print(f"✅ PostgreSQL version: {version[:80]}...")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Connection failed: {e}")
    print(f"\nError type: {type(e).__name__}")

