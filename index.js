import { LitElement, html, css } from "https://cdn.skypack.dev/lit";
import { io } from "https://cdn.skypack.dev/socket.io-client@4/dist/socket.io.js";

class ChatApp extends LitElement {
  static styles = css`
    #chat-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    #chat-messages {
      margin-bottom: 20px;
      max-height: 300px;
      overflow-y: auto;
    }

    .message {
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 5px;
      background-color: #f2f2f2;
    }

    .user {
      font-weight: bold;
    }

    #message-input {
      display: flex;
      margin-top: 10px;
    }

    input {
      flex: 1;
      resize: none;
      padding: 5px;
      margin-right: 10px;
    }

    button {
      padding: 5px 10px;
      cursor: pointer;
      background-color: #4caf50;
      color: white;
      border: none;
      border-radius: 3px;
    }
  `;

  static properties = {
    messages: { type: Array },
    qaPairs: { type: Object },
    userName: { type: String },
  };

  constructor() {
    super();
    this.socket = io("https://chat-app-ravi-ec170cd38b3a.herokuapp.com/");
    this.socket.on("connect", () => {});

    this.messages = [];
    this.messageInput = "";
    this.qaPairs = {};
    this.userName = "";

    this.sendMessage = this.sendMessage.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.socket.on("chat message", (data) => {
      this.messages = [...this.messages, data];
      this.scrollToBottom();
    });

    this.socket.on("user joined", (user) => {
      this.messages = [
        ...this.messages,
        { user: "Awesome bot", message: `${user} joined the chat!` },
      ];
    });

    this.socket.on("user left", (user) => {
      this.messages = [
        ...this.messages,
        { user: "Awesome bot", message: `${user} left the chat.` },
      ];
    });
  }

  updated(changedProperties) {
    if (changedProperties.has("messages")) {
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    const messagesContainer = this.shadowRoot.getElementById("chat-messages");
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  render() {
    return html`
      <div id="chat-container">
        <div id="chat-messages">
          ${this.messages.map(
            (message) => html`
              <div class="message">
                <span class="user">${message.user}</span>
                <span class="content">${message.message}</span>
              </div>
            `
          )}
        </div>
        <div id="message-input">
          <input
            id="message-input"
            autocomplete="off"
            .value="${this.messageInput}"
            @input="${this.handleInput}"
            @keydown="${this.handleKeyDown}"
            onfocus="this.value=''"
          />
          <button @click="${this.sendMessage}" id="sendButton">Send</button>
        </div>
      </div>
    `;
  }

  handleInput(event) {
    this.messageInput = event.target.value;
  }

  handleKeyDown(event) {
    if (event.key === "Enter") {
      // Prevent the default behavior (e.g., newline in the input field)
      event.preventDefault();

      // Call sendMessage method when Enter key is pressed
      this.sendMessage();
    }
  }

  sendMessage() {
    const trimmedInput = this.messageInput.trim();
    const trimmedUsername = this.userName.trim();

    if (trimmedInput === "") {
      alert("Message cannot be empty");
    } else if (/\<.*\>/g.test(trimmedInput)) {
      alert("Chat cannot contain HTML or script tags");
    } else {
      this.socket.emit("chat message", {
        user: trimmedUsername,
        message: trimmedInput,
      });

      // Clear the input field after sending the message
      this.messageInput = "";
    }
  }

  firstUpdated() {
    // Prompt the user for their name when the component is first updated
    let userName = prompt("Enter your name:");

    // Validate the username
    while (!userName.trim()) {
      alert("Username cannot be empty");
      userName = prompt("Enter your name:");
    }

    // Validate the username to ensure it doesn't contain HTML or script tags
    while (/\<.*\>/g.test(userName)) {
      alert("Username cannot contain HTML or script tags");
      userName = prompt("Enter your name:");
    }

    this.userName = userName || "user";
    this.socket.emit("user connected", this.userName);

    // Display the user's name in the chat
    this.messages = [
      ...this.messages,
      { user: "bot", message: `Welcome, ${this.userName}!` },
    ];
  }
}

customElements.define("chat-app", ChatApp);
