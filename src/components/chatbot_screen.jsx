import React, { useEffect, useRef, useState } from "react";
import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";
import api from "./../services/services";
import { ClipLoader } from "react-spinners";
import { useThemeContext } from "../themeContext";
import { TbMessageChatbot } from "react-icons/tb";
import { IoResizeOutline } from "react-icons/io5";
import ReactMarkdown from "react-markdown";

function ChatbotComponent() {
  const [isChatboxOpen, setIsChatboxOpen] = useState(false);
  const [isResized, setIsResized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatboxRef = useRef(null);
  const { colors } = useThemeContext();

  const handleToggleChatbox = () => {
    setIsChatboxOpen((prev) => !prev);
  };

  const handleResizeChatbox = () => {
    setIsResized((prev) => !prev);
  };

  const callchatbot = async () => {
    try {
      if (userInput.trim() == "") return;
      console.log(`this is the user input ${userInput}`)
      setLoading(true);
      const newMessages = [...messages, { text: userInput, sender: "user" }];
      setMessages(newMessages);
      setUserInput("");
      var session_id = sessionStorage.getItem("session_id_orgchart");
      console.log('api call starting')
      console.log(`this is the session id : ${session_id}`)
      if(session_id == null){session_id = ""}
      const response = await api.chatbotApiCall(userInput, session_id);
      console.log('api call ending')
      const message = response["response"];
      if (sessionStorage.key("session_id_orgchart") == null) {
        sessionStorage.setItem("session_id_orgchart", response["session_id"]);
      }
      if (message.trim() == "") return;
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: message, sender: "bot" },
        ]);
      }, 500);
      setLoading(false);
    } catch (e) {
      console.log(`Error fetching chat message data : ${e.message}`);
      setLoading(false);
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div>
      {/* Open Button */}
      <div className="fixed bottom-0 right-0 mb-8 mr-8 z-50">
        <span className="absolute flex size-3 right-[-5px] top-[-5px]">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex size-3 rounded-full bg-[#3DD37B]"></span>
        </span>
        <button
          onClick={handleToggleChatbox}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 flex items-center hover:cursor-pointer"
        >
          Chat with AI
        </button>
      </div>

      {/* Chatbox */}
      {isChatboxOpen && (
        <div
          id="chat-container"
          className={`fixed bottom-20 right-8 w-96 z-50 shadow-2xl`}
        >
          <div className="bg-white shadow-md rounded-lg max-w-lg w-full">
            {/* Header */}
            <div className="p-4 border-b bg-blue-500 text-white rounded-t-lg flex justify-between items-center">
              <div className="flex items-center">
                <span className="flex size-3">
                  <span className="inline-flex size-3 rounded-full bg-[#3DD37B]"></span>
                </span>
                <p className="text-lg font-semibold ml-2">Ai Chat</p>
              </div>
              {/* <button
                onClick={handleResizeChatbox}
                className="text-white hover:text-gray-400 focus:outline-none hover:cursor-pointer"
              >
                <IoResizeOutline />
              </button> */}
              <button
                onClick={handleToggleChatbox}
                className="text-white hover:text-gray-400 focus:outline-none hover:cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div
              id="chatbox"
              ref={chatboxRef}
              className="p-4 h-96 overflow-y-auto max-w-full"
            >
              {/* Welcome message */}
              {messages.length == 0 && (
                <div className="w-full flex justify-center items-center h-45">
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-blue-50 flex justify-center items-center mb-2">
                      <TbMessageChatbot className="text-7xl text-blue-400 opacity-90" />
                    </div>
                    <p className="text-md font-semibold text-center text-blue-500">
                      Hi! Ask me question...
                    </p>
                  </div>
                </div>
              )}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    msg.sender === "user" ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`${
                      msg.sender === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    } rounded-lg py-2 px-4 inline-block`}
                  >
                    {/* {msg.text} */}
                    <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#cccccc] flex">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyUp={handleKeyUp}
                placeholder="Type a message"
                className="w-full px-3 py-3 rounded-l-md focus:outline-none appearance-none bg-gray-100 text-gray-700"
              />

              <button
                onClick={callchatbot}
                className="bg-blue-500 w-24 flex items-center justify-center text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition duration-300 hover:cursor-pointer"
              >
                {loading ? (
                  <ClipLoader
                    color="text-white"
                    loading={loading}
                    size={25}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatbotComponent;
