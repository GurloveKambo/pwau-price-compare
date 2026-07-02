# PWAU Price Compare — Master Design File

**Project:** Private Family Australian Grocery & Pharmacy Price Comparison PWA  
**Working name:** PWAU Price Compare  
**Owner:** Gurlove Kambo  
**Purpose:** Personal/family use only  
**Budget:** $0 where possible  
**Target user:** Non-programmer using AI coding tools  
**Version:** Master Design v1.0  

---

## 1. Product Vision

PWAU Price Compare is a private installable web app for comparing grocery and pharmacy product prices across Australian retailers.

The user enters a product name such as:

- `milk 2L`
- `Panadol 100 tablets`
- `dishwasher tablets`
- `baby wipes`

The app searches supported retailer websites where possible, shows automated price results, and falls back to manual retailer search links if automated fetching fails.

The key design principle is:

> Each retailer must have its own independent connector file, so if one website changes, only that retailer file needs to be updated.

---



## 2. Core Goals



### Must Have

1. Private/family use only.
2. $0 or free-tier tools where possible.
3. React PWA frontend.
4. Backend/serverless API for automated fetching.
5. One separate connector file per retailer.
6. Fallback search links for every retailer.
7. 30-minute cache to reduce repeated requests.
8. Cheapest price sorting.
9. Unit price calculation where possible.
10. Mobile-friendly shopping interface.
11. Clear disclaimer that final prices must be checked on retailer websites.



### Should Have

1. Manual price entry.
2. Postcode setting.
3. Family shopping basket.
4. Saved favourites.
5. Product matching/normalisation.



### Could Have Later

1. Price history.
2. Price drop alerts.
3. AI product matching.
4. Barcode support.
5. Shared family database.
6. Supabase integration.

---



## 3. Retailers for Initial Build

1. Woolworths
2. Coles
3. Chemist Warehouse
4. Priceline
5. Hill Street Grocer
6. Salamanca Fresh
7. Aldi
8. IGA
9. Big W

## 4. High-Level Architecture

```text
React PWA Frontend
        |
        | calls /api/search?q=PRODUCT
        v
Backend / Serverless API
        |
        | calls all enabled retailer connectors
        v
Retailer Connectors
        |
        |-- woolworths.js
        |-- coles.js
        |-- chemistWarehouse.js
        |-- priceline.js
        v
Normalisation + Unit Price + Cache
        |
        v
Clean JSON Results
        |
        v
Frontend Comparison UI
```

Important:

- The PWA frontend should not directly scrape retailer websites.
- Automated website fetching should happen in the backend/serverless layer.
- If automation fails, user should still get a manual search button.

> **Reality check on automated fetching:** Several major retailers (Woolworths, Coles, Chemist Warehouse) run JavaScript-rendered storefronts and/or bot detection. A plain serverless `fetch()` often returns an empty HTML shell rather than product data, and CAPTCHAs or blocks are common. Automated fetch should be treated as **best-effort, per-retailer, and may permanently remain unavailable for some retailers** — not a guaranteed core feature. Getting it working reliably for JS-rendered sites would require a headless browser (Playwright/Puppeteer), which does not fit comfortably within free serverless tiers (cold-start size, execution time) and is out of scope for the $0 budget. Fallback links and manual price entry are therefore the dependable backbone of this app, not a backup plan.

---



## 5. Recommended Technical Stack



### Frontend

- React
- Vite
- Plain CSS
- PWA manifest
- Service worker for app shell only
- localStorage for settings/manual prices



### Backend

**Primary target: Netlify Functions.** Free tier, deploys frontend + serverless functions from the same GitHub repo, and its 10-second execution limit matches the per-connector timeout in Section 19.

- **Node.js + Express** — local development only, not a deployment target. Use this to build/test connectors locally before deploying.
- **Netlify Functions** — recommended production target. Matches Section 25's deployment plan.
- **Vercel API routes** — equally valid alternative to Netlify if preferred; no strong technical reason to pick one over the other.
- **Cloudflare Workers** — not recommended as a starting choice. The runtime is a V8 isolate, not Node.js, so some npm parsing/scraping libraries need adaptation. Revisit only later if free-tier limits on Netlify/Vercel become a real constraint.

> **Note on caching in serverless functions:** "in-memory cache" is instance-scoped — a fresh function invocation can spin up a new instance with an empty cache, so the 30-minute cache in Section 18 may not always persist between requests on Netlify/Vercel free tiers. This is acceptable for low-traffic family use, but if reliable persistence matters, use a small free KV store (Netlify Blobs or Vercel KV) instead of a plain JS object.



