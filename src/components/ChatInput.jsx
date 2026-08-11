import { useRef, useState } from "react";

import {
    FiPaperclip,
    FiMic,
    FiSend,
    FiSquare,
    FiCheck,
    FiX
} from "react-icons/fi";

import { transcribeAudio, transcribeUrl } from "../services/api";

function ChatInput({
    onSend,
    onUpload,
    onTranscription,
    pdfAttachment,
    onRemovePDF
}) {

    const [text, setText] = useState("");
    const [listening, setListening] = useState(false);
    const [transcribing, setTranscribing] = useState(false);
    const [mediaUrl, setMediaUrl] = useState("");
    const [urlTranscribing, setUrlTranscribing] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const recordingTimerRef = useRef(null);

    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);

    const handleUrlTranscription = async () => {

        const url = mediaUrl.trim();

        if (url === "") return;

        setUrlTranscribing(true);

        try {

            console.log(
                "STARTING URL TRANSCRIPTION:",
                url
            );

            const result =
                await transcribeUrl(url);

            console.log(
                "URL TRANSCRIPTION RESULT:",
                result
            );

            if (onTranscription) {
                onTranscription(result);
            }

            setMediaUrl("");

        } catch (error) {

            console.error(
                "URL TRANSCRIPTION ERROR:",
                error
            );

            alert(
                error.message ||
                "URL transcription failed."
            );

        } finally {

            setUrlTranscribing(false);

        }

    };

    const send = () => {

        if (!text.trim()) return;

        onSend(text);

        setText("");

    };

    const handleKeyDown = (e) => {

        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {

            e.preventDefault();

            send();

        }

    };

    const handleFileChange = (e) => {

        const file =
            e.target.files?.[0];

        if (!file) return;

        if (
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {

            alert("Please select a PDF file.");

            e.target.value = "";

            return;

        }

        if (onUpload) {

            onUpload(file);

        }

        e.target.value = "";

    };

    const toggleVoice = async () => {

        const current =
            recognitionRef.current;

        if (
            current?.recorder?.state ===
            "recording"
        ) {

            console.log(
                "STOP REQUESTED"
            );

            current.recorder.stop();

            return;

        }

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            alert(
                "Audio recording is not supported by this browser."
            );

            return;

        }

        try {

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                });

            const chunks = [];

            const recorder =
                new MediaRecorder(stream);

            recognitionRef.current = {
                recorder,
                stream
            };

            recorder.ondataavailable = (
                event
            ) => {

                if (event.data.size > 0) {

                    chunks.push(
                        event.data
                    );

                }

            };

            recorder.onstart = () => {

                setListening(true);
                setTranscribing(false);
                setRecordingSeconds(0);

                recordingTimerRef.current = setInterval(() => {
                    setRecordingSeconds((seconds) => seconds + 1);
                }, 1000);

                console.log(
                    "RECORDING STARTED"
                );

            };

            recorder.onstop = async () => {

                setListening(false);
                setTranscribing(true);

                if (recordingTimerRef.current) {
                    clearInterval(recordingTimerRef.current);
                    recordingTimerRef.current = null;
                }

                console.log(
                    "RECORDING STOPPED"
                );

                stream
                    .getTracks()
                    .forEach(
                        (track) =>
                            track.stop()
                    );

                recognitionRef.current = null;

                const audioBlob =
                    new Blob(
                        chunks,
                        {
                            type:
                                recorder.mimeType
                        }
                    );

                console.log(
                    "AUDIO SIZE:",
                    audioBlob.size
                );

                console.log(
                    "AUDIO TYPE:",
                    recorder.mimeType
                );

                if (
                    audioBlob.size === 0
                ) {

                    alert(
                        "No audio was recorded. Please try again."
                    );

                    return;

                }

                const extension =
                    recorder.mimeType.includes(
                        "webm"
                    )
                        ? "webm"
                        : "wav";

                const audioFile =
                    new File(
                        [audioBlob],
                        "voice-" +
                            Date.now() +
                            "." +
                            extension,
                        {
                            type:
                                recorder.mimeType
                        }
                    );

                try {

                    console.log(
                        "SENDING AUDIO:",
                        audioFile.name,
                        audioFile.size,
                        audioFile.type
                    );

                    const result =
                        await transcribeAudio(
                            audioFile
                        );

                    if (onTranscription) {
                        onTranscription(result);
                    }

                    setTranscribing(false);

                } catch (error) {

                    console.error(
                        "VOICE TRANSCRIPTION ERROR:",
                        error
                    );

                    setTranscribing(false);

                    alert(
                        error.message ||
                        "Voice transcription failed."
                    );

                }

            };

            recorder.onerror = (
                event
            ) => {

                console.error(
                    "RECORDING ERROR:",
                    event
                );

                setListening(false);

                stream
                    .getTracks()
                    .forEach(
                        (track) =>
                            track.stop()
                    );

                recognitionRef.current = null;

            };

            recorder.start();

        } catch (error) {

            console.error(
                "MICROPHONE ERROR:",
                error
            );

            setListening(false);

            if (
                error.name ===
                "NotAllowedError"
            ) {

                alert(
                    "Microphone permission was denied. Please allow microphone access."
                );

            } else {

                alert(
                    "Could not access the microphone."
                );

            }

        }

    };

    return (

        <div className="chat-input-wrapper">

            {pdfAttachment && (

                <div className="pdf-attachment">

                    <div className="pdf-attachment-icon">
                        <FiPaperclip />
                    </div>

                    <div className="pdf-attachment-info">

                        <span className="pdf-attachment-name">
                            {pdfAttachment.name}
                        </span>

                        <span className="pdf-attachment-status">

                            {pdfAttachment.status ===
                                "uploading" &&
                                "Uploading..."}

                            {pdfAttachment.status ===
                                "success" &&
                                "PDF ready"}

                            {pdfAttachment.status ===
                                "error" &&
                                "Upload failed"}

                        </span>

                    </div>

                    <div className="pdf-attachment-action">

                        {pdfAttachment.status ===
                            "uploading" && (

                            <span className="pdf-upload-spinner">
                                ...
                            </span>

                        )}

                        {pdfAttachment.status ===
                            "success" && (

                            <span
                                className="pdf-upload-success"
                                title="PDF uploaded successfully"
                            >
                                <FiCheck />
                            </span>

                        )}

                        {pdfAttachment.status ===
                            "error" && (

                            <button
                                type="button"
                                className="pdf-upload-error"
                                onClick={onRemovePDF}
                                title="Remove failed PDF"
                                aria-label="Remove failed PDF"
                            >
                                <FiX />
                            </button>

                        )}

                        {pdfAttachment.status ===
                            "success" && (

                            <button
                                type="button"
                                className="pdf-remove-button"
                                onClick={onRemovePDF}
                                title="Remove PDF"
                                aria-label="Remove PDF"
                            >
                                <FiX />
                            </button>

                        )}

                    </div>

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

                <div className="media-url-box">
                <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="Paste video or audio link..."
                    className="media-url-input"
                />

                <button
                    type="button"
                    className="media-url-button"
                    onClick={handleUrlTranscription}
                    disabled={mediaUrl.trim() === "" || urlTranscribing}
                >
                    {urlTranscribing ? "Transcribing..." : "Transcribe Link"}
                </button>
            </div>

            <textarea
                    value={text}
                    onChange={(e) =>
                        setText(e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Ask BEN AI anything..."
                    rows={1}
                />

                {(listening || transcribing) && (
                <div className="voice-status">
                    {listening ? (
                        <>
                            <span className="voice-dot"></span>
                            Recording {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, "0")}
                        </>
                    ) : (
                        <>
                            <span className="voice-spinner"></span>
                            Transcribing...
                        </>
                    )}
                </div>
            )}

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
                            ? "Stop recording"
                            : "Voice input"
                    }
                    aria-label={
                        listening
                            ? "Stop recording"
                            : "Voice input"
                    }
                >

                    {listening
                        ? <FiSquare />
                        : <FiMic />
                    }

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
