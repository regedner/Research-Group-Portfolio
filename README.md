# 🧠 Research Group Management System

This project is a **full-stack web application** designed to manage research group members, their publications, and conference participations.  
The frontend is built with React & TypeScript, while the backend uses Spring Boot (Java).


## 🚀 Features

### 🔹 Backend (Spring Boot)
- RESTful API architecture (Spring Web)
- CRUD operations for Members, Publications, and Conferences
- Integration with **OpenAlex** and **SerpAPI** (automated data fetching)
- Member photo upload support (stored in local `uploads/` directory)
- Swagger/OpenAPI documentation
- Global Exception Handling
- Publication count by year (for visualization)
- CORS configuration for `localhost:3000` frontend access

### 🔹 Frontend (React + TypeScript)
- Modern responsive UI with **Material UI** and **Tailwind CSS**
- Detailed member pages (publications, conferences, yearly charts)
- Filtering by publication type and tags
- Inline editing of publication details (tags/type)
- Member bio and photo update feature
- Rich text editing via Quill
- Smooth scroll animations and auto-scroll to top
- Mobile-friendly navigation (Navbar + Drawer)

---

## 🧩 Tech Stack

| Layer | Technologies |
|--------|---------------|
| **Frontend** | React, TypeScript, Tailwind CSS, Material UI, React Query, Recharts |
| **Backend** | Spring Boot, JPA/Hibernate, OpenAPI/Swagger, REST, Jackson |
| **Database** | H2 / PostgreSQL (optional configuration) |
| **3rd Party APIs** | [OpenAlex](https://openalex.org/), [SerpAPI](https://serpapi.com/) |

---

## 🛠️ Setup Instructions

### 1. Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
```
- The app runs at `http://localhost:8080`  
- Swagger UI: `http://localhost:8080/swagger-ui.html`  
- Uploaded photos are stored in the `uploads/` directory

### 2. Frontend (React + TypeScript)
```bash
cd frontend
npm install
npm run dev
```
- The app runs at `http://localhost:3000`  
- API requests are proxied to `localhost:8080/api/...`

---

## 📊 Example API Endpoints

| Method | Endpoint | Description |
|---------|-----------|-------------|
| `GET` | `/api/members` | Retrieve all members |
| `POST` | `/api/members/fetch?sourceId=...` | Fetch a member from OpenAlex or SerpAPI |
| `PUT` | `/api/members/{id}` | Update member details |
| `POST` | `/api/members/{id}/upload-photo` | Upload member profile photo |
| `GET` | `/api/members/{id}/publications` | Get member’s publications |
| `GET` | `/api/members/{id}/counts-by-year` | Get publication count by year |
| `POST` | `/api/members/{id}/conferences` | Add a new conference |

---

## 🖼️ Screenshots (Optional)
![1](https://github.com/user-attachments/assets/a7479765-a315-478f-a14a-134b85cce2d3)
![2](https://github.com/user-attachments/assets/e413796e-c330-4d07-a385-ae61da6136e4)
![3](https://github.com/user-attachments/assets/9f86f953-bdf9-4616-95d2-a3b0a8beedf5)
![4](https://github.com/user-attachments/assets/0aa4309f-0e49-491b-bafe-66be564fe619)
![5](https://github.com/user-attachments/assets/af12751e-a7a6-45a6-bdb7-e044ec6f30f4)
![6](https://github.com/user-attachments/assets/25cc5447-89a3-4f66-bd3c-d511a2ff119e)
![7](https://github.com/user-attachments/assets/b471fbed-fad1-4757-876b-e02fd7a8d33e)
![8](https://github.com/user-attachments/assets/4e90705b-f314-45c6-870c-28bc4dace991)


---

## 📌 Notes
- The project is **still in development**, but core backend and frontend functionalities are working.
- Suitable for portfolio showcasing purposes.
- Remember to **keep API keys** (e.g. `serpapi.api.key`) **private** in `.env` or `application.properties`.

---
