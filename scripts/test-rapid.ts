import axios from "axios";
import 'dotenv/config';

const apiKey = process.env.RAPIDAPI_KEY;
const apiHost = process.env.RAPIDAPI_HOST || "sms-verify3.p.rapidapi.com";

if (!apiKey) {
    console.error("No RAPIDAPI_KEY found in environment");
    process.exit(1);
}

// Phone number from args or default
// Valid format for this API: International format without spaces etc.
// But the prompt example was "+14155552671"
const targetPhone = process.argv[2] || "+447459034784"; 

async function testRapidSms() {
    console.log("Testing SMS Verify API (RapidAPI)...");
    console.log("Host:", apiHost);
    console.log("Target:", targetPhone);

    const options = {
        method: 'POST',
        url: `https://${apiHost}/send-numeric-verify`,
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': apiHost,
            'Content-Type': 'application/json'
        },
        data: {
            target: targetPhone,
            code: 1234, // Try code param?
            verify_code: 1234 // Try verify_code param?
        }
    };

    try {
        const response = await axios.request(options);
        console.log("Response Headers:", response.headers);
        console.log("Response:", JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        if (error.response) {
            console.log("Error Response Headers:", error.response.headers);
            console.error("API Error Status:", error.response.status);
            console.error("API Error Data:", error.response.data);
        } else {
            console.error("Network/Client Error:", error.message);
        }
    }
}

testRapidSms();
