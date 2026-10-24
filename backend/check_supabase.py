import os
import sys
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

print(f"Connecting to Supabase at: {url}")

try:
    from supabase import create_client
    supabase = create_client(url, key)
    print(" Supabase client initialized successfully!")
    
    # Try querying tables
    tables = [
        "businesses",
        "business_users",
        "wakil_profiles",
        "sealed_limits",
        "counterparts",
        "negotiations",
        "negotiation_messages",
        "deals",
        "deal_approvals",
        "activity_logs",
        "invoices",
        "agent_memories"
    ]
    
    missing_tables = []
    populated_tables = []
    
    for t in tables:
        try:
            res = supabase.table(t).select("*", count="exact").limit(1).execute()
            count = res.count if hasattr(res, "count") and res.count is not None else len(res.data)
            populated_tables.append((t, count))
            print(f" Table '{t}': EXISTS (rows: {count})")
        except Exception as e:
            missing_tables.append(t)
            print(f" Table '{t}': NOT FOUND or ERROR ({e})")
            
    print("\n--- SUMMARY ---")
    if missing_tables:
        print(f"Missing {len(missing_tables)} tables: {missing_tables}")
        print("Please execute backend/schema.sql in your Supabase SQL Editor!")
    else:
        print("All tables exist in Supabase! Database is ready to go.")
        
except Exception as e:
    print(f" Failed to connect: {e}")
