import { useState, useEffect, useRef } from 'react';
import MatrixRain from './MatrixRain';

const BruteForceDemo = () => {
  const [targetPassword, setTargetPassword] = useState('');
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentAttempt, setCurrentAttempt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [attemptsPerSecond, setAttemptsPerSecond] = useState(0);
  const [found, setFound] = useState(false);
  const [progress, setProgress] = useState(0);
  const workerRef = useRef(null);
  const timerRef = useRef(null);

  // Create a new worker
  const createWorker = () => {
    // Clean up existing worker if any
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    
    // Create new worker
    workerRef.current = new Worker(
      new URL('../workers/bruteForceWorker.js', import.meta.url),
      { type: 'module' }
    );

    // Set up message handler
    workerRef.current.onmessage = (e) => {
      const { type, data } = e.data;

      switch (type) {
        case 'progress':
          setCurrentAttempt(data.currentAttempt);
          setCurrentGuess(data.currentAttempt);
          setAttemptsCount(data.attempts);
          setAttemptsPerSecond(data.speed);
          setProgress(data.progress);
          break;
        case 'success':
          setFound(true);
          setIsRunning(false);
          setCurrentGuess(data.password);
          setCurrentAttempt(data.password);
          setAttemptsCount(data.attempts);
          stopTimer();
          break;
        case 'failed':
          setIsRunning(false);
          setAttemptsCount(data.attempts);
          stopTimer();
          break;
      }
    };
  };

  // Initialize worker on component mount
  useEffect(() => {
    createWorker();
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      stopTimer();
    };
  }, []);

  const startTimer = () => {
    const startTime = Date.now();
    stopTimer(); // Clear any existing timer
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const diff = now - startTime;
      setTimeElapsed(diff);
    }, 10); // Update every 10ms for smooth millisecond display
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startBruteForce = () => {
    if (!targetPassword) return;
    
    // Reset state
    setIsRunning(true);
    setFound(false);
    setCurrentGuess('');
    setCurrentAttempt('');
    setAttemptsCount(0);
    setTimeElapsed(0);
    setAttemptsPerSecond(0);
    setProgress(0);

    // Create fresh worker
    createWorker();
    
    // Start timer
    startTimer();

    // Start cracking
    workerRef.current.postMessage({
      targetPassword,
      maxLength: 8
    });
  };

  const stopBruteForce = () => {
    setIsRunning(false);
    stopTimer();
    createWorker(); // Create fresh worker for next run
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  return (
    <>
      <MatrixRain currentAttempt={currentAttempt} isRunning={isRunning} />
      <div className="container">
        <h1>
          🔒 Password Security Demo
        </h1>
        <div className="warning">
          ⚠️ Educational Purpose Only: This demo illustrates why using strong passwords is crucial. It demonstrates how simple passwords can be cracked using brute force methods.
        </div>
        <div className="disclaimer">
          <p>✅ This is a safe demonstration that:</p>
          <ul>
            <li>Does not store or transmit any passwords</li>
            <li>Runs entirely in your browser</li>
            <li>Is designed to teach password security</li>
            <li>Promotes cybersecurity awareness</li>
          </ul>
          <p className="learn-more">Learn more about creating strong passwords at <a href="https://www.ncsc.gov.uk/collection/top-tips-for-staying-secure-online/password-managers" target="_blank" rel="noopener noreferrer">NCSC Password Security Guide</a></p>
        </div>
        
        <div className="input-section">
          <input
            type="text"
            value={targetPassword}
            onChange={(e) => setTargetPassword(e.target.value)}
            placeholder="Enter a password to crack"
            disabled={isRunning}
            maxLength={8}
          />
          <button 
            onClick={isRunning ? stopBruteForce : startBruteForce}
            disabled={!targetPassword}
          >
            {isRunning ? '⏹ Stop' : '▶️ Start'} Cracking
          </button>
        </div>

        <div className="stats">
          <p>
            Current Attempt
            <strong>{currentGuess || '...'}</strong>
          </p>
          <p>
            Target Password
            <strong>{targetPassword}</strong>
          </p>
          <p>
            Total Attempts
            <strong>{attemptsCount.toLocaleString()}</strong>
          </p>
          <p>
            Time Elapsed
            <strong>{formatTime(timeElapsed)}</strong>
          </p>
          <p>
            Cracking Speed
            <strong>{attemptsPerSecond.toLocaleString()} /sec</strong>
          </p>
          {found && (
            <div className="success">
              🔓 Password cracked: {currentGuess}
            </div>
          )}
          {isRunning && (
            <div className="progress-bar">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${Math.min(progress * 100, 100)}%`
                }} 
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BruteForceDemo;
