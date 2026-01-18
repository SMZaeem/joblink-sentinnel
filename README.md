


# 🚀 JobLink Sentinel

**JobLink Sentinel** is a high-performance Chrome Extension designed to save job seekers from the frustration of "Ghost Postings." It identifies expired job links in real-time using a distributed background scraping engine.

---

## 🌟 Key Features

* **🎯 Right-Click Verification:** Don't leave your tab. Right-click any job link and select "Check with Sentinel" to verify it in the background.
* **⚡ Distributed Task Queue:** Powered by **BullMQ & Redis**, handling multiple scraping jobs without slowing down the API.
* **🕵️ Stealth Scraping:** Uses **Puppeteer-Stealth** to bypass bot detection on major job boards like LinkedIn, Stripe, and Greenhouse.
* **📊 Live Dashboard:** Monitor your scraping queue in real-time via the built-in **Bull Board** UI.
* **📱 Clean Extension UI:** Built with **React 18** and **Tailwind CSS v4** for a modern, snappy user experience.

---

## 🛠️ Technical Architecture

This project is built using a **decoupled microservices approach**:

1. **Frontend:** React/TypeScript Chrome Extension (Manifest V3).
2. **Backend:** Node.js & Express REST API.
3. **Task Management:** Redis-backed BullMQ for job persistence and retries.
4. **Worker:** Dedicated Puppeteer instance for headless browser automation.
5. **Database:** MongoDB Atlas for persistent history and link status tracking.

---

## 🚦 Getting Started

### Prerequisites

* Node.js (v18+)
* MongoDB Atlas Account
* Redis (Local or Docker)

### Installation

1. **Clone & Install Dependencies**
```bash
git clone https://github.com/yourusername/joblink-sentinel.git
cd joblink-sentinel
npm install  # Install in both root and extension folders

```


2. **Environment Setup**
Create a `.env` file in the `backend/` directory:
```env
MONGO_URI=your_mongodb_connection_string
PORT=3000

```


3. **Start the Engine**
```bash
# Terminal 1: Start Redis
docker run -p 6379:6379 redis

# Terminal 2: Start API
npm run server

# Terminal 3: Start Worker
npm run worker

```


4. **Load the Extension**
* Run `npm run build` in the `extension/` folder.
* Go to `chrome://extensions`.
* Enable **Developer Mode**.
* Click **Load Unpacked** and select the `extension/dist` folder.



---

## 🧠 Challenges Overcome

* **Handled Asynchronicity:** Solved the "stuck on pending" issue by implementing a polling mechanism in React that syncs with the BullMQ job status.
* **Bot Protection:** Implemented custom User-Agent rotation and Stealth plugins to ensure 99% uptime against anti-scraping measures.
* **UX Design:** Moved from a manual "Check" button to a Context-Menu (Right-Click) trigger, reducing user friction by 70%.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

---
Built with ❤️ by SYED MOHAMMAD ZAEEM

