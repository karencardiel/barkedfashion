"""
BarkedShop — Data Generation Script
Generates sample products, users, and orders as JSON and CSV.
Run: python3 backend/scripts/generate_data.py
"""

import json, csv, random, os
from datetime import datetime, timedelta

CATEGORIES = ["women", "men"]
ADJECTIVES = ["Slim", "Oversized", "Classic", "Ribbed", "Boho", "Vintage", "Modern", "Casual"]
ITEMS      = ["Dress", "Tee", "Jacket", "Pants", "Skirt", "Shirt", "Shorts", "Set", "Camisole"]

def random_date(start_days_ago=180):
    base = datetime.now() - timedelta(days=start_days_ago)
    return (base + timedelta(days=random.randint(0, start_days_ago))).strftime("%Y-%m-%d")

def generate_products(n=50):
    products = []
    for i in range(1, n+1):
        orig = round(random.uniform(20, 120), 2)
        disc = round(random.uniform(0.3, 0.65), 2)
        products.append({
            "id": i,
            "name": f"{random.choice(ADJECTIVES)} {random.choice(ITEMS)}",
            "category": random.choice(CATEGORIES),
            "price": round(orig * (1 - disc), 2),
            "original_price": orig,
            "stock": random.randint(0, 200),
            "created_at": random_date()
        })
    return products

def generate_users(n=30):
    names = ["Alice","Bob","Carol","David","Eva","Frank","Grace","Hank","Iris","Jake"]
    return [{"id": i, "name": f"{random.choice(names)} User{i}", "email": f"user{i}@example.com",
             "role": "admin" if i == 1 else "customer", "created_at": random_date()} for i in range(1, n+1)]

def generate_orders(products, users, n=100):
    statuses = ["pending","processing","shipped","delivered","cancelled"]
    orders = []
    for i in range(1, n+1):
        items = random.sample(products, random.randint(1,4))
        total = round(sum(p["price"] for p in items), 2)
        orders.append({
            "id": 1000 + i,
            "user_id": random.choice(users)["id"],
            "total": total,
            "status": random.choice(statuses),
            "items": [{"product_id": p["id"], "qty": random.randint(1,3)} for p in items],
            "created_at": random_date()
        })
    return orders

def save_json(data, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"✅ Saved {path}")

def save_csv(data, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    print(f"✅ Saved {path}")

if __name__ == "__main__":
    products = generate_products(50)
    users    = generate_users(30)
    orders   = generate_orders(products, users, 100)

    save_json(products, "data/json/products_generated.json")
    save_json(users,    "data/json/users_generated.json")
    save_json(orders,   "data/json/orders_generated.json")

    # Flatten orders for CSV (no nested items)
    flat_orders = [{"id": o["id"], "user_id": o["user_id"], "total": o["total"],
                    "status": o["status"], "created_at": o["created_at"]} for o in orders]
    save_csv(products,   "data/csv/products_generated.csv")
    save_csv(flat_orders,"data/csv/orders_generated.csv")

    print("\n🛍️  BarkedShop data generation complete!")
