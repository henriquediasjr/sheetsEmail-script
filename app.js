const { google } = require("googleapis"); //Provides access to Google's APIs, such as Google Sheets.
const nodemailer = require("nodemailer"); //Used to send emails programmatically.
const fs = require("fs"); //File system module for reading/writing files
const path = require("path"); //Provides utilities for working with file paths
require("dotenv").config();



// Path to your Google Service Account JSON key file
const KEYFILEPATH = path.join(__dirname, "service-account.json");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = "Página1!A:F"; // Adjust the range to match your sheet

async function readSheet() {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEYFILEPATH,
        scopes: SCOPES,
    });

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) { // Check for headers and data
        console.log("No data found in the sheet.");
        return [];
    }

    // Skip the header row and extract emails from column G (index 6)
    return rows.slice(1).map(row => row[5]).filter(email => email);
}


async function sendEmail(email, subject, text) {
    if (!email || !email.includes("@")) {
        console.error(`Invalid email: ${email}`);
        return;
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: subject,
        text: text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
    }
}

async function main() {
    try {
        const emails = await readSheet();
        console.log("Emails found:", emails);

        for (const email of emails) {
            await sendEmail(email, "Hello!", "This is a test email.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
