import { useState, useEffect } from "react";

import chatgptlogo from "./static/chatgpt.png";
import userlogo from "./static/user.png";

const App = () => {
  const [inputval, setInputval] = useState("");
  const [message, setMessage] = useState(null);
  const [prevChats, setPrevChats] = useState([]);
  const [curTitle, setCurTitle] = useState(null);
  const [selectedTitleStatus, setSelectedTitleStatus] = useState({});

  const createNewChat = () => {
    setCurTitle(null);
    setInputval("");
    setMessage(null);
    setSelectedTitleStatus({});
  };

  const selectedTitles = Object.keys(selectedTitleStatus).filter(
    (key) => selectedTitleStatus[key] === true
  );

  const leftPrevChats = prevChats.filter(
    (prevchat) => !selectedTitles.includes(prevchat.title)
  );

  let copy = Object.assign({}, selectedTitleStatus);
  selectedTitles.forEach((item) => delete copy[item]);

  const deleteChat = () => {
    setCurTitle(null);
    setInputval("");
    setMessage(null);
    setPrevChats(leftPrevChats);
    setSelectedTitleStatus(copy);
  };

  const getMessages = async () => {
    const options = {
      method: "POST",
      body: JSON.stringify({
        message: inputval,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const response = await fetch(
        "http://localhost:8000/completions",
        options
      );
      const data = await response.json();
      setMessage(data.choices[0].message); //here message includes two parts: role and content
    } catch (err) {
      console.error(err);
    }
    // setInputval("");
  };

  const handleClick = (uniquetitle) => {
    // console.log(uniquetitle);
    setCurTitle(uniquetitle);
    setInputval("");
    setMessage(null);

    let updatedValue = {};

    if (selectedTitleStatus.hasOwnProperty(uniquetitle)) {
      updatedValue[uniquetitle] = !selectedTitleStatus[uniquetitle];
    } else {
      updatedValue[uniquetitle] = true;
    }

    setSelectedTitleStatus((selectedTitleStatus) => ({
      ...selectedTitleStatus,
      ...updatedValue,
    }));
  };

  const curChats = prevChats.filter((prevchat) => prevchat.title === curTitle);
  const uniqueTitles = Array.from(
    new Set(prevChats.map((prevchat) => prevchat.title))
  );

  useEffect(() => {
    // console.log(curTitle, inputval, message);
    if (!curTitle && inputval && message) {
      //if there is no curTitle, and we do have an input and response from gpt
      setCurTitle(inputval); //set the curTtile as inputval
    }
    if (curTitle && inputval && message) {
      //if there is curTitle, we are in the same chat
      setPrevChats([
        ...prevChats,
        { title: curTitle, role: "user", content: inputval },
        { title: curTitle, role: message.role, content: message.content },
      ]); //update the prevChat, which include a question from user and answer from the gpt
    }
  }, [message, curTitle]);

  return (
    <div className="app">
      <section className="side-bar">
        <button onClick={createNewChat}>+ New Chat</button>
        <ul className="history">
          {uniqueTitles?.map((uniquetitle, index) => (
            <li
              key={index}
              onClick={() => handleClick(uniquetitle)}
              className={
                selectedTitleStatus[uniquetitle] ? "selectedTitle" : ""
              }
            >
              {uniquetitle}
            </li>
          ))}
        </ul>
        <button
          className={
            selectedTitleStatus.length !== 0 &&
            Object.values(selectedTitleStatus).includes(true)
              ? "selectedTitle"
              : ""
          }
          onClick={deleteChat}
        >
          Delete
        </button>
        <nav>
          <p>Made by Max</p>
        </nav>
      </section>
      <section className="main">
        {!curTitle ? <h1>MaxFakeGPT</h1> : null}
        <ul className="feed">
          {curChats?.map((curchat, index) => {
            return (
              <li key={index}>
                {curchat.role === "user" ? (
                  <img src={userlogo} alt="chatgpt" />
                ) : (
                  <img src={chatgptlogo} alt="chatgpt" />
                )}
                {/* <p className="role">{curchat.role}</p> */}
                <p className="content">{curchat.content}</p>
              </li>
            );
          })}
        </ul>
        <div className="bottom-section">
          <div className="input-container">
            <input
              value={inputval}
              onChange={(e) => setInputval(e.target.value)}
            />
            <div id="submit" onClick={getMessages}>
              {"\u27A2"}
            </div>
          </div>
          <p className="info">
            Fake ChatGPT for Research and Practice Only. Please enjoy and
            provide your feedback.
          </p>
        </div>
      </section>
    </div>
  );
};

export default App;
