import { useState, useRef, useEffect } from 'react';

interface SpeechRecognitionHookProps {
  onTranscriptChange?: (transcript: string, isFinal: boolean) => void;
  continuous?: boolean;
  interimResults?: boolean;
}

export function useSpeechRecognition({
  onTranscriptChange,
  continuous = true,
  interimResults = true,
}: SpeechRecognitionHookProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const streamRef = useRef<string[]>([]);

  const isSupported = typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    const recognition = recognitionRef.current;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript = transcript;
          streamRef.current.push(transcript);
        } else {
          interimTranscript = transcript;
        }
      }

      if (finalTranscript) {
        finalTranscriptRef.current = finalTranscript;
        const fullTranscript = streamRef.current.join(' ');
        setTranscript(fullTranscript);
        onTranscriptChange?.(fullTranscript, true);
      } else if (interimTranscript) {
        const currentStream = [...streamRef.current];
        if (interimTranscript.trim()) {
          currentStream.push(interimTranscript);
        }
        const fullTranscript = currentStream.join(' ');
        setTranscript(fullTranscript);
        onTranscriptChange?.(fullTranscript, false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (continuous && isListening) {
        try {
          recognition.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isSupported, continuous, interimResults, onTranscriptChange, isListening]);

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) return;
    try {
      streamRef.current = [];
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  };

  const stopListening = () => {
    if (!isSupported || !recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  };

  const clearTranscript = () => {
    streamRef.current = [];
    setTranscript('');
    if (onTranscriptChange) {
      onTranscriptChange('', true);
    }
  };

  return {
    isListening,
    startListening,
    stopListening,
    transcript,
    isSupported,
    clearTranscript,
  };
}