# ExpenseWise - Receipt Analytics

ExpenseWise is a modern web application that allows users to upload receipt images, analyze them using Google Gemini AI, and visualize their spending trends and categories. The app features a beautiful, responsive UI, batch image upload, and interactive charts for financial insights.

---

## Features

- **Batch Receipt Upload:** Upload multiple receipt images at once (drag & drop or file picker).
- **AI-Powered Parsing:** Images are sent to a Node.js backend, which uses Google Gemini AI to extract structured JSON data from each receipt.
- **Smart Caching:** Already analyzed receipts are cached in the browser and not re-sent to Gemini, saving API calls and time.
- **Analysis Results:** Parsed receipt data is displayed in a responsive, collapsible grid with JSON details for each receipt.
- **Spending Overview:**
  - **Monthly Trend:** Line chart showing total spending per month (all currencies converted to USD).
  - **Category Breakdown:** Interactive pie chart with colored slices for each spending category.
- **Responsive Design:** Built with Tailwind CSS for a clean, modern look on all devices.

---

## Project Structure

```
receipt-parser/
├── backend/
│   └── server.js
├── frontend/
│   ├── index.html
│   └── script.js
├── .env
└── README.md
```

---

## Setup Instructions

### 1. Clone the Repository

```sh
git clone <your-repo-url>
cd receipt-parser
```

### 2. Backend Setup

- Install dependencies:

  ```sh
  cd backend
  npm install express @google/generative-ai dotenv cors
  ```

- Create a `.env` file in the `backend` folder with your Gemini API key:

  ```
  GEMINI_API_KEY=your_google_gemini_api_key_here
  ```

- Start the backend server:

  ```sh
  node server.js
  ```

  The backend will run on [http://localhost:3000](http://localhost:3000).

### 3. Frontend Setup

- No build step is required. The frontend is static and served by the backend.
- Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. **Upload Receipts:** Drag and drop or browse to select one or more receipt images.
2. **Analyze:** Click "Analyze Receipts" to send new images to the backend for AI analysis.
3. **View Results:** See each receipt’s extracted data in a collapsible grid. Click to expand/collapse.
4. **Visualize Spending:** Check the Monthly Spending Trend (line chart) and Spending by Category (pie chart) for insights. All amounts are converted to USD for consistency.

---

## Technologies Used

- **Frontend:** HTML, Tailwind CSS, Javascript
- **Backend:** Node.js, Express.js
- **AI Integration:** Google Gemini API (`@google/generative-ai`)
- **Data Visualization:** Custom SVG charts

---

## Customization

- **Currency Conversion:** Rates are hardcoded in `script.js` and can be updated as needed.
- **Categories:** The list of categories is defined by the AI prompt and can be adjusted in the backend.
- **Styling:** Tailwind CSS is used for easy customization.

---

## Notes

- **API Key Security:** The Gemini API key is stored server-side and never exposed to the client.
- **Caching:** Receipts are identified by file name, size, and last modified date. If you upload the same file again, it will not be re-analyzed.
- **Limits:** The backend limits JSON body size to 3MB to accommodate image uploads.

---

**Enjoy smarter expense tracking with ExpenseWise!**
