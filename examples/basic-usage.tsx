import React, { useState } from 'react';
import { Eventizer, EventizerProvider, useSubscribe, useEmitter } from '../src';

// Define our custom event map
interface AppEventMap {
  'counter:increment': number;
  'counter:reset': void;
  'message:send': { text: string; sender: string };
}

// Create an event bus instance with our custom event map
const eventBus = new Eventizer<AppEventMap>();

// Create a Counter component that subscribes to counter events
const Counter: React.FC = () => {
  const [count, setCount] = useState(0);
  
  // Subscribe to counter:increment event
  useSubscribe('counter:increment', (incrementBy: number) => {
    setCount(prev => prev + incrementBy);
  });
  
  // Subscribe to counter:reset event
  useSubscribe('counter:reset', () => {
    setCount(0);
  });
  
  return (
    <div>
      <h2>Counter: {count}</h2>
    </div>
  );
};

// Create a MessageList component that subscribes to message events
const MessageList: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ text: string; sender: string }>>([]);
  
  // Subscribe to message:send event
  useSubscribe('message:send', (message: { text: string; sender: string }) => {
    setMessages(prev => [...prev, message]);
  });
  
  return (
    <div>
      <h2>Messages:</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.sender}:</strong> {msg.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Create a Controls component that emits events
const Controls: React.FC = () => {
  const [messageText, setMessageText] = useState('');
  
  // Get emitter functions
  const emitIncrement = useEmitter('counter:increment');
  const emitReset = useEmitter('counter:reset');
  const emitMessage = useEmitter('message:send');
  
  const handleSendMessage = () => {
    if (messageText.trim()) {
      emitMessage({ text: messageText, sender: 'User' });
      setMessageText('');
    }
  };
  
  return (
    <div>
      <h2>Controls</h2>
      <div>
        <button onClick={() => emitIncrement(1)}>Increment by 1</button>
        <button onClick={() => emitIncrement(5)}>Increment by 5</button>
        <button onClick={() => emitReset()}>Reset Counter</button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={handleSendMessage}>Send Message</button>
      </div>
    </div>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <EventizerProvider bus={eventBus}>
      <div style={{ padding: '20px' }}>
        <h1>react-eventizer Example</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <Counter />
            <MessageList />
          </div>
          <Controls />
        </div>
      </div>
    </EventizerProvider>
  );
};

export default App; 