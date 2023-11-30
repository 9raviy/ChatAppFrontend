// index.test.js
import { html, fixture, expect } from "@open-wc/testing";
import { waitUntil } from "@open-wc/testing-helpers";
import sinon from "sinon";
import { enableFetchMocks } from "jest-fetch-mock";
import "./index.js"; // Assuming your component is in the same directory

// Enable fetch mocks to prevent issues with browser-specific APIs
enableFetchMocks();

// Use esm to configure sinon for ES modules
require = require("esm")(module);

// Import sinon again after configuring esm
const sinon = require("sinon");

describe("ChatApp", () => {
  it("renders correctly with default values", async () => {
    const el = await fixture(html`<chat-app></chat-app>`);
    expect(el).shadowDom.to.equalSnapshot();
  });
  it("handles input correctly", async () => {
    const el = await fixture(html`<chat-app></chat-app>`);
    const inputElement = el.shadowRoot.querySelector("input");
    inputElement.value = "Test Input";
    inputElement.dispatchEvent(new Event("input"));
    expect(el.messageInput).to.equal("Test Input");
  });
  it("sends a message correctly", async () => {
    const el = await fixture(html`<chat-app></chat-app>`);
    el.userName = "TestUser";
    el.messageInput = "Test Message";
    const sendMessageSpy = sinon.spy(el.socket, "emit");
    el.sendMessage();
    expect(sendMessageSpy.calledOnce).to.be.true;
    // Simulate socket event 'chat message'
    el.socket.emit("chat message", {
      user: "TestUser",
      message: "Test Message",
    });
    await waitUntil(() => el.messages.length === 1);
    expect(el.messages[0].user).to.equal("TestUser");
    expect(el.messages[0].message).to.equal("Test Message");
  });
  it("does not send an empty message", async () => {
    const el = await fixture(html`<chat-app></chat-app>`);
    const sendMessageSpy = sinon.spy(el.socket, "emit");
    el.sendMessage();
    expect(sendMessageSpy.called).to.be.false;
    // Add more assertions based on your expected behavior when trying to send an empty message
  });
  it("does not send a message with HTML or script tags", async () => {
    const el = await fixture(html`<chat-app></chat-app>`);
    const sendMessageSpy = sinon.spy(el.socket, "emit");
    const inputElement = el.shadowRoot.querySelector("input");
    inputElement.value = '<script>alert("Hello");</script>';
    inputElement.dispatchEvent(new Event("input"));
    el.handleKeyDown({ key: "Enter" });
    expect(sendMessageSpy.called).to.be.false;
    // Add more assertions based on your expected behavior when trying to send a message with HTML or script tags
  });
  it("scrolls to the bottom on message update", async () => {
    const el = await fixture(html`<chat-app></chat-app>`);
    const messagesContainer = el.shadowRoot.getElementById("chat-messages");
    const scrollToBottomSpy = sinon.spy(el, "scrollToBottom");
    el.messages = [{ user: "TestUser", message: "Test Message" }];
    await waitUntil(() => scrollToBottomSpy.calledOnce);
    // Add more assertions based on your expected behavior after updating messages
  });
  // Add more test cases as needed
});
