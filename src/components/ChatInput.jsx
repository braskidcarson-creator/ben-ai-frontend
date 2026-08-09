import { useRef, useState } from "react";
import {
    FiPaperclip,
    FiMic,
    FiSend,
    FiSquare,
    FiCheck,
    FiX
} from "react-icons/fi";

function ChatInput({
    onSend,
    onUpload,
    pdfAttachment,
    onRemovePDF
}) {
    const [text, setText] = useState("");
    const [listening, setListening] = useState(false);

    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);

    const send = () => {
        if (!text.trim()) return;

        onSend(text);
        setText("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (file.type !== "application/pdf") {
            alert("Please select a PDF file.");
            e.target.value = "";
            return;
        }

        if (onUpload) {
            onUpload(file);
        }

        e.target.value = "";
    };

    const toggleVoice = () => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert(
                "Voice input is not supported by this browser."
            );
            return;
        }

        if (listening) {
            recognitionRef.current?.stop();
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setListening(true);
        };

        recognition.onresult = (event) => {
            let transcript = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {
                transcript +=
                    event.results[i][0].transcript;
            }

            setText(transcript);
        };

        recognition.onerror = (event) => {
            console.error(
                "Speech recognition error:",
                event.error
            );

            setListening(false);
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognitionRef.current = recognition;

        recognition.start();
    };

    return (
        <div className="chat-input-wrapper">

            {pdfAttachment && (
                <div className="pdf-attachment">

                    <div className="pdf-attachment-info">

                        <FiPaperclip />

                        <span>
                            {pdfAttachment.name}
                        </span>

                        {pdfAttachment.status === "success" && (
                            <FiCheck
                                className="pdf-success"
                                title="PDF ready"
                            />
                        )}

                        {pdfAttachment.status === "uploading" && (
                            <span className="pdf-uploading">
                                ...
                            </span>
                        )}

                    </div>

                    <button
                        type="button"
                        className="pdf-remove"
                        onClick={onRemovePDF}
                        title="Remove PDF"
                        aria-label="Remove PDF"
                    >
                        <FiX />
                    </button>

                </div>
            )}

            <div className="chat-input">

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    hidden
                    onChange={handleFileChange}
                />

                <button
                    type="button"
                    className="input-icon-button"
                    onClick={() =>
                        fileInputRef.current?.click()
                    }
                    title="Upload PDF"
                    aria-label="Upload PDF"
                >
                    <FiPaperclip />
                </button>

                <textarea
                    value={text}
                    onChange={(e) =>
                        setText(e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Ask BEN AI anything..."
                    rows={1}
                />

                <button
                    type="button"
                    className={
                        listening
                            ? "input-icon-button listening"
                            : "input-icon-button"
                    }
                    onClick={toggleVoice}
                    title={
                        listening
                            ? "Stop listening"
                            : "Voice input"
                    }
                    aria-label={
                        listening
                            ? "Stop listening"
                            : "Voice input"
                    }
                >
                    {listening ? (
                        <FiSquare />
                    ) : (
                        <FiMic />
                    )}
                </button>

                <button
                    type="button"
                    className="send-button"
                    onClick={send}
                    disabled={!text.trim()}
                    title="Send message"
                    aria-label="Send message"
                >
                    <FiSend />
                </button>

            </div>

        </div>
    );
}

export default ChatInput;
