# 🚆 Train Booking Management System - YatraSetu

![GitHub Repo Size](https://img.shields.io/github/repo-size/Ashwinpatil777/Train-Booking-Management-System-Yatrasetu-)
![GitHub last commit](https://img.shields.io/github/last-commit/Ashwinpatil777/Train-Booking-Management-System-Yatrasetu-)
![GitHub stars](https://img.shields.io/github/stars/Ashwinpatil777/Train-Booking-Management-System-Yatrasetu-?style=social)
![GitHub forks](https://img.shields.io/github/forks/Ashwinpatil777/Train-Booking-Management-System-Yatrasetu-?style=social)

A full-stack **Train Booking Management System** that allows users to search trains, select seats, book tickets, and make payments via **Stripe**. Built with **Spring Boot** (backend) and **React.js** (frontend).

---

## 📌 Features

### User Features:
- Search trains by **source, destination, and date**
- Select a train and choose a **coach**
- View **seat layout** for each coach (100 seats per coach)
- Select **specific seats**
- Enter **customer details**
- Make **payment via Stripe**
- Booking confirmation with **email**
- Download or print **ticket PDF**

### Admin Features:
- Manage trains (Add, Update, Delete)
- Manage coaches and seat availability
- View all bookings and users

---

## 🛠 User Workflow

A[Search Train] --> B[Select Train]
B --> C[Select Coach & Seats]
C --> D[Enter Customer Details]
D --> E[Payment via Stripe]
E --> F[Booking Confirmation & Email]
F --> G[Download/Print Ticket PDF]
User searches trains by date, source, and destination

Selects a train from the available options

Picks a coach and selects seats

Adds passenger details

Pays via Stripe

Receives confirmation email and downloadable PDF

💻 Technologies
Backend:

Java 17, Spring Boot, Hibernate

RESTful APIs

MySQL Database

Stripe Payment Integration

Email Notification

Frontend:

React.js, React Bootstrap

Axios for API calls

Responsive UI

Other Tools:

Git & GitHub

PDF generation for tickets

🗂 Project Structure
csharp
Copy code
backend/          # Spring Boot backend
  src/
    main/
      java/
      resources/
frontend/         # React.js frontend
  public/
  src/
    components/
    pages/
README.md
.gitignore
backend/ → Spring Boot app, models, repositories, services, controllers, and REST APIs

frontend/ → React app, components, pages, and API integration

.env / application.properties → Store sensitive information (DB credentials, JWT secret, Stripe keys)

⚙️ Setup & Installation
Backend:
Clone repository:

bash
Copy code
git clone https://github.com/Ashwinpatil777/Train-Booking-Management-System-Yatrasetu-.git
cd Train-Booking-Management-System-Yatrasetu-/backend
Configure MySQL in application.properties:

properties
Copy code
spring.datasource.url=jdbc:mysql://localhost:3306/train_booking
spring.datasource.username=root
spring.datasource.password=YOUR_DB_PASSWORD
stripe.api.key=YOUR_STRIPE_SECRET_KEY
Build and run:

bash
Copy code
mvn clean install
mvn spring-boot:run
Frontend:
Navigate to frontend:

bash
Copy code
cd ../frontend
Install dependencies:

bash
Copy code
npm install
Start development server:

bash
Copy code
npm start
🌐 Running the Application
Backend API: http://localhost:8080

Frontend App: http://localhost:3000

🔑 Environment Variables
Ensure these are set:

JWT Secret

Stripe API Keys

MySQL Database Credentials

Email SMTP Settings

🤝 Contributing
Fork the repository

Create a new branch: git checkout -b feature/your-feature

Make your changes

Commit: git commit -m 'Add feature'

Push branch: git push origin feature/your-feature

Open a pull request

📄 License
This project is licensed under the MIT License. See LICENSE for details.

---

I can also make a **version with a GitHub banner image, colorful badges, and screenshot placeholders** ready for copy-paste so your repo looks professional.  

Do you want me to make that version too?

## 🎥 Demo Video

[![Watch the video] (https://drive.google.com/drive/folders/1-qP8QYvMT9qdlF8XKSnvs8Us6R16Ltn2?usp=sharing)
