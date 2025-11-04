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

