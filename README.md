# Email Sender Script

## Running the Script

1. **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd <project-folder>
    ```

2. **Install Dependencies:**
    ```bash
    npm install
    ```

3. **Create `.env` File:**
    In the root directory, create a file named `.env` with the following content:
    ```env
    GMAIL_USER=your_email@gmail.com
    GMAIL_PASS=your_app_password
    ```
    - Replace `your_email@gmail.com` with your Gmail address.
    - Replace `your_app_password` with your Gmail app password (refer to [Google’s guide](https://support.google.com/accounts/answer/185833?hl=en) to create one).

4. **Add Google Service Account Key:**
    - Place the JSON key file for your Google Service Account in the project directory. Name it `service-account.json`.

5. **Edit Google Sheet Details in `app.js`:**
    Update the following constants:
    ```javascript
    const SPREADSHEET_ID = 'your_spreadsheet_id';
    const RANGE = 'Página1!A:J';
    ```

6. **Run the Script:**
    ```bash
    node app.js
    ```
    - This will send emails to the addresses found in column J of the Google Sheet.