### Storage

Stage 1:

- In-memory cache on backend
- localStorage on frontend

Later:

- Supabase free tier for shared family data

---



## 6. Folder Structure

```text
pwau-price-compare/
├─ frontend/
│  ├─ index.html
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ manifest.json
│  ├─ public/
│  └─ src/
│     ├─ App.jsx
│     ├─ main.jsx
│     ├─ styles.css
│     ├─ components/
│     │  ├─ SearchBox.jsx
│     │  ├─ ResultsTable.jsx
│     │  ├─ ProductCard.jsx
│     │  ├─ RetailerStatus.jsx
│     │  ├─ ManualPriceForm.jsx
│     │  ├─ Settings.jsx
│     │  └─ Disclaimer.jsx
│     └─ services/
│        └─ api.js
│
├─ backend/
│  ├─ package.json
│  ├─ server.js
│  ├─ retailers.json
│  ├─ connectors/
│  │  ├─ index.js
│  │  ├─ woolworths.js
│  │  ├─ coles.js
│  │  ├─ chemistWarehouse.js
│  │  └─ priceline.js
│  └─ utils/
│     ├─ cache.js
│     ├─ normalizeProduct.js
│     ├─ unitPrice.js
│     ├─ buildSearchUrl.js
│     └─ timeoutFetch.js
│
├─ netlify/
│  └─ functions/
│     ├─ search.js
│     ├─ retailers.js
│     └─ health.js
│
├─ README.md
└─ MASTER_DESIGN.md
```

---



## 7. Retailer Config File

File:

```text
backend/retailers.json
```

```json
[
  {
    "id": "woolworths",
    "name": "Woolworths",
    "enabled": true,
    "homepage": "https://www.woolworths.com.au",
    "searchUrl": "https://www.woolworths.com.au/shop/search/products?searchTerm={query}"
  },
  {
    "id": "coles",
    "name": "Coles",
    "enabled": true,
    "homepage": "https://www.coles.com.au",
    "searchUrl": "https://www.coles.com.au/search/products?q={query}"
  },
  {
    "id": "chemistWarehouse",
    "name": "Chemist Warehouse",
    "enabled": true,
    "homepage": "https://www.chemistwarehouse.com.au",
    "searchUrl": "https://www.chemistwarehouse.com.au/search?searchtext={query}"
  },
  {
    "id": "priceline",
    "name": "Priceline",
    "enabled": true,
    "homepage": "https://www.priceline.com.au",
    "searchUrl": "https://www.priceline.com.au/search/?text={query}"
  }
]
```

---



## 8. Shared Product Result Format

Every connector must return products using this exact format:

```js
{
  retailer: string,
  retailerId: string,
  productName: string,
  brand: string | null,
  price: number | null,
  priceText: string | null,
  size: string | null,
  unitPrice: string | null,
  availability: string | null,
  imageUrl: string | null,
  productUrl: string | null,
  fallbackSearchUrl: string,
  source: "automated" | "fallback" | "manual" | "error",
  errorMessage: string | null,
  lastChecked: string
}
```

Rules:

1. Never crash because one retailer fails.
2. Always return fallbackSearchUrl.
3. Always return lastChecked.
4. Products with price `null` go below priced results.
5. Do not trust automated results as final purchase price.

---



## 9. Backend API Design



### GET /api/search

Example:

```text
GET /api/search?q=milk%202L
```

Optional later:

```text
GET /api/search?q=milk%202L&postcode=7000
```

Response:

```js
{
  query: "milk 2L",
  results: [],
  failedRetailers: [],
  lastChecked: "2026-07-01T23:38:00+10:00",
  cache: {
    hit: false,
    ttlMinutes: 30
  }
}
```



### GET /api/retailers

Returns enabled/disabled retailer list.

### GET /api/health

Returns backend status.

```js
{
  status: "ok",
  timestamp: "2026-07-01T23:38:00+10:00"
}
```

---



## 10. Connector Interface

Each connector must implement:

```js
export async function search(query, retailerConfig, options = {}) {
  return [];
}
```

Each connector file handles only one retailer.

Example files:

```text
backend/connectors/woolworths.js
backend/connectors/coles.js
backend/connectors/chemistWarehouse.js
backend/connectors/priceline.js
```

