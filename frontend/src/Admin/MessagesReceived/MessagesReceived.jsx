import { Header1 } from "../Admin";
import axios from "axios";
import { useState, useEffect } from "react";
import "./MessagesReceived.css";

export default function MessagesReceived() {
  const SERVER_URL = "https://deep-kirana-server.vercel.app";

  const [messages, setMessages] = useState([]);
  const [expandedMessages, setExpandedMessages] = useState({});

  useEffect(() => {
    axios
      .get(`${SERVER_URL}/getContacts`)
      .then((res) => {
        setMessages(res.data);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });
  }, []);

  const toggleMessage = (index) => {
    setExpandedMessages((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  return (
    <>
      <Header1 />
      <div className="received">
        <table>
          <thead>
            <tr>
              <th>S. No.</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{message.fName}</td>
                <td>{message.lName}</td>
                <td>{message.email}</td>
                <td>{message.phone}</td>
                <td>
                  {expandedMessages[index] ? (
                    <span
                      className="message-toggle"
                      onClick={() => toggleMessage(index)}
                    >
                      Hide Message
                    </span>
                  ) : (
                    <span
                      className="message-toggle"
                      onClick={() => toggleMessage(index)}
                    >
                      See Message
                    </span>
                  )}
                  {expandedMessages[index] && <div>{message.message}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
