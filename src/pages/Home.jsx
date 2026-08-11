import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { askBENAI, uploadPDF } from "../services/api";

const DEFAULT_CHAT = {
    id: Date.now(),
    title: "New Chat",
    messages: []
};

function Home() {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [chats, setChats] = useState(() => {
        const saved = localStorage.getItem("benai_chats");

        return saved
            ? JSON.parse(saved)
            : [DEFAULT_CHAT];
    });

    const [activeChat, setActiveChat] = useState(() => {
        const saved =
            localStorage.getItem("benai_active_chat");

        return saved ? Number(saved) : 0;
    });

    const [loading, setLoading] = useState(false);

    const [pdfAttachment, setPdfAttachment] =
        useState(null);


    useEffect(() => {

        localStorage.setItem(
            "benai_chats",
            JSON.stringify(chats)
        );

    }, [chats]);


    useEffect(() => {

        localStorage.setItem(
            "benai_active_chat",
            activeChat
        );

    }, [activeChat]);


    useEffect(() => {

        if (
            activeChat >= chats.length &&
            chats.length > 0
        ) {

            setActiveChat(0);

        }

    }, [chats, activeChat]);


    const handleTranscription = (result) => {

    console.log(
        "TRANSCRIPTION RESULT RECEIVED:",
        result
    );

    const transcriptText =
        result.transcript ||
        result.text ||
        "";

    if (transcriptText.trim() === "") return;

    const chatIndex = activeChat;

    const currentChat = chats[chatIndex];

    if (currentChat === undefined) return;

    const transcriptionMessage = {
        role: "assistant",
        content: transcriptText,
        type: "transcription",
        language: result.language,
        segments: result.segments || []
    };

    const updatedChats = chats.map(
        (chat) => ({
            ...chat,
            messages: [...chat.messages]
        })
    );

    updatedChats[chatIndex] = {
        ...updatedChats[chatIndex],
        messages: [
            ...updatedChats[chatIndex].messages,
            transcriptionMessage
        ]
    };

    setChats(updatedChats);

};

const sendMessage = async (text) => {

        if (!text.trim()) return;

        const chatIndex = activeChat;

        const currentChat = chats[chatIndex];

        if (!currentChat) return;


        const userMessage = {
            role: "user",
            content: text
        };


        const title =
            currentChat.messages.length === 0
                ? text
                    .split(" ")
                    .slice(0, 5)
                    .join(" ")
                : currentChat.title;


        const updatedChats = chats.map(
            (chat) => ({
                ...chat,
                messages: [...chat.messages]
            })
        );


        updatedChats[chatIndex] = {

            ...updatedChats[chatIndex],

            title,

            messages: [
                ...updatedChats[chatIndex].messages,
                userMessage
            ]

        };


        setChats(updatedChats);

        setLoading(true);


        try {

            const answer = await askBENAI(
                text,
                updatedChats[chatIndex].messages
            );


            updatedChats[chatIndex] = {

                ...updatedChats[chatIndex],

                messages: [
                    ...updatedChats[chatIndex].messages,

                    {
                        role: "assistant",
                        content: answer
                    }

                ]

            };


            setChats([...updatedChats]);


        } catch (error) {

            console.error(error);


            updatedChats[chatIndex] = {

                ...updatedChats[chatIndex],

                messages: [
                    ...updatedChats[chatIndex].messages,

                    {
                        role: "assistant",
                        content:
                            "BEN AI couldn't respond. Please try again."
                    }

                ]

            };


            setChats([...updatedChats]);


        } finally {

            setLoading(false);

        }

    };


    const handleUploadPDF = async (file) => {

        if (!file) return;


        setPdfAttachment({

            name: file.name,

            status: "uploading"

        });


        try {

            await uploadPDF(file);


            setPdfAttachment({

                name: file.name,

                status: "success"

            });


        } catch (error) {

            console.error(error);


            setPdfAttachment({

                name: file.name,

                status: "error"

            });

        }

    };


    const removePDF = () => {

        setPdfAttachment(null);

    };


    const newChat = () => {

        const chat = {

            id: Date.now(),

            title: "New Chat",

            messages: []

        };


        setChats((previousChats) => {

            const updated = [
                ...previousChats,
                chat
            ];


            setActiveChat(
                updated.length - 1
            );


            return updated;

        });


        setPdfAttachment(null);

        setSidebarOpen(false);

    };


    const openChat = (index) => {

        setActiveChat(index);

        setPdfAttachment(null);

        setSidebarOpen(false);

    };


    const currentChat = chats[activeChat];


    return (

        <div className="app">

            {sidebarOpen && (

                <div
                    className="sidebar-overlay"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />

            )}


            <Sidebar
                chats={chats}
                activeChat={activeChat}
                openChat={openChat}
                newChat={newChat}
                setChats={setChats}
                isOpen={sidebarOpen}
            />


            <main className="chat-area">


                <header className="chat-header">

                    <button
                        className="menu-button"
                        onClick={() =>
                            setSidebarOpen(
                                (previous) =>
                                    !previous
                            )
                        }
                        aria-label="Open dashboard"
                        title="Dashboard"
                    >
                        ☰
                    </button>


                    <div className="chat-header-title">

                        <span className="header-logo">
                            🤖
                        </span>

                        <span>
                            BEN AI
                        </span>

                    </div>

                </header>


                <ChatWindow
                    messages={
                        currentChat
                            ? currentChat.messages
                            : []
                    }
                    loading={loading}
                />


                <ChatInput
                    onSend={sendMessage}
                    onUpload={handleUploadPDF}
                    onTranscription={handleTranscription}
                    pdfAttachment={pdfAttachment}
                    onRemovePDF={removePDF}
                />


            </main>

        </div>

    );

}

export default Home;