Each connector must:

1. Build fallback search URL.
2. Attempt automated fetch if possible.
3. Parse products if possible.
4. Normalise products.
5. Return fallback result if anything fails.
6. Never crash the backend.

---



## 11. Connector Fallback Result

If automated fetching fails, return something like:

```js
{
  retailer: "Woolworths",
  retailerId: "woolworths",
  productName: query,
  brand: null,
  price: null,
  priceText: null,
  size: null,
  unitPrice: null,
  availability: "Manual check needed",
  imageUrl: null,
  productUrl: fallbackSearchUrl,
  fallbackSearchUrl,
  source: "fallback",
  errorMessage: null,
  lastChecked: new Date().toISOString()
}
```

---



## 12. Search Flow

```text
User enters query
        |
        v
Frontend validates query
        |
        v
Frontend calls backend /api/search?q=query
        |
        v
Backend checks 30-minute cache
        |
        |-- cache hit: return cached results
        |
        |-- cache miss: call retailer connectors
                         |
                         v
              Promise.allSettled across connectors
                         |
                         v
              Normalise + sort by cheapest
                         |
                         v
              Save to cache
                         |
                         v
              Return JSON to frontend
        |
        v
Frontend displays results
```

---



## 13. Sorting Rules

1. Automated/manual results with price appear first.
2. Cheapest price first.
3. Results with `price: null` appear last.
4. Fallback/manual-check cards are clearly marked.
5. If two items have the same price, compare unit price if available.

---



## 14. Unit Price Rules

The app should try to calculate unit price from size text.

Examples:

```text
$4.50, 2L          -> $2.25 / L
$5.00, 500g        -> $10.00 / kg
$12.99, 100 tablets -> $0.13 / tablet
$28.80, 24 pack    -> $1.20 / each
$18.00, 12 x 375ml -> $4.00 / L
```

Supported units:

- L
- ml
- kg
- g
- tablets
- capsules
- pack
- each

If not clear, return `null`.

---



## 15. Frontend Pages / Sections



### Main Search Screen

Components:

- Search box
- Search button
- Loading indicator
- Error area
- Results area
- Disclaimer



### Result Card

Each card should show:

- Retailer name
- Product name
- Price
- Unit price
- Size
- Availability
- Last checked
- Source badge
- Open product/search button
- Add manual price button



### Settings Screen

Settings:

- Postcode
- Enable/disable retailers
- Backend URL
- Clear manual prices
- Clear saved basket



### Manual Price Entry

Fields:

- Product name
- Retailer
- Price
- Size
- Product link
- Notes



### Basket Screen Later

Fields:

- Added products
- Cheapest result per product
- Cheapest single-store total
- Cheapest split-store total
- Estimated saving

---



## 16. UI Design Principles

1. Mobile-first.
2. Large buttons for shopping in-store.
3. Clear cheapest highlight.
4. Simple colours.
5. No complicated layout.
6. Fast search experience.
7. Always show fallback links.

Suggested colours:

```text
Primary: #0f766e
Success: #16a34a
Warning: #f59e0b
Error: #dc2626
Background: #f8fafc
Card: #ffffff
Text: #111827
Muted text: #6b7280
```

---



## 17. PWA Requirements

Manifest:

```json
{
  "name": "PWAU Price Compare",
  "short_name": "PWAU",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f766e",
  "icons": []
}
```

Service worker:

- Cache app shell.
- Allow offline opening of app.
- Do not permanently cache live price search results.
- Show helpful message if offline.

---



## 18. Caching Rules

Backend cache:

- Cache duration: 30 minutes.
- Cache key: query + postcode if postcode exists.
- Example: `search:milk 2L:7000`.

Cache response must include:

```js
cache: {
  hit: true,
  ttlMinutes: 30
}
```

Why cache:

- Faster family use.
- Less repeated website requests.
- More stable app.

---



## 19. Reliability Rules

1. Each retailer fetch has 10-second timeout.
2. Do not retry more than once.
3. Use Promise.allSettled.
4. If fetch fails, return fallback result.
5. If parsing fails, return fallback result.
6. If one retailer fails, others must still work.
7. Always show manual search link.

---



## 20. Disclaimer Text

Show this in the app:

```text
Prices and availability may change. Always check the retailer website before buying. This app is for personal/family use only and does not provide medical advice.
```

For pharmacy products:

```text
For pharmacy products, this app compares price and availability only. Always follow advice from a qualified health professional and the retailer/pharmacist.
```

