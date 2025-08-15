# ExpenseWise - Receipt Analytics

ExpenseWise is a full-stack, mobile-friendly web application that enables users to upload receipt images, analyze them using Google Gemini AI, and visualize their spending trends and categories. The app features secure user authentication, a responsive UI, batch image upload, and interactive charts for actionable financial insights.

---

## Features

- **User Authentication:** Secure registration and login with JWT-based authentication and password hashing.
- **Batch Receipt Upload:** Upload multiple receipt images at once (drag & drop or file picker).
- **AI-Powered Parsing:** Images are sent to a Node.js backend, which uses Google Gemini AI to extract structured JSON data from each receipt.
- **Smart Caching:** Already analyzed receipts are cached in the browser and not re-sent to Gemini, saving API calls and time.
- **Analysis Results:** Parsed receipt data is displayed in a responsive, collapsible grid with JSON details for each receipt.
- **Spending Overview:**
  - **Monthly Trend:** Line chart showing total spending per month (all currencies converted to USD).
  - **Category Breakdown:** Interactive pie chart with colored slices for each spending category.
- **Mobile-First Responsive Design:** Built with Tailwind CSS for a clean, modern look on all devices.
- **Profile Dropdown:** User info and logout available via a dropdown menu on the profile icon.


---

## Project Structure

```
receipt-parser/
├── backend/
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── script.js
│   └── auth.js
├── .env
└── README.md
```

---

## Usage

1. **Register/Login:** Create an account or log in with your credentials.
2. **Upload Receipts:** Drag and drop or browse to select one or more receipt images.
3. **Analyze:** Click "Analyze Receipts" to send new images to the backend for AI analysis.
4. **View Results:** See each receipt’s extracted data in a collapsible grid. Click to expand/collapse.
5. **Visualize Spending:** Check the Monthly Spending Trend (line chart) and Spending by Category (pie chart) for insights. All amounts are converted to USD for consistency.
6. **Logout:** Use the profile dropdown to securely log out.

---

## Technologies Used

- **Frontend:** HTML, Tailwind CSS, JavaScript 
- **Backend:** Node.js, Express.js, MongoDB 
- **Authentication:** JWT, bcryptjs
- **AI Integration:** Google Gemini API (`@google/generative-ai`)
---


**Enjoy smarter, secure, and mobile-friendly expense tracking with ExpenseWise!**
