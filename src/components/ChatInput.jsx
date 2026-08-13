import { useRef, useState } from "react";

import {
    FiPaperclip,
    FiMic,
    FiSend,
    FiSquare,
    FiCheck,
    FiX,
    FiUpload
} from "react-icons/fi";

import {
    transcribeAudio,
    transcribeUrl
} from "../services/api";

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

    const [fileTranscribing, setFileTranscribing] =
        useState(false);

    const [recordingSeconds, setRecordingSeconds] =
        useState(0);

    const recordingTimerRef = useRef(null);

    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);


    /* =========================
       URL TRANSCRIPTION
    ========================= */

    const handleUrlTranscription = async () => {

        const url = mediaUrl.trim();

        if (!url) return;

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


    /* =========================
       NORMAL CHAT MESSAGE
    ========================= */

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


    /* =========================
       FILE UPLOAD
       PDF + AUDIO + VIDEO
    ========================= */

    const handleFileChange = async (e) => {

        const file =
            e.target.files?.[0];

        if (!file) return;

        const name =
            file.name.toLowerCase();

        const isPDF =
            file.type === "application/pdf" ||
            name.endsWith(".pdf");

        const mediaExtensions = [
            ".mp3",
            ".wav",
            ".m4a",
            ".webm",
            ".ogg",
            ".flac",
            ".mp4",
            ".mov",
            ".avi",
            ".mkv"
        ];

        const isMedia =
            file.type.startsWith("audio/") ||
            file.type.startsWith("video/") ||
            mediaExtensions.some(
                (extension) =>
                    name.endsWith(extension)
            );


        /* =========================
           PDF
        ========================= */

        if (isPDF) {

            if (onUpload) {
                onUpload(file);
            }

            e.target.value = "";

            return;

        }


        /* =========================
           AUDIO / VIDEO
        ========================= */

        if (isMedia) {

            setFileTranscribing(true);

            try {

                console.log(
                    "MEDIA FILE SELECTED:",
                    file.name
                );

                console.log(
                    "MEDIA TYPE:",
                    file.type
                );

                console.log(
                    "MEDIA SIZE:",
                    file.size
                );

                const result =
                    await transcribeAudio(file);

                console.log(
                    "MEDIA TRANSCRIPTION RESULT:",
                    result
                );

                if (onTranscription) {
                    onTranscription(result);
                }

            } catch (error) {

                console.error(
                    "FILE TRANSCRIPTION ERROR:",
                    error
                );

                alert(
                    error.message ||
                    "Audio/video transcription failed."
                );

            } finally {

                setFileTranscribing(false);

            }

            e.target.value = "";

            return;

        }


        alert(
            "Please select a PDF, audio, or video file."
        );

        e.target.value = "";

    };


    /* =========================
       MICROPHONE
    ========================= */

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

                recordingTimerRef.current =
                    setInterval(() => {

                        setRecordingSeconds(
                            (seconds) =>
                                seconds + 1
                        );

                    }, 1000);

            };


            recorder.onstop = async () => {

                setListening(false);
                setTranscribing(true);

                if (
                    recordingTimerRef.current
                ) {

                    clearInterval(
                        recordingTimerRef.current
                    );

                    recordingTimerRef.current =
                        null;

                }

                stream
                    .getTracks()
                    .forEach(
                        (track) =>
                            track.stop()
                    );

                recognitionRef.current =
                    null;


                const audioBlob =
                    new Blob(
                        chunks,
                        {
                            type:
                                recorder.mimeType
                        }
                    );


                if (
                    audioBlob.size === 0
                ) {

                    setTranscribing(false);

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

                    const result =
                        await transcribeAudio(
                            audioFile
                        );

                    if (onTranscription) {
                        onTranscription(result);
                    }

                } catch (error) {

                    console.error(
                        "VOICE TRANSCRIPTION ERROR:",
                        error
                    );

                    alert(
                        error.message ||
                        "Voice transcription failed."
                    );

                } finally {

                    setTranscribing(false);

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
                setTranscribing(false);

                stream
                    .getTracks()
                    .forEach(
                        (track) =>
                            track.stop()
                    );

                recognitionRef.current =
                    null;

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


    /* =========================
       TIME FORMAT
    ========================= */

    const formatTime = (seconds) => {

        const minutes =
            Math.floor(seconds / 60);

        const remaining =
            seconds % 60;

        return (
            String(minutes).padStart(2, "0") +
            ":" +
            String(remaining).padStart(2, "0")
        );

    };


    /* =========================
       UI
    ========================= */

    return (

        <div className="chat-input-wrapper">


            {/* PDF ATTACHMENT */}

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
                            >
                                <FiX />
                            </button>

                        )}

                    </div>

                </div>

            )}


            {/* MAIN INPUT */}

            <div className="chat-input">


                {/* FILE PICKER */}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.mp3,.wav,.m4a,.webm,.ogg,.flac,.mp4,.mov,.avi,.mkv,audio/*,video/*"
                    hidden
                    onChange={handleFileChange}
                />


                {/* MEDIA UPLOAD */}

                <button
                    type="button"
                    className="input-icon-button media-upload-button"
                    onClick={() =>
                        fileInputRef.current?.click()
                    }
                    title="Upload PDF, audio or video"
                    aria-label="Upload PDF, audio or video"
                >
                    <FiUpload />
                </button>


                {/* URL TRANSCRIPTION */}

                <div className="media-url-box">

                    <input
                        type="text"
                        value={mediaUrl}
                        onChange={(e) =>
                            setMediaUrl(e.target.value)
                        }
                        onKeyDown={(e) => {

                            if (
                                e.key === "Enter" &&
                                mediaUrl.trim()
                            ) {

                                e.preventDefault();

                                handleUrlTranscription();

                            }

                        }}
                        placeholder="Paste audio/video link..."
                        disabled={
                            urlTranscribing ||
                            fileTranscribing
                        }
                    />

                    <button
                        type="button"
                        className="url-transcribe-button"
                        onClick={handleUrlTranscription}
                        disabled={
                            urlTranscribing ||
                            !mediaUrl.trim()
                        }
                        title="Transcribe media link"
                    >

                        {urlTranscribing
                            ? "..."
                            : "Transcribe"}

                    </button>

                </div>


                {/* TEXT INPUT */}

                <textarea
                    value={text}
                    onChange={(e) =>
                        setText(e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Ask BEN AI..."
                    rows={1}
                />


                {/* MICROPHONE */}

                <button
                    type="button"
                    className={
                        "input-icon-button " +
                        (listening
                            ? "recording-button"
                            : "")
                    }
                    onClick={toggleVoice}
                    disabled={
                        transcribing ||
                        fileTranscribing ||
                        urlTranscribing
                    }
                    title={
                        listening
                            ? "Stop recording"
                            : "Record voice"
                    }
                    aria-label={
                        listening
                            ? "Stop recording"
                            : "Record voice"
                    }
                >

                    {listening
                        ? <FiSquare />
                        : <FiMic />}

                </button>


                {/* RECORDING STATUS */}

                {listening && (

                    <span className="recording-time">
                        {formatTime(recordingSeconds)}
                    </span>

                )}


                {/* TRANSCRIPTION STATUS */}

                {(
                    fileTranscribing ||
                    transcribing
                ) && (

                    <span className="transcribing-status">
                        Transcribing...
                    </span>

                )}


                {/* SEND */}

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