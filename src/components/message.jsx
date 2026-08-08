function Message({ role, content }) {


    return (

        <div 
            className={
                role === "user"
                ? "message user-message"
                : "message ai-message"
            }
        >


            <div className="avatar">

                {
                    role === "user"
                    ? "🧑"
                    : "🤖"
                }

            </div>



            <div className="message-content">


                <div className="message-name">

                    {
                        role === "user"
                        ? "You"
                        : "BEN AI"
                    }

                </div>



                <div className="bubble">

                    {content}

                </div>


            </div>


        </div>

    );

}


export default Message;