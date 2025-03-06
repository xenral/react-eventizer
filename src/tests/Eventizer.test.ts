import { Eventizer } from '../Eventizer';

// Define a test event map
interface TestEventMap {
  'test:event': string;
  'test:number': number;
  'test:object': { id: number; name: string };
  'test:void': void;
}

describe('Eventizer', () => {
  let eventizer: Eventizer<TestEventMap>;

  beforeEach(() => {
    eventizer = new Eventizer<TestEventMap>();
  });

  test('should subscribe to an event and receive emitted payload', () => {
    const mockCallback = jest.fn();
    eventizer.on('test:event', mockCallback);
    
    eventizer.emit('test:event', 'hello world');
    
    expect(mockCallback).toHaveBeenCalledWith('hello world');
  });

  test('should unsubscribe from an event', () => {
    const mockCallback = jest.fn();
    eventizer.on('test:event', mockCallback);
    eventizer.off('test:event', mockCallback);
    
    eventizer.emit('test:event', 'hello world');
    
    expect(mockCallback).not.toHaveBeenCalled();
  });

  test('should return unsubscribe function from on() method', () => {
    const mockCallback = jest.fn();
    const unsubscribe = eventizer.on('test:event', mockCallback);
    
    unsubscribe();
    eventizer.emit('test:event', 'hello world');
    
    expect(mockCallback).not.toHaveBeenCalled();
  });

  test('should handle multiple subscribers for the same event', () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();
    
    eventizer.on('test:event', mockCallback1);
    eventizer.on('test:event', mockCallback2);
    
    eventizer.emit('test:event', 'hello world');
    
    expect(mockCallback1).toHaveBeenCalledWith('hello world');
    expect(mockCallback2).toHaveBeenCalledWith('hello world');
  });

  test('should handle different event types with correct payloads', () => {
    const stringCallback = jest.fn();
    const numberCallback = jest.fn();
    const objectCallback = jest.fn();
    const voidCallback = jest.fn();
    
    eventizer.on('test:event', stringCallback);
    eventizer.on('test:number', numberCallback);
    eventizer.on('test:object', objectCallback);
    eventizer.on('test:void', voidCallback);
    
    eventizer.emit('test:event', 'string payload');
    eventizer.emit('test:number', 42);
    eventizer.emit('test:object', { id: 1, name: 'test' });
    eventizer.emit('test:void', undefined);
    
    expect(stringCallback).toHaveBeenCalledWith('string payload');
    expect(numberCallback).toHaveBeenCalledWith(42);
    expect(objectCallback).toHaveBeenCalledWith({ id: 1, name: 'test' });
    expect(voidCallback).toHaveBeenCalledWith(undefined);
  });

  test('should return correct subscriber count', () => {
    expect(eventizer.subscriberCount('test:event')).toBe(0);
    
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    eventizer.on('test:event', callback1);
    expect(eventizer.subscriberCount('test:event')).toBe(1);
    
    eventizer.on('test:event', callback2);
    expect(eventizer.subscriberCount('test:event')).toBe(2);
    
    eventizer.off('test:event', callback1);
    expect(eventizer.subscriberCount('test:event')).toBe(1);
  });

  test('should clear all subscribers for a specific event', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    eventizer.on('test:event', callback1);
    eventizer.on('test:event', callback2);
    eventizer.on('test:number', jest.fn());
    
    eventizer.clearEvent('test:event');
    
    eventizer.emit('test:event', 'hello');
    
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
    expect(eventizer.subscriberCount('test:event')).toBe(0);
    expect(eventizer.subscriberCount('test:number')).toBe(1);
  });

  test('should clear all subscribers for all events', () => {
    eventizer.on('test:event', jest.fn());
    eventizer.on('test:number', jest.fn());
    eventizer.on('test:object', jest.fn());
    
    eventizer.clearAll();
    
    expect(eventizer.subscriberCount('test:event')).toBe(0);
    expect(eventizer.subscriberCount('test:number')).toBe(0);
    expect(eventizer.subscriberCount('test:object')).toBe(0);
  });

  test('should handle errors in event handlers without breaking other handlers', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const errorCallback = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });
    const normalCallback = jest.fn();
    
    eventizer.on('test:event', errorCallback);
    eventizer.on('test:event', normalCallback);
    
    eventizer.emit('test:event', 'hello');
    
    expect(errorCallback).toHaveBeenCalled();
    expect(normalCallback).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
}); 