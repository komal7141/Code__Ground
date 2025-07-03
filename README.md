# 👨‍💻 Real-time Collaborative Code Editor

A full-stack web application that enables multiple users to **collaboratively write and run code in real-time**. This online code editor supports **C++, Java, Python, and JavaScript** with execution powered by the **JDoodle API**. Built with **React**, **Node.js**, **Socket.IO**, and **JavaScript**, the platform provides a seamless live coding experience in shared rooms.

---

## 🚀 Features

- 👥 Real-time collaborative editing using **Socket.IO**
- 🧠 Syntax-highlighted code editor (Monaco/CodeMirror)
- 🌐 Multi-language support:
  - **C++**
  - **Java**
  - **Python**
  - **JavaScript**
- ⚙️ Code execution using **JDoodle API**
- 🔒 Unique room IDs for secure and isolated sessions
- ✨ Simple, intuitive UI built with **React.js**

---

## 🛠️ Tech Stack

| Frontend        | Backend        | Real-Time     | Code Execution |
|----------------|----------------|----------------|----------------|
| React.js        | Node.js + Express | Socket.IO     | JDoodle API    |

---



## 🧩 How It Works

1. **User creates or joins a room** via a unique room ID.
2. All participants in the room can **edit the same code document simultaneously**.
3. Users can **select the language** and run the code.
4. Code is sent to the **JDoodle API** for execution and the result is returned and displayed to the user.

---

## 🧪 Run the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/your-username/realtime-code-editor.git
cd realtime-code-editor
cd server
npm install

Create a .env file and add your JDoodle credentials:
JDOODLE_CLIENT_ID=your_client_id
JDOODLE_CLIENT_SECRET=your_client_secret

Start the server:
npm start

3. Setup the frontend
cd ../client
npm install
npm start
