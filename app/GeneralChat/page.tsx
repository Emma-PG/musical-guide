"use client";
import connection from "@/Connection/SignalR";
import { useState, useEffect } from "react";

export default function GeneralChatPage() {
  const [user, setUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [text, setText] = useState("");
  const [messages, setMessages] = useState([{ usr: "", msg: "" }]);

  const [targetUser, setTargetUser] = useState(null);

  const sendMessage = async () => {
    if (text == "" || text.trim() == "") return;

    if (targetUser != null) {
      // if there's no target send message to GENERAL

      await connection.invoke("SendPrivate", targetUser, text);

      setText("");
      return;
    }

    await connection.invoke("SendMessage", text);
    setText("");
  };

  const Login = async () => {
    await connection.invoke("Register", user);
  };

  useEffect(() => {
    if (!connection) return;
    connection.start().then(() => {
      console.log("connected");
    });

    connection.on("ReceiveMessage", (user, message) => {
      setMessages((prev) => [...prev, { usr: user, msg: message }]);
    });

    connection.on("Users", (arrayOfUsers) => {
      setOnlineUsers(arrayOfUsers);
    });

    connection.on("ReceivePrivate", (fromUser, message) => {
      setMessages((prev) => [
        ...prev,
        { usr: fromUser, msg: `[private] ${message}` },
      ]);
    });

    return () => {
      connection.off("ReceivePrivate");
      connection.off("ReceiveMessage");
      connection.off("Users");
    };
  }, []);

  return (
    <div>
      <div id="main-box">
        <div>
          <label htmlFor="user">User: </label>
          <input
            type="text"
            id="user"
            onChange={(e) => {
              setUser(e.target.value);
            }}
          />
          <button id="log" onClick={Login}>
            Log in
          </button>
        </div>
        <div id="ChatContainer">
          <h2 onClick={() => setTargetUser(null)}>GeneralChat</h2>
          <div id="Messages">
            {messages.map((value, identifier) => {
              return (
                <b key={identifier}>
                  {value.usr == "" ? "" : `${value.usr}: ${value.msg}`}
                </b>
              );
            })}
          </div>
          <div id="ChatFooter">
            <input
              type="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
        <div id="OnlinePeople">
          <h4>Online People</h4>
          <ul>
            {[...new Set(onlineUsers)].map((value, identifier) => {
              return (
                <li
                  key={identifier}
                  onClick={() => value !== user && setTargetUser(value)}
                  style={{
                    fontWeight: targetUser === value ? "bold" : "normal",
                    cursor: value === user ? "not-allowed" : "pointer"
                  }}
                >
                  {value}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
