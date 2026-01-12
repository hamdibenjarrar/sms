// scripts/test-textlink.ts
import axios from "axios";
// We hardcode the key for the test script to bypass any env loading issues for now, or use dotenv
import 'dotenv/config';

async function main() {
  const apiKey = process.env.TEXTLINK_API_KEY;
  
  if (!apiKey) {
    console.error("No TEXTLINK_API_KEY found in environment");
    // Try to read from .env manually if process.env failed (sometimes happens in ts-node if not configured right)
    return;
  }

  console.log("Testing TextLink with Key starting with:", apiKey.substring(0, 5) + "...");
  
  // Parse command line arg for phone number
  const phoneArg = process.argv[2];
  const simCardIdArg = process.argv[3];
  
  const phone = phoneArg || "+15005550006"; // Default test number

  if (!phoneArg) {
    console.warn("\n⚠️  No phone number provided as argument. Using dummy '" + phone + "'.");
    console.warn("Usage: npx tsx scripts/test-textlink.ts <PHONE> [SIM_CARD_ID]\n");
  }

  const message = "Test message from standalone script " + new Date().toISOString();

  const payload: any = {
    phone_number: phone,
    text: message,
  };

  if (simCardIdArg) {
    console.log("Using explicit SIM Card ID:", simCardIdArg);
    payload.sim_card_id = Number(simCardIdArg);
  }

  try {
    console.log("Sending request...", payload);
    const response = await axios.post(
      "https://textlinksms.com/api/send-sms",
      payload,
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response Status:", response.status);
    console.log("Response Body:", response.data);
  } catch (error: any) {
    console.error("Request Failed!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

main();
