import { useRef, useState } from "react";

function Sidebar({
    chats,
    activeChat,
    openChat,
    newChat,
    setChats,
    isOpen
}) {

    const historyRef = useRef(null);

    const [search, setSearch] = useState("");
    const [menuChat, setMenuChat] = useState(null);

    // ==========================
    // Rename Chat
    // ==========================

    const renameChat = (id) => {

        const newName = prompt("Enter new chat name:");

        if (!newName || !newName.trim()) return;

        setChats(prev =>
            prev.map(chat =>
                chat.id === id
                    ? {
                        ...chat,
                        title: newName.trim()
                    }
                    : chat
            )
        );

        setMenuChat(null);

    };

    // ==========================
    // Delete Chat
    // ==========================

    const deleteChat = (id) => {

        const confirmed = confirm("Delete this chat?");

        if (!confirmed) return;

        setChats(prev => {

            const updated = prev.filter(
                chat => chat.id !== id
            );

            // Never leave BEN AI without a chat
            if (updated.length === 0) {

                return [
                    {
                        id: Date.now(),
                        title: "New Chat",
                        messages: []
                    }
                ];

            }

            return updated;

        });

        setMenuChat(null);

    };

    // ==========================
    // Scroll
    // ==========================

    const scrollUp = () => {

        historyRef.current?.scrollBy({

            top: -250,
            behavior: "smooth"

        });

    };

    const scrollDown = () => {

        historyRef.current?.scrollBy({

            top: 250,
            behavior: "smooth"

        });

    };

    // ==========================
    // Search
    // ==========================

    const filteredChats = chats.filter(chat =>
        chat.title
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (

        <aside
            className={`sidebar ${
                isOpen ? "open" : ""
            }`}
        >

            <h2>
                🤖 BEN AI
            </h2>

            <button
                className="new-chat"
                onClick={newChat}
            >
                💬 New Chat
            </button>

            <input
                type="text"
                className="search-chat"
                placeholder="🔍 Search chats..."
                value={search}
                onChange={(e) =>
                    setSearch(e.target.value)
                }
            />

            <div
                className="history"
                ref={historyRef}
            >

                {filteredChats.length === 0 ? (

                    <div
                        style={{
                            textAlign: "center",
                            color: "#888",
                            marginTop: "20px"
                        }}
                    >
                        No chats found.
                    </div>

                ) : (

                    filteredChats.map((chat) => {

                        const realIndex = chats.findIndex(
                            c => c.id === chat.id
                        );

                        return (

                            <div
                                key={chat.id}
                                className={`chat-item ${
                                    activeChat === realIndex
                                        ? "active-chat"
                                        : ""
                                }`}
                                onClick={() =>
                                    openChat(realIndex)
                                }
                            >

                                <span className="chat-title">
                                    {chat.title}
                                </span>

                                <button
                                    className="chat-menu"
                                    onClick={(e) => {

                                        e.stopPropagation();

                                        if (
                                            menuChat === chat.id
                                        ) {

                                            setMenuChat(null);

                                        } else {

                                            setMenuChat(
                                                chat.id
                                            );

                                        }

                                    }}
                                >
                                    ⋮
                                </button>

                                {menuChat === chat.id && (

                                    <div className="chat-popup">

                                        <div
                                            className="popup-item"
                                            onClick={(e) => {

                                                e.stopPropagation();

                                                renameChat(
                                                    chat.id
                                                );

                                            }}
                                        >
                                            ✏️ Rename
                                        </div>

                                        <div
                                            className="popup-item"
                                            onClick={(e) => {

                                                e.stopPropagation();

                                                setMenuChat(null);

                                            }}
                                        >
                                            📌 Pin
                                        </div>

                                        <div
                                            className="popup-item delete"
                                            onClick={(e) => {

                                                e.stopPropagation();

                                                deleteChat(
                                                    chat.id
                                                );

                                            }}
                                        >
                                            🗑 Delete
                                        </div>

                                    </div>

                                )}

                            </div>

                        );

                    })

                )}

            </div>

            <div className="scroll-buttons">

                <button onClick={scrollUp}>
                    ▲
                </button>

                <button onClick={scrollDown}>
                    ▼
                </button>

            </div>

        </aside>

    );

}

export default Sidebar;