const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const KEYFILEPATH = path.join(__dirname, "service-account.json");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = "Teste!A:F";

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
    if (!rows || rows.length <= 1) {
        console.log("No data found in the sheet.");
        return [];
    }

    return rows.slice(1).map(row => ({
        name: row[0],
        email: row[5],
    })).filter(person => person.email && person.email.includes("@"));
}

function getEmailTemplate(companyName) {
    const templatePath = path.join(__dirname, "emailTemplate.txt");

    // Read the template file
    if (!fs.existsSync(templatePath)) {
        throw new Error("Email template file not found.");
    }

    let content = fs.readFileSync(templatePath, "utf8");

    // Ensure companyName is properly replacing the placeholder
    if (!companyName) {
        throw new Error("Company name not provided for the email template.");
    }

    // Replace placeholders with dynamic values
    content = content.replace(/{companyName}/g, companyName);

    // Separate subject and body (assuming the first line is the subject)
    const [subject, ...bodyLines] = content.split("\n");
    const body = bodyLines.join("\n").trim();

    return { subject: subject.replace("Subject: ", "").trim(), body };
}


async function sendEmail({ name, email }, companyName) {
    if (!companyName) {
        console.error(`Company name is missing for email to ${name} (${email})`);
        return;
    }

    const { subject, body } = getEmailTemplate(companyName);

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject,
        text: body
            .replace("[Your Email Address]", process.env.GMAIL_USER)
            .replace("[Your Phone Number]", process.env.PHONE_NUMBER)
            .replace("[Your LinkedIn Profile]", process.env.LINKEDIN_PROFILE)
            .replace("[Your Portfolio or GitHub Link]", process.env.GITHUB),
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${name} (${email})`);
    } catch (error) {
        console.error(`Failed to send email to ${name} (${email}):`, error);
    }
}


async function main() {
    try {
        const people = await readSheet();
        console.log("Recipients found:", people);

        for (const person of people) {
            await sendEmail(person, { companyName });
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
