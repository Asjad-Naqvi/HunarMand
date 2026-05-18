import psycopg2

try:
    print("Attempting to connect directly to db.kiojylgihmhptndqbzpg.supabase.co via keyword arguments...")
    conn = psycopg2.connect(
        host="db.kiojylgihmhptndqbzpg.supabase.co",
        database="postgres",
        user="postgres",
        password="haazir!23!@!#",
        port=5432
    )
    print("\n[SUCCESS] DIRECT CONNECTION WORKING!")
    conn.close()
except Exception as e:
    print("\n[ERROR] Direct connection failed:")
    print(str(e))
