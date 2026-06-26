# <img src="frontend/images/logotipo.png" width="80"/> BarkedShop

> A style fashion e-commerce platform.

---

## Live Platform

| Layer    | URL |
|----------|-----|
| Frontend | `frontend/index.html` (open in browser) |
| API      | `http://localhost:3000` |

---

## Repository Structure

```
barkedshop/
├── frontend/               # Static website (HTML, CSS, JS)
│   ├── index.html          # Home page (hero, products, FAQ, newsletter)
│   ├── css/
│   │   └── style.css       # All styles — responsive, mobile-first
│   ├── js/
│   │   ├── products.js     # Product catalog data
│   │   └── main.js         # Cart, search, FAQ accordion, newsletter
│   └── pages/
│       ├── women.html      # Women's category page
│       ├── men.html        # Men's category page
│       ├── new.html        # New arrivals page
│       ├── sale.html       # Sale page
│       ├── cart.html       # Shopping cart (localStorage)
│       └── account.html    # Login / Register page
│
├── backend/                # Node.js + Express REST API skeleton
│   ├── app.js              # Entry point — registers all routes
│   └── api/
│       ├── products.js     # GET /api/products, GET /api/products/:id
│       ├── users.js        # POST /api/users/register, POST /api/users/login
│       ├── orders.js       # GET /api/orders, POST /api/orders
│       ├── cart.js         # GET /api/cart, POST /api/cart/add
│       └── reviews.js      # GET /api/reviews/:productId, POST /api/reviews
│   └── scripts/
│       └── generate_data.py  # Python script to generate sample data
│
├── database/
│   └── schema.sql          # Full DB schema (MySQL/PostgreSQL)
│
├── data/
│   ├── json/
│   │   ├── products.json   # 12 sample products
│   │   ├── users.json      # 5 sample users
│   │   └── orders.json     # 4 sample orders
│   └── csv/
│       ├── products.csv    # Products in CSV format
│       └── orders.csv      # Orders in CSV format
│
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI/CD pipeline
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```
---

## How to Run Locally

### Frontend (no setup needed)
```bash
open frontend/index.html
```

### Database
```bash
# 1. Create the database
mysql -u root -p -e "CREATE DATABASE barkedshop;"

# 2. Run the schema
mysql -u root -p barkedshop < database/schema.sql
```

### Backend API
```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Test it
curl http://localhost:3000/api/products
```

### Generate Sample Data (optional)
```bash
python3 backend/scripts/generate_data.py
```

---

## Team Members

| Member | Role | Files / Area |
|--------|------|-------------|
| **Diego** | Product Owner · Scrum Master · DevOps | `README.md` — documentation and project management |
| **Karen** | Quality Assurance · Front-end Developer | `data/`, `package.json` — sample data andproject config |
| **Elisabet** | DevOps · Front-end Developer | `frontend/` — styles and responsive design |
| **Ramiro** | Front-end Developer | `frontend/` — UI components and pages |
| **Alejandra** | Back-end Developer | `database/` — schema and data models |
| **Brad** | Back-end Developer | `backend/` — API routes and server logic |


---
<p align="center">
  <img src="frontend/images/logotipo.png" width="500"/>
</p>


