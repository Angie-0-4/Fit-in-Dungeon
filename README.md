# 🏋️‍♂️ Fit in Dungeon

*Fit in Dungeon* ist eine Webanwendung, um Workouts zu tracken und zu planen, verpackt in einem Pixel Dungeon Theme.  
Das Projekt kombiniert *Angular (Frontend)* und *Node.js + Express + MongoDB (Backend)*.  
Features sind u. a. Registrierung/Login mit Session Cookies, Workouterstellung, Vorlagenverwaltung und Kalenderintegration.  

---

## 🚀 Features

- 👤 *User Authentifizierung*  
  - Registrierung & Login  
  - Session Handling über Cookies (Express-Session)

- 📅 *Workout-Kalender*  
  - Workouts hinzufügen (einmalig oder wiederkehrend)  
  - Löschen / Bearbeiten  

- 📂 *Workout-Vorlagen*  
  - Vorlagen erstellen, duplizieren, archivieren  
  - Eigene Übungen hinzufügen  

- 🎮 *Gamified Design*  
  - Pixel-Art / Dungeon Theme  
  - Motivation durch spielerisches Interface  

---

## 📦 Voraussetzungen

- *Node.js* (>= 18)  
- *npm* (wird mit Node installiert)  
- *Angular CLI* (npm install -g @angular/cli)  
- *MongoDB* (lokal oder Cloud wie MongoDB Atlas)  
- Git  

---

## 🔧 Installation & Nutzung

### 1. Repository klonen
```bash
git clone https://github.com/Angie-0-4/Fit-in-Dungeon.git
cd Fit-in-Dungeon

2. Backend installieren & starten

cd server
npm install

Falls noch nicht vorhanden, eine Datei .env im server Ordner erstellen (für Konfiguration):

MONGO_URI=mongodb://localhost:27017/muscle
SESSION_SECRET=supergeheim123
PORT=3000

Dann starten:

node src/index.js

 Das Backend läuft jetzt auf http://localhost:3000


---

3. Frontend installieren & starten

cd ../finale
npm install
ng serve

 Das Frontend läuft jetzt auf http://localhost:4200


---

4. Anwendung öffnen

Im Browser aufrufen:

http://localhost:4200


---

⚙️ Erklärung der Konfiguration

MONGO_URI: Verbindung zur MongoDB (Standard: mongodb://localhost:27017/muscle)

SESSION_SECRET: beliebiger String für die Session-Signierung

PORT: Port für das Backend (Default: 3000)

https://github.com/Angie-0-4/Fit-in-Dungeon/blob/main/screenshots/Bildschirmfoto%202025-09-24%20um%2013.50.13.png

---

Tech Stack

Frontend: Angular, Bootstrap, CSS

Backend: Node.js, Express, express-session

Datenbank: MongoDB/MongoDB Compass (Mongoose ODM)

Auth: Session Handling mit Cookies

---

👩‍💻 Entwicklerin:

Anjelika Vasic

Hilfeleistungen:

ChatGBT:

Planung, Codeoptimierung, Fehlerbehebung, README



---

📜 Lizenz

Nur für Studienzwecke (HTW Berlin). 
