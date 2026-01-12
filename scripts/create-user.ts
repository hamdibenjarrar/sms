// Script to create the requested user
import { neon } from "@neondatabase/serverless"
import { hashPassword } from "@/lib/auth"
import 'dotenv/config';

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is missing")
    }

    const sql = neon(process.env.DATABASE_URL);

    const email = "hamdibenjarrar@gmail.com";
    const password = "12345678";
    const passwordHash = hashPassword(password);

    console.log(`Creating user ${email}...`);

    try {
        // @ts-ignore
        await (sql as any).query("INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET password_hash = $2", [email, passwordHash, 'admin']);
        console.log("User created successfully.");
    } catch (error) {
        console.error("Error creating user:", error);
    }
}

main();
