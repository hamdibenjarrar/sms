import axios from "axios";
import { getEnv } from "./env";

export const sendSms = async (phoneNumber: string, message: string) => {
  const env = getEnv();
  
  // Validate env vars
  if (!env.TEXTLINK_API_KEY) {
    throw new Error("Missing TEXTLINK_API_KEY");
  }

  try {
    const payload: any = {
      phone_number: phoneNumber,
      text: message,
    };

    if (env.TEXTLINK_SIM_ID) {
      payload.sim_card_id = Number(env.TEXTLINK_SIM_ID);
    }

    const response = await axios.post(
      "https://textlinksms.com/api/send-sms",
      payload,
      {
        headers: {
          "Authorization": `Bearer ${env.TEXTLINK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("[textlink] Response status:", response.status);
    console.log("[textlink] Response data:", JSON.stringify(response.data));

    return response.data;
  } catch (error: any) {
    console.error("Error sending SMS via TextLink:", error.response?.data || error.message);
    // If TextLink returns useful error data in body, pass it up
    throw new Error(error.response?.data?.error || error.response?.data?.message || error.message);
  }
};
