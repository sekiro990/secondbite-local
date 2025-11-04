# ♻️ SecondBite Local

_A community food-sharing platform connecting local cafes, restaurants, and households with surplus food to nearby charities and individuals._

---

## 🌍 Overview

**SecondBite Local** is a full-stack web application designed to reduce food waste and promote community welfare.  
It enables donors (cafes, restaurants, households) to list surplus food and allows receivers (individuals or charities) to claim it for pickup.  

This project aims to:
- Reduce food waste across Australia 🇦🇺  
- Support food-insecure communities  
- Encourage sustainability and local impact  

---

## System Architecture & ERD

```mermaid
graph TD
  A["Frontend - Next.js and TypeScript"] -->|"REST API (Axios)"| B["Backend - Express.js"]
  B -->|"Queries"| C["(PostgreSQL - Supabase)"]
  B --> D["Cloudinary - Image Storage"]
  A --> E["Google Maps API - Geolocation"]
  F["Render and Vercel Deployment"] --> A
  F --> B
  
```mermaid
erDiagram
    USERS {
        INT id PK
        TEXT name
        TEXT email
        TEXT password_hash
        TEXT role
        TIMESTAMP created_at
    }

    FOOD_LISTINGS {
        INT id PK
        TEXT title
        TEXT description
        TEXT category
        TEXT quantity
        DATE expiry_date
        FLOAT location_lat
        FLOAT location_lng
        INT created_by FK
        TEXT status
    }

    CLAIMS {
        INT id PK
        INT listing_id FK
        INT claimed_by FK
        TIMESTAMP claimed_at
    }

    REVIEWS {
        INT id PK
        INT listing_id FK
        INT user_id FK
        INT rating
        TEXT comment
        TIMESTAMP created_at
    }

    NOTIFICATIONS {
        INT id PK
        INT user_id FK
        TEXT message
        BOOLEAN is_read
        TIMESTAMP created_at
    }

    USERS ||--o{ FOOD_LISTINGS : creates
    USERS ||--o{ CLAIMS : claims
    FOOD_LISTINGS ||--o{ CLAIMS : is_claimed_in
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ NOTIFICATIONS : receives
    FOOD_LISTINGS ||--o{ REVIEWS : has
    

