// static/js/main.js
console.log("E-Rakshak FIR Management System Initialized");

// Function to classify FIR live using API
async function classifyIncidentLive(description) {
    if (!description || description.length < 15) return null;
    try {
        const res = await fetch("/api/ai/classify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description })
        });
        const data = await res.json();
        return data.prediction;
    } catch (e) {
        console.error("AI classification error:", e);
        return null;
    }
}
