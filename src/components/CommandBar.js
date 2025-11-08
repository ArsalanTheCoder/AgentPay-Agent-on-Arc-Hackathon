// src/components/CommandBar.js
"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './CommandBar.module.css';

// Simple inline SVG for the microphone icon
const MicIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={styles.micIcon}
  >
    <path
      d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
      fill="currentColor"
    />
    <path
      d="M19 12v1a7 7 0 0 1-14 0v-1h2v1a5 5 0 0 0 10 0v-1h2z"
      fill="currentColor"
    />
    <path
      d="M12 18.5a4.5 4.5 0 0 1-4.5-4.5H6a6 6 0 0 0 12 0h-1.5a4.5 4.5 0 0 1-4.5 4.5z"
      fill="currentColor"
    />
  </svg>
);

export default function CommandBar({ onSubmit }) {
  const [command, setCommand] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const trimmed = command.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    // keep the text in the input so user can edit or resend
  };

  const toggleListening = () => {
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { console.error(e); }
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    // Start listening
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser. Use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // keep listening until stopped
    recognition.interimResults = true; // provide interim results
    recognition.lang = 'en-US';

    let interimBuffer = ''; // hold the latest interim segment

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const txt = result[0].transcript;
        if (result.isFinal) {
          finalTranscript += txt;
        } else {
          interimTranscript += txt;
        }
      }

      // If there is final transcript, merge it with existing input
      // We'll replace the entire input with (previousFinals + current final + interim)
      // Simpler UX: show only the new recognition text while speaking
      const newText = (finalTranscript + interimTranscript).trim();

      if (newText.length > 0) {
        setCommand(newText);
      } else {
        // do not overwrite user typed text with empty interim
      }

      interimBuffer = interimTranscript;
    };

    recognition.onerror = (evt) => {
      console.error("Speech recognition error:", evt);
      if (evt.error === 'not-allowed' || evt.error === 'service-not-allowed') {
        alert("Microphone access blocked. Please allow microphone permission for this site.");
        try { recognition.stop(); } catch (e) {}
        recognitionRef.current = null;
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // ended by user or by the engine
      recognitionRef.current = null;
      setIsListening(false);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (e) {
      console.error("Could not start speech recognition:", e);
      alert("Unable to start microphone. Make sure you allowed microphone permissions.");
      recognitionRef.current = null;
      setIsListening(false);
    }
  };

  return (
    <form className={styles.commandBarContainer} onSubmit={handleSubmit}>
      <button
        type="button"
        className={`${styles.micButton || ''} ${isListening ? styles.micActive || '' : ''}`}
        onClick={toggleListening}
        title={isListening ? "Stop listening" : "Start listening"}
        aria-pressed={isListening}
      >
        <MicIcon />
      </button>

      <input
        type="text"
        className={styles.commandInput}
        placeholder={isListening ? "Listening..." : 'Type a command, e.g., "Pay Netflix $12 monthly"'}
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
        aria-label="Command input"
      />
      <button type="submit" className={styles.processButton}>
        Process
      </button>
    </form>
  );
}
