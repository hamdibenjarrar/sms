
import { getUserByEmail } from "@/lib/db"
import 'dotenv/config';

async function main() {
    console.log("Testing getUserByEmail...");
    try {
        const user = await getUserByEmail("hamdibenjarrar@gmail.com");
        console.log("Result:", user);
    } catch (e) {
        console.error("Error:", e);
    }
}
main();
