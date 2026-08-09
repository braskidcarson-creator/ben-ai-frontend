const API_URL = import.meta.env.VITE_API_URL;

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


export async function uploadPDF(file) {
    console.log("PDF UPLOAD:", file.name);

    const formData = new FormData();

    formData.append("file", file);

    try {
        const response = await fetch(
            `${API_URL}/upload-pdf`,
            {
                method: "POST",
                body: formData
            }
        );

        console.log(
            "PDF UPLOAD STATUS:",
            response.status
        );

        const data = await response.json();

        console.log(
            "PDF UPLOAD RESPONSE:",
            data
        );

        if (!response.ok) {
            throw new Error(
                typeof data.detail === "string"
                    ? data.detail
                    : "PDF upload failed"
            );
        }

        return data;

    } catch (error) {
        console.error(
            "PDF UPLOAD ERROR:",
            error
        );

        throw error;
    }
}