---



## 21. Non-Goals

This app should not:

1. Give medical advice.
2. Recommend medicine dosage.
3. Process prescriptions.
4. Store private health data.
5. Be marketed as a public commercial comparator.
6. Claim prices are guaranteed.
7. Hammer retailer websites with repeated requests.

---



## 22. AI Build Prompt

Use this master prompt in an AI coding tool:

```text
Build the project described in MASTER_DESIGN.md.

Follow these rules strictly:
1. Do not create one giant scraper file.
2. Every retailer must have its own connector file.
3. Every connector must return the same shared product result format.
4. If a retailer fails, return fallback/manual-check result.
5. The app must not crash because of one retailer.
6. Use a 30-minute backend cache.
7. Make frontend mobile-friendly and installable as a PWA.
8. Add README instructions for a non-programmer.
9. Keep all website-specific logic inside that website's connector file.
10. Start with fallback links first, then add automated fetch attempts.
```

---



## 23. Suggested Build Order

1. Create frontend shell.
2. Create backend API (Node.js + Express, local dev).
3. Create retailers.json.
4. Create connector interface.
5. Create fallback connectors for **all** retailers — this is the real deliverable, not a placeholder.
6. Connect frontend to backend.
7. Add sorting and cheapest highlight.
8. Add cache (accept instance-scoped limitations, or add Netlify Blobs/Vercel KV if persistence matters).
9. Add unit price calculator.
10. Add manual price entry.
11. Convert backend to Netlify Functions (or Vercel API routes).
12. Deploy.
13. *Optional, experimental:* attempt automated fetch for one retailer with a simple/static HTML structure. Treat as a bonus, not a requirement — expect it may not work for JS-rendered storefronts.
14. *Optional, experimental:* extend automated fetch to other retailers only where step 13 succeeds.

---



## 24. Local Development Commands

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Typical local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3001
```

---



## 25. Deployment Plan



### Simple Option

- Frontend: Netlify or GitHub Pages
- Backend: Netlify Functions or Vercel API routes



### Recommended for this project

Netlify, because it can deploy frontend and serverless functions from the same GitHub repo.

Deployment steps:

1. Push project to GitHub.
2. Connect GitHub repo to Netlify.
3. Set frontend build command.
4. Set publish directory.
5. Deploy functions.
6. Update frontend API URL to Netlify function URL.
7. Test `/health`.
8. Test `/search?q=milk`.

---



## 26. Testing Checklist



### Basic Search

- Search `milk 2L`.
- Search `Panadol 100 tablets`.
- Search `coffee 1kg`.
- Search `dishwasher tablets`.



### Expected Behaviour

- App does not crash.
- Each retailer returns either automated result or fallback.
- Fallback button opens correct search page.
- Cheapest result highlighted.
- Price-null results appear last.
- Cache works on second search.
- Last checked time appears.
- Disclaimer appears.



### Failure Testing

- Disable internet.
- Stop backend.
- Break one connector intentionally.
- Disable one retailer in retailers.json.
- Search empty query.
- Search special characters.

---



## 27. How to Update a Retailer Later

Example: Woolworths changes website.

1. Open:

```text
backend/connectors/woolworths.js
```

1. Check fallback search still works.
2. Update search URL in:

```text
backend/retailers.json
```

1. Update automated fetch/parsing only inside:

```text
woolworths.js
```

1. Test:

```text
/api/search?q=milk
```

1. If still broken, temporarily disable Woolworths:

```json
{
  "id": "woolworths",
  "enabled": false
}
```

---



## 28. Future Enhancements



### AI Product Matching

Use AI later to match:

```text
Coke No Sugar 24 x 375ml
Coca-Cola Zero Sugar 24 Pack
Coke Zero cans 24 pack
```



### Basket Optimisation

User adds multiple products and app calculates:

- Cheapest single-store basket
- Cheapest split-store basket
- Estimated saving



### Price History

Track prices over time:

```text
Product
Retailer
Price
Date checked
```



### Alerts

Examples:

- Notify when coffee below $15.
- Notify when nappies are on special.
- Notify when Panadol drops below chosen price.

---



## 29. Final Build Principle

The app must always remain useful even when automation breaks.

Therefore every retailer must have:

1. Automated result if possible.
2. Fallback manual search link always.
3. Manual price entry option.

This makes the app practical for family use without needing a perfect commercial-grade scraper.