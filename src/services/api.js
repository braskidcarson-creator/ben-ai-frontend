const API_URL = "https://ben-ai-qsq6.onrender.com";

export async function askBENAI(message, history = []) {
    console.log("API RECEIVED:", message);

    try {
        const response = await fetch(`${API_URL}/ask`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: String(message),
                history: history
            })
        });

        console.log("API STATUS:", response.status);

        const data = await response.json();

        console.log("API RESPONSE:", data);

        if (!response.ok) {
            throw new Error(
                typeof data.detail === "string"
                    ? data.detail
                    : "BEN AI request failed"
            );
        }

        return data.answer;

    } catch (error) {
        console.error("BEN AI API ERROR:", error);
        throw error;
    }
}
