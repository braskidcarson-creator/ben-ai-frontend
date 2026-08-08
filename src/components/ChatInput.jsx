import { useState } from "react";


function ChatInput({ onSend }) {


    const [text, setText] = useState("");



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



    return (

        <div className="chat-input">


            <textarea

                value={text}

                onChange={(e)=>setText(e.target.value)}

                onKeyDown={handleKeyDown}

                placeholder="Ask BEN AI anything..."

            />


            <button onClick={send}>

                Send

            </button>


        </div>

    );

}


export default ChatInput;