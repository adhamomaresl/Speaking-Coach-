/**
 * speech.js - Web Speech API (STT & TTS) and Web Audio API real-time visualizer
 */
class SpeechService {
  constructor(callbacks = {}) {
    this.callbacks = {
      onTranscriptUpdate: () => {},
      onFinalTranscript: () => {},
      onListeningStateChange: () => {},
      onSpeakingStateChange: () => {},
      onError: () => {},
      ...callbacks
    };

    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.synth = window.speechSynthesis || null;
    this.selectedVoice = null;
    this.voices = [];
    
    // Audio Visualizer members
    this.audioCtx = null;
    this.analyser = null;
    this.dataArray = null;
    this.mediaStream = null;
    this.canvas = null;
    this.canvasCtx = null;
    this.animationId = null;
    this.isVisualizing = false;

    // Synthetic audio wave for TTS
    this.syntheticWavePhase = 0;

    this.initRecognition();
    this.initVoices();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition API is not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";

    let finalTranscript = "";

    this.recognition.onstart = () => {
      this.isListening = true;
      this.callbacks.onListeningStateChange(true);
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      this.callbacks.onTranscriptUpdate({
        final: finalTranscript.trim(),
        interim: interimTranscript.trim()
      });
    };

    this.recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      if (event.error !== "no-speech") {
        this.callbacks.onError(`Microphone error: ${event.error}`);
      }
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        this.stopListening();
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        // If it stopped unintentionally while user still intended to record, restart
        try {
          this.recognition.start();
        } catch (e) {
          this.isListening = false;
          this.callbacks.onListeningStateChange(false);
        }
      } else {
        this.callbacks.onListeningStateChange(false);
      }
    };
  }

  initVoices() {
    if (!this.synth) return;

    const populateVoices = () => {
      this.voices = this.synth.getVoices();
      // Filter primarily for English voices
      const englishVoices = this.voices.filter(v => v.lang.startsWith("en"));
      
      // Look for natural voices first (Google US English, Microsoft Natural, Samantha)
      const preferred = englishVoices.find(v => 
        v.name.includes("Natural") || 
        v.name.includes("Google") || 
        v.name.includes("Samantha") ||
        v.name.includes("Daniel") ||
        v.name.includes("Zira")
      );

      this.selectedVoice = preferred || englishVoices[0] || this.voices[0];
    };

    populateVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = populateVoices;
    }
  }

  getAvailableVoices() {
    if (!this.voices || this.voices.length === 0) {
      if (this.synth) this.voices = this.synth.getVoices();
    }
    return this.voices.filter(v => v.lang.startsWith("en"));
  }

  setVoice(voiceURI) {
    const found = this.voices.find(v => v.voiceURI === voiceURI);
    if (found) {
      this.selectedVoice = found;
    }
  }

  async startListening(canvasElement) {
    if (this.isSpeaking) {
      this.stopSpeaking();
    }

    if (canvasElement) {
      this.canvas = canvasElement;
      this.canvasCtx = canvasElement.getContext("2d");
    }

    // Try to access microphone for AudioContext visualizer
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const source = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);
      
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.startVisualizer();
    } catch (err) {
      console.warn("Could not attach audio visualizer to microphone:", err);
      // Still proceed with speech recognition even if visualizer fails
      this.startSyntheticVisualizer();
    }

    if (this.recognition) {
      try {
        this.isListening = true;
        this.recognition.start();
        this.callbacks.onListeningStateChange(true);
      } catch (e) {
        console.warn("Recognition already active or failed to start", e);
      }
    } else {
      this.callbacks.onError("Speech recognition is not available in this browser. You can type your response instead.");
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.callbacks.onListeningStateChange(false);

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.stopVisualizer();
  }

  speak(text, options = {}) {
    if (!this.synth) {
      console.warn("Speech synthesis not supported");
      return;
    }

    this.stopSpeaking();

    // Clean text of markdown asterisks or special tokens for smoother TTS
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/#{1,6}\s?/g, "")
      .replace(/-{3,}/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (options.voice) {
      utterance.voice = options.voice;
    } else if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.callbacks.onSpeakingStateChange(true);
      if (this.canvas) {
        this.startSyntheticVisualizer();
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.callbacks.onSpeakingStateChange(false);
      this.stopVisualizer();
      if (options.onComplete) options.onComplete();
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis Error:", e);
      this.isSpeaking = false;
      this.callbacks.onSpeakingStateChange(false);
      this.stopVisualizer();
    };

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.callbacks.onSpeakingStateChange(false);
    this.stopVisualizer();
  }

  startVisualizer() {
    if (this.isVisualizing) return;
    this.isVisualizing = true;

    const draw = () => {
      if (!this.isVisualizing || !this.canvas || !this.canvasCtx) return;
      this.animationId = requestAnimationFrame(draw);

      const width = this.canvas.width;
      const height = this.canvas.height;
      this.canvasCtx.clearRect(0, 0, width, height);

      if (this.analyser && this.dataArray) {
        this.analyser.getByteFrequencyData(this.dataArray);

        const barCount = 48;
        const barWidth = (width / barCount) - 3;
        const step = Math.floor(this.dataArray.length / barCount);

        for (let i = 0; i < barCount; i++) {
          const value = this.dataArray[i * step] || 0;
          const barHeight = Math.max(4, (value / 255) * height * 0.85);

          // Glowing gradient
          const gradient = this.canvasCtx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.4)");
          gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.8)");
          gradient.addColorStop(1, "rgba(236, 72, 153, 1)");

          this.canvasCtx.fillStyle = gradient;
          const x = i * (barWidth + 3);
          const y = (height - barHeight) / 2;

          // Rounded bar caps with fallback
          this.canvasCtx.beginPath();
          if (typeof this.canvasCtx.roundRect === "function") {
            this.canvasCtx.roundRect(x, y, barWidth, barHeight, 4);
          } else {
            this.canvasCtx.rect(x, y, barWidth, barHeight);
          }
          this.canvasCtx.fill();
        }
      }
    };

    draw();
  }

  startSyntheticVisualizer() {
    if (this.isVisualizing) return;
    this.isVisualizing = true;

    const drawSynthetic = () => {
      if (!this.isVisualizing || !this.canvas || !this.canvasCtx) return;
      this.animationId = requestAnimationFrame(drawSynthetic);

      const width = this.canvas.width;
      const height = this.canvas.height;
      this.canvasCtx.clearRect(0, 0, width, height);

      this.syntheticWavePhase += 0.08;
      const barCount = 48;
      const barWidth = (width / barCount) - 3;

      for (let i = 0; i < barCount; i++) {
        // Create an organic oscillating wave
        const wave = Math.sin(this.syntheticWavePhase + i * 0.25) * Math.cos(this.syntheticWavePhase * 0.5 + i * 0.1);
        const intensity = (wave + 1) / 2;
        const barHeight = Math.max(6, intensity * height * 0.7);

        const gradient = this.canvasCtx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, "rgba(16, 185, 129, 0.4)");
        gradient.addColorStop(0.5, "rgba(6, 182, 212, 0.8)");
        gradient.addColorStop(1, "rgba(99, 102, 241, 1)");

        this.canvasCtx.fillStyle = gradient;
        const x = i * (barWidth + 3);
        const y = (height - barHeight) / 2;

        this.canvasCtx.beginPath();
        if (typeof this.canvasCtx.roundRect === "function") {
          this.canvasCtx.roundRect(x, y, barWidth, barHeight, 4);
        } else {
          this.canvasCtx.rect(x, y, barWidth, barHeight);
        }
        this.canvasCtx.fill();
      }
    };

    drawSynthetic();
  }

  stopVisualizer() {
    this.isVisualizing = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.canvas && this.canvasCtx) {
      this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawIdleWaveform();
    }
  }

  drawIdleWaveform() {
    if (!this.canvas || !this.canvasCtx) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.canvasCtx.clearRect(0, 0, width, height);

    const barCount = 48;
    const barWidth = (width / barCount) - 3;
    for (let i = 0; i < barCount; i++) {
      const barHeight = 4;
      this.canvasCtx.fillStyle = "rgba(148, 163, 184, 0.2)";
      const x = i * (barWidth + 3);
      const y = (height - barHeight) / 2;
      this.canvasCtx.beginPath();
      if (typeof this.canvasCtx.roundRect === "function") {
        this.canvasCtx.roundRect(x, y, barWidth, barHeight, 2);
      } else {
        this.canvasCtx.rect(x, y, barWidth, barHeight);
      }
      this.canvasCtx.fill();
    }
  }
}
