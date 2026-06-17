import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  
  // Instant Search (Debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(query);
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const [isListening, setIsListening] = useState(false);

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error("Speech Error:", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentText = finalTranscript || interimTranscript;
      setQuery(currentText);
      
      if (finalTranscript) {
        onSearch(finalTranscript);
      }
    };
    
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg group">
      <input
        type="text"
        placeholder="Search for movies, keywords..."
        className="w-full bg-white/5 border border-white/5 text-white px-12 py-4 rounded-2xl focus:outline-none focus:border-brand/40 focus:bg-white/10 transition-all font-medium placeholder:text-white/20"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Search 
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand transition-colors" 
        size={20} 
      />
      
      {isListening && (
        <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1 bg-brand/20 border border-brand/40 rounded-full animate-pulse">
          <div className="w-2 h-2 bg-brand rounded-full" />
          <span className="text-brand text-[10px] font-bold uppercase tracking-widest">Listening...</span>
        </div>
      )}

      <button
        type="button"
        onClick={startVoiceSearch}
        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${
          isListening ? 'text-brand scale-125' : 'text-white/20 hover:text-brand'
        }`}
      >
        <div className="relative">
          {isListening && (
            <div className="absolute inset-0 bg-brand/40 rounded-full animate-ping" />
          )}
          🎤
        </div>
      </button>

      {/* Subtle border shine effect */}
      <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none group-focus-within:border-brand/20 transition-all" />
    </form>
  );
};

export default SearchBar;
