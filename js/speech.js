/**
 * speech.js - Web Speech API (STT & TTS), MediaRecorder local audio capture, and Web Audio API visualizer
 */
class SpeechService {
  constructor(callbacks = {}) {
    this.callbacks = {
      onTranscriptUpdate: () => {},
      onFinalTranscript: () => {},
      onListeningStateChange: () => {},
      onSpeakingStateChange: () => {},
      onAudioRecorded: () => {},
      onError: () => {},
      ...callbacks
    };

    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.synth = window.speechSynthesis || null;
    this.selectedVoice = null;
    this.voices = [];
    
    // MediaRecorder local audio capture
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.lastRecordedBlob = null;
    this.lastRecordedUrl = null;

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
    this.finalTranscript = "";

    this.initRecognition();
    this.initVoices();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition API is not supported in this browser.");
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";

      this.recognition.onstart = () => {
        this.isListening = true;
        this.callbacks.onListeningStateChange(true);
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            this.finalTranscript += event.results[i][0].transcript + " ";
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        this.callbacks.onTranscriptUpdate({
          final: this.finalTranscript.trim(),
          interim: interimTranscript.trim()
        });
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech Recognition Event:", event.error);
        if (event.error === "network") {
          // Do NOT cancel the user's turn! The MediaRecorder is actively capturing the voice.
          this.callbacks.onError("Browser speech network service unavailable. Your voice is still being recorded via microphone!");
          return;
        }

        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          this.callbacks.onError("Microphone access denied. Please click the lock or settings icon in your browser address bar and select 'Allow Microphone'.");
          this.stopListening();
        } else if (event.error === "audio-capture") {
          this.callbacks.onError("No microphone detected. Please plug in or check your audio input settings.");
          this.stopListening();
        } else if (event.error !== "no-speech") {
          this.callbacks.onError(`Speech recognition notification: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        // If the user is still in listening mode, we don't force stop MediaRecorder
        if (!this.isListening) {
          this.callbacks.onListeningStateChange(false);
        }
      };
    } catch (e) {
      console.warn("Failed to instantiate SpeechRecognition:", e);
      this.recognition = null;
    }
  }

  initVoices() {
    if (!this.synth) return;

    const populateVoices = () => {
      this.voices = this.synth.getVoices();
      const englishVoices = this.voices.filter(v => v.lang.startsWith("en"));
      
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

    if (this.isStarting || this.isListening) {
      console.warn("SpeechService: already starting or listening");
      return;
    }
    this.isStarting = true;

    this.finalTranscript = "";
    this.audioChunks = [];

    if (canvasElement) {
      this.canvas = canvasElement;
      this.canvasCtx = canvasElement.getContext("2d");
    }

    // 1. Acquire Microphone Stream with Timeout Guard
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser does not support microphone capture. Please use Chrome, Edge, or Firefox.");
      }

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Microphone permission timed out. Please check your browser address bar to Allow.")), 7000);
      });

      this.mediaStream = await Promise.race([
        navigator.mediaDevices.getUserMedia({ audio: true, video: false }),
        timeoutPromise
      ]);

      // 2. Setup Web Audio Analyser (isolated in safe block)
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          if (!this.audioCtx || this.audioCtx.state === "closed") {
            this.audioCtx = new AudioContext();
          }
          if (this.audioCtx.state === "suspended") {
            this.audioCtx.resume().catch(() => {});
          }

          const source = this.audioCtx.createMediaStreamSource(this.mediaStream);
          this.analyser = this.audioCtx.createAnalyser();
          this.analyser.fftSize = 256;
          this.analyser.smoothingTimeConstant = 0.8;
          source.connect(this.analyser);
          
          const bufferLength = this.analyser.frequencyBinCount;
          this.dataArray = new Uint8Array(bufferLength);
          this.startVisualizer();
        }
      } catch (audioErr) {
        console.warn("AudioContext visualizer notice (voice will still record):", audioErr);
        this.startSyntheticVisualizer();
      }

      // 3. Start HTML5 MediaRecorder (Local offline voice capture)
      try {
        let mimeType = "";
        if (typeof MediaRecorder !== "undefined") {
          if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
            mimeType = "audio/webm;codecs=opus";
          } else if (MediaRecorder.isTypeSupported("audio/webm")) {
            mimeType = "audio/webm";
          } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
            mimeType = "audio/mp4";
          }

          const recorderOptions = mimeType ? { mimeType } : {};
          this.mediaRecorder = new MediaRecorder(this.mediaStream, recorderOptions);

          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              this.audioChunks.push(e.data);
            }
          };

          this.mediaRecorder.onstop = async () => {
            const finalMime = this.mediaRecorder.mimeType || mimeType || "audio/webm";
            this.lastRecordedBlob = new Blob(this.audioChunks, { type: finalMime });
            this.lastRecordedUrl = URL.createObjectURL(this.lastRecordedBlob);

            const base64Audio = await this.blobToBase64(this.lastRecordedBlob);

            this.callbacks.onAudioRecorded({
              blob: this.lastRecordedBlob,
              url: this.lastRecordedUrl,
              mimeType: finalMime,
              base64: base64Audio
            });
          };

          this.mediaRecorder.start(250);
        }
      } catch (recErr) {
        console.warn("MediaRecorder failed:", recErr);
      }

      // 4. Mark listening as active
      this.isListening = true;
      this.callbacks.onListeningStateChange(true);

      // 5. Start Browser SpeechRecognition in parallel if available
      if (this.recognition) {
        try {
          this.recognition.start();
        } catch (e) {
          console.warn("SpeechRecognition start notice:", e.message);
        }
      }

    } catch (err) {
      console.warn("Could not acquire microphone:", err);
      this.isListening = false;
      this.callbacks.onListeningStateChange(false);
      this.callbacks.onError("Microphone access notice: " + (err.message || "Permission issue"));
      this.stopVisualizer();
      throw err;
    } finally {
      this.isStarting = false;
    }
  }

  stopListening() {
    this.isListening = false;

    // Stop MediaRecorder
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }

    // Stop Browser Recognition
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    this.callbacks.onListeningStateChange(false);

    // Stop Media Stream Tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.stopVisualizer();
  }

  blobToBase64(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        // strip data url prefix
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64);
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });
  }

  speak(text, options = {}) {
    if (!this.synth) {
      console.warn("Speech synthesis not supported");
      return;
    }

    this.stopSpeaking();

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

          const gradient = this.canvasCtx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, "rgba(2, 132, 199, 0.5)");
          gradient.addColorStop(0.5, "rgba(37, 99, 235, 0.85)");
          gradient.addColorStop(1, "rgba(79, 70, 229, 1)");

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
        const wave = Math.sin(this.syntheticWavePhase + i * 0.25) * Math.cos(this.syntheticWavePhase * 0.5 + i * 0.1);
        const intensity = (wave + 1) / 2;
        const barHeight = Math.max(6, intensity * height * 0.7);

        const gradient = this.canvasCtx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, "rgba(2, 132, 199, 0.5)");
        gradient.addColorStop(0.5, "rgba(6, 182, 212, 0.85)");
        gradient.addColorStop(1, "rgba(37, 99, 235, 1)");

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
      this.canvasCtx.fillStyle = "rgba(2, 132, 199, 0.3)";
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
