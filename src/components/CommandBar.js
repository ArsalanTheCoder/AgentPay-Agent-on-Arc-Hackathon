// src/components/CommandBar.js
"use client";

import React, { useState, useRef } from 'react'; // Import useRef
import styles from './styles.module.css';

export default function CommandBar({ onSubmit }) {
  const [command, setCommand] = useState('');
  const [isListening, setIsListening] = useState(false); // New state to track mic status

  // useRef will hold the speech recognition instance so it persists across re-renders
  const recognitionRef = useRef(null);

  // This function is called when the user clicks the "Submit Command" button
  const handleSubmit = () => {
    onSubmit(command);
    // We won't clear the command here, as the user might want to edit it
  };

  // --- NEW FUNCTION: To handle microphone button click ---
  const toggleListening = () => {
    if (isListening) {
      // If already listening, stop it
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // If not listening, start it
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      // Check if the browser supports the API
      if (!SpeechRecognition) {
        alert("Sorry, your browser doesn't support Speech Recognition. Try Chrome or Edge.");
        return;
      }

      // Create a new recognition instance and store it in the ref
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Keep listening even after pauses
      recognitionRef.current.interimResults = true; // This gives us real-time results
      recognitionRef.current.lang = 'en-US';

      // Event handler for when speech is recognized
      recognitionRef.current.onresult = (event) => {
        // Loop through all results and build the transcript
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        
        // Update the input field's text in real-time
        setCommand(transcript);
      };

      // Event handler for when recognition ends
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      // Event handler for errors
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      // Start listening
      recognitionRef.current.start();
      setIsListening(true);
    }
  };
  // --- END OF NEW FUNCTION ---

  return (
    <div className={styles.commandBarContainer}>
      {/* --- NEW: Microphone Button --- */}
      <button
        className={`${styles.micButton} ${isListening ? styles.micActive : ''}`}
        onClick={toggleListening}
        title={isListening ? "Stop listening" : "Start listening"}
      >
        {/* Simple SVG for the mic icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="22"></line>
        </svg>
      </button>
      {/* --- END OF NEW BUTTON --- */}

      <input
        type="text"
        placeholder={isListening ? "Listening..." : "Pay Netflix $12 on the 1st of every month..."}
        className={styles.commandInput}
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSubmit();
          }
        }}
      />
      <button className={styles.submitCommandButton} onClick={handleSubmit}>
        Submit Command
      </button>
    </div>
  );
}