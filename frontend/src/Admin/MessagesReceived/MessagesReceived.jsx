import { Header1 } from "../Admin";
import axios from "axios";
import { useState, useEffect } from "react";
import "./MessagesReceived.css";

export default function MessagesReceived() {
  const SERVER_URL = process.env.REACT_APP_DEPLOYED_SERVER_URL;

  const [messages, setMessages] = useState([]);
  const [expandedMessages, setExpandedMessages] = useState({});

  const fetchContacts = () => {
    axios
      .get(`${SERVER_URL}/getContacts`)
      .then((res) => {
        setMessages(res.data);
        fetchContacts();
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });
  };

  const toggleMessage = (index) => {
    setExpandedMessages((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleDeleteAllMessages = async () => {
    try {
      await axios.delete(`${SERVER_URL}/deleteAllMessages`);
      fetchContacts();
    } catch (error) {
      console.error("Error deleting all messages:", error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`${SERVER_URL}/deleteMessage/${messageId}`);
      fetchContacts();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <>
      <Header1 />
      {/*<select name="" id="">
          <option value="Old to New">Newest First</option>
          <option value="New to Old">Oldest First</option>
          </select>*/}
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
              <th>
                <span
                  onClick={handleDeleteAllMessages}
                  id="allMessagesDeleteBtn"
                >
                  Delete All
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{message.fName}</td>
                <td>{message.lName}</td>
                <td>
                  <a href={`mailto:${message.email}`}>{message.email}</a>
                </td>
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
                <td>
                  <button onClick={() => handleDeleteMessage(message._id)}>
                    <img
                      src="https://cdn.iconscout.com/icon/free/png-256/free-delete-32-83555.png"
                      alt=""
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
