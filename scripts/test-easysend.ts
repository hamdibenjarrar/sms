import axios from "axios";
import 'dotenv/config';

const apiKey = "6762880346msh42373a1139e3ca6p1c2ebdjsna36d6133637c";
const apiHost = "easysendsms.p.rapidapi.com";

// Using the logic from user snippet + docs found
// User snippet uses 'application/x-www-form-urlencoded' 
// Docs say "Include your API key in the request header using the apikey field" OR "x-rapidapi-key"
// Docs say "All requests ... should use the application/json content type" for the direct REST API
// BUT the RapidAPI endpoint might be a wrapper. 
// User snippet creates `new URLSearchParams()` implying standard form post for RapidAPI wrapper.
// Let's try adhering to the USER SNIPPET style first (RapidAPI wrapper)

async function testEasySend() {
    console.log("Testing EasySendSMS via RapidAPI...");
    
    // RapidAPI wrapper usually takes form data
    const encodedParams = new URLSearchParams();
    encodedParams.set('username', 'testuser'); // RapidAPI might handle auth via key, but sometimes needs param?
    encodedParams.set('password', 'testpass');
    encodedParams.set('to', '21622104391');
    encodedParams.set('text', 'Hello from EasySendSMS Test');
    encodedParams.set('type', '0'); // 0 for plain text
    
    // Note: User snippet had "data: encodedParams"
    
    const options = {
        method: 'POST',
        url: `https://${apiHost}/bulksms`, // Endpoint from user snippet
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': apiHost,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: encodedParams, // stringify implicitly by axios or pass URLSearchParams
    };

    try {
        const response = await axios.request(options);
        console.log("Response:", JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        if (error.response) {
            console.error("API Error Status:", error.response.status);
            console.error("API Error Data:", error.response.data);
        } else {
            console.error("Network/Client Error:", error.message);
        }
    }
}

testEasySend();
