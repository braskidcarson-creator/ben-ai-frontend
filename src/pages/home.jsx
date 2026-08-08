import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { askBENAI } from "../services/api";

const DEFAULT_CHAT = {
    id: Date.now(),
    title: "New Chat",
    messages: []
};

function Home() {

    const [chats, setChats] = useState(() => {

        const saved = localStorage.getItem("benai_chats");

        return saved
            ? JSON.parse(saved)
            : [DEFAULT_CHAT];

    });

    const [activeChat, setActiveChat] = useState(() => {

        const saved = localStorage.getItem("benai_active_chat");

        return saved
            ? Number(saved)
            : 0;

    });

    const [loading, setLoading] = useState(false);

    // ----------------------------
    // Save chats automatically
    // ----------------------------

    useEffect(() => {

        localStorage.setItem(
            "benai_chats",
            JSON.stringify(chats)
        );

    }, [chats]);

    // ----------------------------
    // Save active chat
    // ----------------------------

    useEffect(() => {

        localStorage.setItem(
            "benai_active_chat",
            activeChat
        );

    }, [activeChat]);

    // ----------------------------
    // Safety
    // ----------------------------

    useEffect(() => {

        if (activeChat >= chats.length) {

            setActiveChat(0);

        }

    }, [chats, activeChat]);

    // ----------------------------
    // Send Message
    // ----------------------------

    const sendMessage = async (text) => {

        if (!text.trim()) return;

        const chatIndex = activeChat;

        const currentChat = chats[chatIndex];

        const userMessage = {

            role: "user",

            content: text

        };

        const title =

            currentChat.messages.length === 0

                ? text.split(" ").slice(0, 4).join(" ")

                : currentChat.title;

        const updatedChats = chats.map(chat => ({

            ...chat,

            messages: [...chat.messages]

        }));

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

        }

        catch {

            updatedChats[chatIndex] = {

                ...updatedChats[chatIndex],

                messages: [

                    ...updatedChats[chatIndex].messages,

                    {

                        role: "assistant",

                        content: "⚠️ BEN AI couldn't respond."

                    }

                ]

            };

            setChats([...updatedChats]);

        }

        finally {

            setLoading(false);

        }

    };

    // ----------------------------
    // New Chat
    // ----------------------------

    const newChat = () => {

        const chat = {

            id: Date.now(),

            title: "New Chat",

            messages: []

        };

        setChats(prev => {

            const updated = [...prev, chat];

            setActiveChat(updated.length - 1);

            return updated;

        });

    };

    return (

        <div className="app">

            <Sidebar
                chats={chats}
                activeChat={activeChat}
                openChat={setActiveChat}
                newChat={newChat}
                setChats={setChats}
            
            />

            <main className="chat-area">

                <ChatWindow

                    messages={

                        chats[activeChat]

                            ? chats[activeChat].messages

                            : []

                    }

                    loading={loading}

                />

                <ChatInput

                    onSend={sendMessage}

                />

            </main>

        </div>

    );

}

export default Home;