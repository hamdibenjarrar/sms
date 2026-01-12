

// import fetch from 'node-fetch'; 

async function testLogin() {
    try {
        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: "hamdibenjarrar@gmail.com",
                password: "12345678"
            })
        });

        const status = response.status;
        const data = await response.json();
        console.log("Status:", status);
        console.log("Body:", data);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testLogin();
