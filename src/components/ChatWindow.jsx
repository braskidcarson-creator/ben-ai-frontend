import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

function formatTime(seconds) {
    const total = Math.floor(Number(seconds) || 0);
    const minutes = Math.floor(total / 60);
    const secs = total % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
}

function TranscriptCard({ message }) {

    const segments = message.segments || [];

    const copyTranscript = async () => {

        try {

            await navigator.clipboard.writeText(
                message.content || ""
            );

        } catch (error) {

            console.error(
                "COPY TRANSCRIPT ERROR:",
                error
            );

        }

    };

    const downloadTranscript = () => {

        const text = segments.length > 0
            ? segments
                .map(
                    (segment) =>
                        `[${formatTime(segment.start)}] ${segment.text}`
                )
                .join("\n")
            : message.content || "";

        const blob = new Blob(
            [text],
            {
                type: "text/plain;charset=utf-8"
            }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "BEN-AI-Transcript.txt";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    };

    return (

        <div className="transcript-card">

            <div className="transcript-header">

                <div>

                    <div className="transcript-title">
                        📝 TRANSCRIPTION
                    </div>

                    <div className="transcript-language">
                        Language:{" "}
                        {(message.language || "unknown").toUpperCase()}
                    </div>

                </div>

                <div className="transcript-badge">
                    BEN AI
                </div>

            </div>


            <div className="transcript-body">

                {segments.length > 0 ? (

                    segments.map(
                        (segment, segmentIndex) => (

                            <div
                                className="transcript-segment"
                                key={segmentIndex}
                            >

                                <span className="transcript-time">
                                    {formatTime(segment.start)}
                                </span>

                                <span className="transcript-text">
                                    {segment.text}
                                </span>

                            </div>

                        )
                    )

                ) : (

                    <div className="transcript-text-only">
                        {message.content}
                    </div>

                )}

            </div>


            <div className="transcript-footer">

                <button
                    type="button"
                    onClick={copyTranscript}
                    className="transcript-action"
                >
                    📋 Copy
                </button>

                <button
                    type="button"
                    onClick={downloadTranscript}
                    className="transcript-action"
                >
                    💾 Download
                </button>

            </div>

        </div>

    );

}


function ChatWindow({ messages, loading }) {

    const bottomRef = useRef(null);

    useEffect(() => {

        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages, loading]);


    if (messages.length === 0 && !loading) {

        return (

            <div className="chat-window">

                <div className="welcome">

                    <div style={{ fontSize: "70px" }}>
                        🤖
                    </div>

                    <h1>Welcome to BEN AI</h1>

                    <p>
                        Your intelligent learning and productivity assistant.
                    </p>

                    <br />

                    <p>📘 Ask academic questions</p>
                    <p>📄 Upload PDF notes</p>
                    <p>📝 Summarize documents</p>
                    <p>💡 Generate ideas</p>
                    <p>🧠 Learn anything faster</p>

                    <br />

                    <h3>How can I help you today?</h3>

                </div>

            </div>

        );

    }


    return (

        <div className="chat-window">

            {messages.map((msg, index) => (

                <div
                    key={index}
                    className={`message ${
                        msg.role === "user"
                            ? "user-message"
                            : "ai-message"
                    }`}
                >

                    <div className="avatar">

                        {msg.role === "user"
                            ? "🧑"
                            : "🤖"}

                    </div>


                    <div className="message-content">

                        <div className="message-name">

                            {msg.role === "user"
                                ? "You"
                                : "BEN AI"}

                        </div>


                        {msg.type === "transcription" ? (

                            <TranscriptCard message={msg} />

                        ) : (

                            <div className="bubble">

                                <ReactMarkdown>
                                    {msg.content}
                                </ReactMarkdown>

                            </div>

                        )}

                    </div>

                </div>

            ))}


            {loading && (

                <div className="message ai-message">

                    <div className="avatar">
                        🤖
                    </div>

                    <div className="message-content">

                        <div className="message-name">
                            BEN AI
                        </div>

                        <div className="bubble thinking">

                            ⏳ <strong>Thinking...</strong>

                            <br />

                            Analyzing your question...

                        </div>

                    </div>

                </div>

            )}


            <div ref={bottomRef}></div>

        </div>

    );

}

export default ChatWindow;
