import { useEffect, useRef } from "react";

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

                    <div style={{ fontSize: "70px" }}>🤖</div>

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

                    <div>

                        <div className="message-name">

                            {msg.role === "user"
                                ? "You"
                                : "BEN AI"}

                        </div>

                        <div
                            className="bubble"
                            dangerouslySetInnerHTML={{
                                __html: msg.content
                                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                    .replace(/\n/g, "<br>")
                            }}
                        />

                    </div>

                </div>

            ))}

            {loading && (

                <div className="message ai-message">

                    <div className="avatar">
                        🤖
                    </div>

                    <div>

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