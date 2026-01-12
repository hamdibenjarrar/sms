
import { neon } from "@neondatabase/serverless"
import { hashPassword, verifyPassword } from "@/lib/auth"
import 'dotenv/config';

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is missing")
    }

    const sql = neon(process.env.DATABASE_URL);

    const email = "hamdibenjarrar@gmail.com";
    const password = "12345678";

    console.log(`Checking user ${email}...`);

    try {
        // @ts-ignore
        const result = await (sql as any).query("SELECT * FROM users WHERE email = $1", [email]);
        
        if (result.length === 0) {
            console.log("User NOT FOUND in database.");
        } else {
            const user = result[0];
            console.log("User FOUND.");
            console.log("Stored Hash:", user.password_hash);
            
            const isValid = verifyPassword(password, user.password_hash);
            console.log(`Password '12345678' valid? ${isValid}`);
            
            if (!isValid) {
                 console.log("Attempting to fix password...");
                 const newHash = hashPassword(password);
                 // @ts-ignore
                 await (sql as any).query("UPDATE users SET password_hash = $1 WHERE email = $2", [newHash, email]);
                 console.log("Password updated.");
            }
        }
    } catch (error) {
        console.error("Error checking user:", error);
    }
}

main();
