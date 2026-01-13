import axios from "axios";
import 'dotenv/config';

// NOTE: Based on the new docs provided by user, this is a DIRECT call to EasySendSMS REST API, 
// NOT via RapidAPI wrapper. The docs show https://restapi.easysendsms.app/v1/rest/sms/send
// And the header is "apikey: YOUR_KEY"

const apiKey = "6762880346msh42373a1139e3ca6p1c2ebdjsna36d6133637c"; // This looks like a RapidAPI key, NOT an EasySend direct key. 
// A RapidAPI key is usually long and random. An EasySend key might differ.
// BUT, if the user is using "EasySendSMS" *via* RapidAPI, the endpoint is "easysendsms.p.rapidapi.com".
// IF the user wants to use the "Official Rest API" (restapi.easysendsms.app), they need a key from my.easysendsms.app.
// The user provided the "RapidAPI" key earlier.
// HOWEVER, the user just pasted the "REST API (v1)" docs from EasySendSMS official site, effectively saying "Use this logic".
// BUT provided the RapidAPI key again in previous turns.
// Crucial: The key '676288...' is DEFINITELY a RapidAPI key format. 
// It will FAIL against 'restapi.easysendsms.app' because that server expects an EasySend internal key.

// HYPOTHESIS: The user is confused between the RapidAPI wrapper and the Direct API.
// PROPOSAL: I will try to use the RapidAPI wrapper again BUT with the JSON payload format shown in docs, 
// because often wrappers just proxy the JSON body.
// The previous attempt used form-urlencoded because of the snippet.
// Let's try JSON body with the RapidAPI host.

const apiHost = "easysendsms.p.rapidapi.com";

async function testEasySendDirectJson() {
    console.log("Testing EasySendSMS via RapidAPI (JSON Body)...");
    
    // JSON Body as per docs
    const data = {
        from: "EasySend",
        to: "21622104391",
        text: "Hello from JSON Test",
        type: "0"
    };
    
    const options = {
        method: 'POST',
        url: `https://${apiHost}/bulksms`,
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': apiHost,
            'apikey': apiKey, // Explicit header 'apikey' as per official docs
            'Content-Type': 'application/json' // Official docs say JSON
        },
        data: {
             from: "EasySend",
             to: "21622104391",
             text: "Hello Test",
             type: "0"
        }
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

testEasySendDirectJson();
