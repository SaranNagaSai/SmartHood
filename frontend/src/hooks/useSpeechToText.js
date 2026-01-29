// Universal speech-to-text helper
// Automatically switches speech language based on UI language (EN / TE)

import { useTranslation } from "react-i18next";

export default function useSpeechInput(setValue) {
  const { i18n } = useTranslation();

  const startSpeech = () => {
    // Support both standard and WebKit-prefixed API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();

    // 🔑 KEY FIX: Dynamic language switching with fallback
    recognition.lang = i18n.language === "te" ? "te-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      console.log("Voice listening started...");
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      console.log("Voice Input:", spokenText);

      // If setValue is a function, call it with the text
      if (typeof setValue === 'function') {
        setValue(spokenText);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech Error:", event.error);
      const msg = i18n.language === "te"
        ? "వాయిస్ గుర్తింపు విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి."
        : `Speech recognition failed (${event.error}). Please try again close to the microphone.`;

      if (event.error !== 'no-speech') {
        alert(msg);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("Speech recognition already active");
    }
  };

  return startSpeech;
}
