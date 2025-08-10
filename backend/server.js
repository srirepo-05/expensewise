// Import required libraries
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Configure environment variables
dotenv.config();

// Initialize the app
const app = express();
const port = 3000; // You can use any port

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json({ limit: '3mb' })); // Allow server to accept JSON data, with a higher limit for images

app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// Define the main API endpoint
app.post('/api/process-receipt', async (req, res) => {
    try {
        // Get the image data and MIME type from the request body
        const { image, mimeType } = req.body;

        // The prompt you provided
        const prompt = `You are an expert financial assistant specializing in parsing receipts.
Analyze the provided receipt image and extract the following information in a strict JSON format.
Do not include the opening and closing \`\`\`json markers.

The JSON object must have this exact structure:
{
  "vendorName": "string",
  "transactionDate": "YYYY-MM-DD",
  "lineItems": [
    { "description": "string", "quantity": number, "price": number }
  ],
  "subtotal": number | null,
  "tax": number | null,
  "tip": number | null,
  "total": number,
  "currency": "string (e.g., USD, INR, EUR)",
  "category": "string (choose one from the list below)"
}

Rules:
- If a value is not present on the receipt (like tip or subtotal), set its value to null.
- The 'total' is mandatory.
- For line items, if quantity is not specified, assume 1.
- Infer the vendor's name from the most prominent logo or text at the top.
- Choose the most appropriate category from this list: ["Groceries", "Dining", "Transportation", "Utilities", "Shopping", "Entertainment", "Health", "Services", "Travel", "Other"].`;

        // Prepare the image part for the API request
        const imagePart = {
            inlineData: {
                data: image,
                mimeType: mimeType
            }
        };

        // Generate content using the model
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Send the extracted text back to the frontend
        res.json({ success: true, data: text });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to process the image.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`✨ Server running on http://localhost:${port}`);
});