const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function testDomains() {
    try {
        const response = await fetch("http://localhost:3001/api/domains");
        if (!response.ok) throw new Error(response.statusText);
        const domains = await response.json();
        console.log("Fetched Domains:", domains);
        if (domains.includes("Fury") && domains.includes("Order") && domains.includes("Chaos")) {
            console.log("PASS: Expected domains found.");
        } else {
            console.log("FAIL: Expected domains missing.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

testDomains();
