import React, { useState } from 'react';
import { Eventizer, EventizerProvider, useSubscribe, useEmitter } from '../src';

enum AppEvent {
  CounterIncrement = 'counter:increment',
  CounterReset = 'counter:reset',
  MessageSend = 'message:send',
}

// Define our custom event map
interface AppEventMap {
  [AppEvent.CounterIncrement]: number;
  [AppEvent.CounterReset]: void;
  [AppEvent.MessageSend]: { text: string; sender: string };
}

declare module '../src' {
  interface EventMap extends AppEventMap {}
}

// Create an event bus instance with our custom event map
const eventBus = new Eventizer<AppEventMap>();

// Create a Counter component that subscribes to counter events
const Counter: React.FC = () => {
  const [count, setCount] = useState(0);
  
  // Subscribe to counter:increment event
  useSubscribe(AppEvent.CounterIncrement, (incrementBy) => {
    setCount(prev => prev + incrementBy);
  });
  
  // Subscribe to counter:reset event
  useSubscribe(AppEvent.CounterReset, () => {
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
  useSubscribe(AppEvent.MessageSend, (message) => {
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
  const emitIncrement = useEmitter(AppEvent.CounterIncrement);
  const emitReset = useEmitter(AppEvent.CounterReset);
  const emitMessage = useEmitter(AppEvent.MessageSend);
  
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