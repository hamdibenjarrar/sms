import axios from "axios";
import 'dotenv/config';

const apiKey = process.env.RAPIDAPI_KEY || "6762880346msh42373a1139e3ca6p1c2ebdjsna36d6133637c";
const apiHost = "textflow.p.rapidapi.com";

const targetPhone = process.argv[2] || "+14155552671"; 

async function testRapidSms() {
    console.log("Testing TextFlow (RapidAPI)...");
    console.log("Host:", apiHost);
    console.log("Target:", targetPhone);

    const options = {
        method: 'POST',
        url: `https://${apiHost}/send`,
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': apiHost,
            'Content-Type': 'application/json'
        },
        data: {
            phone_number: targetPhone,
            text: "Hello testing 123"
        }
    };

    try {
        const response = await axios.request(options);
        console.log("Response:", JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        if (error.response) {
            console.error("API Error Status:", error.response.status);
            console.error("API Error Data:", error.response.data);
            console.error("API Error Headers:", error.response.headers);
        } else {
            console.error("Network/Client Error:", error.message);
        }
    }
}

testRapidSms();
