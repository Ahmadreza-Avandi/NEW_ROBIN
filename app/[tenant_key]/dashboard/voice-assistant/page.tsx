'use client';

import { useState, useRef, useEffect, useReducer } from 'react';
import { Mic, MicOff, Volume2, Loader2, MessageSquare } from 'lucide-react';

// تابع تشخیص پشتیبانی از Speech Recognition
function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

// تابع فعال‌سازی صدا
async function enableAudio(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    console.log('Audio enabled successfully');
  } catch (error) {
    console.error('Failed to enable audio:', error);
    throw error;
  }
}

// تابع شروع گوش دادن
function startListening(callbacks: {
  onResult: (text: string) => void;
  onEnd: (finalText: string) => void;
  onError: (error: string) => void;
}): any {
  if (!isSpeechRecognitionSupported()) {
    callbacks.onError('تشخیص گفتار پشتیبانی نمی‌شود');
    return null;
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.lang = 'fa-IR';
  recognition.continuous = false;
  recognition.interimResults = true;
  
  let finalTranscript = '';
  
  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }
    
    callbacks.onResult(finalTranscript + interimTranscript);
  };
  
  recognition.onend = () => {
    callbacks.onEnd(finalTranscript.trim());
  };
  
  recognition.onerror = (event: any) => {
    callbacks.onError(`خطا: ${event.error}`);
  };
  
  recognition.start();
  return recognition;
}

// تابع توقف گوش دادن
function stopListening(recognition: any): void {
  if (recognition) {
    recognition.stop();
  }
}

// تابع پخش صدا
async function playAudio(text: string): Promise<void> {
  try {
    const response = await fetch('/api/voice-assistant/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('خطا در دریافت صدا');
    }

    const data = await response.json();
    
    if (!data.success || !data.audioUrl) {
      throw new Error(data.error || 'خطا در دریافت صدا');
    }

    // استفاده از audioUrl که از API برمیگرده
    const audio = new Audio(data.audioUrl);
    
    await audio.play();
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        resolve();
      };
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        reject(new Error('خطا در پخش صدا'));
      };
    });
  } catch (error) {
    console.error('خطا در پخش صدا:', error);
    throw error;
  }
}

// State management
interface Message {
  user: string;
  robin: string;
  timestamp: Date;
}

interface State {
  isListening: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  currentMessage: string;
  error: string | null;
  microphonePermission: boolean;
  history: Message[];
}

type Action =
  | { type: 'SET_LISTENING'; payload: boolean }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_CURRENT_MESSAGE'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MIC_PERMISSION'; payload: boolean }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'CLEAR_HISTORY' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LISTENING':
      return { ...state, isListening: action.payload };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_CURRENT_MESSAGE':
      return { ...state, currentMessage: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_MIC_PERMISSION':
      return { ...state, microphonePermission: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, history: [...state.history, action.payload] };
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
    default:
      return state;
  }
}

const initialState: State = {
  isListening: false,
  isProcessing: false,
  isPlaying: false,
  currentMessage: '',
  error: null,
  microphonePermission: false,
  history: []
};

export default function VoiceAssistantPage({ params }: { params: { tenant_key: string } }) {
  const tenantKey = params.tenant_key || 'rabin';
  
  // بارگذاری تاریخچه از localStorage
  const loadHistoryFromStorage = () => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(`voice-history-${tenantKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // تبدیل timestamp به Date object
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
    return [];
  };

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    history: loadHistoryFromStorage()
  });
  const [showHistory, setShowHistory] = useState(false);
  const [buttonText, setButtonText] = useState('شروع گفتگو');
  const recognitionRef = useRef<any>(null);
  const autoStartRef = useRef<boolean>(false);
  const historyRef = useRef<Message[]>(state.history); // نگه‌داری هیستوری در ref

  // به‌روزرسانی historyRef هر بار که state.history تغییر می‌کنه
  useEffect(() => {
    historyRef.current = state.history;
  }, [state.history]);

  // ذخیره تاریخچه در localStorage هر بار که تغییر می‌کنه
  useEffect(() => {
    if (typeof window !== 'undefined' && state.history.length > 0) {
      try {
        localStorage.setItem(`voice-history-${tenantKey}`, JSON.stringify(state.history));
        console.log(`💾 History saved: ${state.history.length} messages`);
      } catch (error) {
        console.error('Error saving history:', error);
      }
    }
  }, [state.history, tenantKey]);

  // Check microphone permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        dispatch({ type: 'SET_MIC_PERMISSION', payload: true });
        
        // Auto-enable audio
        await enableAudio();
        
        // Auto-start listening
        dispatch({ type: 'SET_LISTENING', payload: true });
      } catch (error) {
        console.error('Microphone permission denied:', error);
        dispatch({ type: 'SET_MIC_PERMISSION', payload: false });
        dispatch({ type: 'SET_ERROR', payload: 'دسترسی به میکروفون لازم است' });
      }
    };

    checkPermission();
  }, []);

  // Auto-start listening when permission is granted
  useEffect(() => {
    if (state.microphonePermission && state.isListening && !autoStartRef.current) {
      autoStartRef.current = true;
      startListeningProcess();
    }
  }, [state.microphonePermission, state.isListening]);

  const startListeningProcess = async () => {
    if (!state.microphonePermission) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'دسترسی به میکروفون لازم است. لطفاً صفحه را رفرش کنید و دسترسی را بدهید.'
      });
      return;
    }

    dispatch({ type: 'SET_ERROR', payload: null });
    setButtonText('در حال گوش دادن...');

    try {
      recognitionRef.current = startListening({
        onResult: (transcript: string) => {
          dispatch({ type: 'SET_CURRENT_MESSAGE', payload: transcript });
        },
        onEnd: async (finalTranscript: string) => {
          dispatch({ type: 'SET_LISTENING', payload: false });
          setButtonText('در حال پردازش...');

          const messageToSend = finalTranscript.trim() || state.currentMessage.trim();
          if (messageToSend) {
            dispatch({ type: 'SET_PROCESSING', payload: true });

            try {
              // استفاده از historyRef برای دریافت آخرین هیستوری
              const currentHistory = historyRef.current;
              
              console.log('📤 Sending to AI:', {
                message: messageToSend.substring(0, 50),
                historyCount: currentHistory.length
              });

              // Call AI API with timeout
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 second timeout

              const response = await fetch('/api/voice-assistant/ai', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Tenant-Key': tenantKey,
                },
                body: JSON.stringify({
                  userMessage: messageToSend,
                  history: currentHistory
                }),
                signal: controller.signal
              });

              clearTimeout(timeoutId);

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API Error:', response.status, errorData);
                throw new Error(errorData.error || 'خطا در دریافت پاسخ از AI');
              }

              const data = await response.json();
              console.log('✅ AI Response received');
              const responseText = data.response || 'متاسفانه نتوانستم پاسخ مناسبی تولید کنم.';

              // Add to history
              dispatch({
                type: 'ADD_MESSAGE',
                payload: {
                  user: finalTranscript,
                  robin: responseText,
                  timestamp: new Date(),
                },
              });

              // Play audio response
              dispatch({ type: 'SET_PLAYING', payload: true });
              setButtonText('در حال پخش...');

              try {
                await playAudio(responseText);
              } catch (audioError) {
                console.error('Audio playback failed:', audioError);
                dispatch({
                  type: 'SET_ERROR',
                  payload: 'پاسخ دریافت شد اما پخش صدا ناموفق بود.'
                });
              }

              dispatch({ type: 'SET_PLAYING', payload: false });

              // Auto-restart listening after response
              setTimeout(() => {
                if (state.microphonePermission) {
                  dispatch({ type: 'SET_LISTENING', payload: true });
                  startListeningProcess();
                }
              }, 500);

            } catch (error: any) {
              console.error('❌ Error processing message:', error);
              
              let errorMessage = 'خطا در پردازش پیام. لطفاً دوباره تلاش کنید.';
              
              if (error.name === 'AbortError') {
                errorMessage = 'درخواست طولانی شد و قطع شد. لطفاً دوباره تلاش کنید.';
              } else if (error.message) {
                errorMessage = error.message;
              }
              
              dispatch({
                type: 'SET_ERROR',
                payload: errorMessage
              });
              setButtonText('شروع گفتگو');
            } finally {
              dispatch({ type: 'SET_PROCESSING', payload: false });
              dispatch({ type: 'SET_CURRENT_MESSAGE', payload: '' });
            }
          } else {
            // Auto-restart listening if no speech detected
            setTimeout(() => {
              if (state.microphonePermission) {
                dispatch({ type: 'SET_LISTENING', payload: true });
                startListeningProcess();
              }
            }, 500);
          }
        },
        onError: (error: string) => {
          dispatch({ type: 'SET_LISTENING', payload: false });
          dispatch({ type: 'SET_ERROR', payload: error });
          setButtonText('شروع گفتگو');

          // Auto-restart listening after error
          setTimeout(() => {
            dispatch({ type: 'SET_LISTENING', payload: true });
            startListeningProcess();
          }, 2000);
        },
      });
    } catch (error) {
      dispatch({ type: 'SET_LISTENING', payload: false });
      dispatch({
        type: 'SET_ERROR',
        payload: 'خطا در راه‌اندازی میکروفون. لطفاً دوباره تلاش کنید.'
      });
      setButtonText('شروع گفتگو');
    }
  };

  const handleMicrophoneClick = async () => {
    // Enable audio on first user interaction
    await enableAudio();
    
    if (state.isListening) {
      // Stop listening
      stopListening(recognitionRef.current);
      dispatch({ type: 'SET_LISTENING', payload: false });
      setButtonText('شروع گفتگو');
      autoStartRef.current = false;
    } else if (state.isProcessing || state.isPlaying) {
      // Cannot start while processing or playing
      return;
    } else {
      // Start listening manually
      dispatch({ type: 'SET_LISTENING', payload: true });
      startListeningProcess();
      setButtonText('در حال گوش دادن...');
    }
  };

  const getButtonState = () => {
    if (state.isListening) return 'listening';
    if (state.isProcessing) return 'processing';
    if (state.isPlaying) return 'playing';
    return 'ready';
  };

  const getButtonClasses = () => {
    const baseClasses = 'w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl transition-all duration-300 flex flex-col items-center justify-center text-white font-bold';

    switch (getButtonState()) {
      case 'listening':
        return `${baseClasses} bg-yellow-500 animate-pulse cursor-pointer`;
      case 'processing':
        return `${baseClasses} bg-orange-500 cursor-not-allowed`;
      case 'playing':
        return `${baseClasses} bg-blue-500 animate-pulse cursor-not-allowed`;
      default:
        return `${baseClasses} bg-green-600 hover:bg-green-700 cursor-pointer`;
    }
  };

  const renderIcon = () => {
    const iconSize = 32;

    switch (getButtonState()) {
      case 'listening':
        return <Mic size={iconSize} className="mb-1" />;
      case 'processing':
        return <Loader2 size={iconSize} className="mb-1 animate-spin" />;
      case 'playing':
        return <Volume2 size={iconSize} className="mb-1" />;
      default:
        return state.microphonePermission ?
          <Mic size={iconSize} className="mb-1" /> :
          <MicOff size={iconSize} className="mb-1" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-200">
      {/* Header */}
      <header className="text-center py-8 relative">
        <h1 className="text-4xl font-bold text-green-800 mb-2">
          دستیار رابین
        </h1>
        <p className="text-lg text-green-600">
          دستیار هوشمند صوتی شما
        </p>
        
        {/* History Toggle Button */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="absolute top-8 left-8 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-green-600 hover:text-green-800"
          title="نمایش تاریخچه گفتگو"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        <div className="flex justify-center">
          {/* Microphone Button - Always Center */}
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-6">
              {/* Status Message */}
              {state.currentMessage && (
                <div className="bg-white p-4 rounded-lg shadow-lg max-w-md text-center animate-fade-in">
                  <p className="text-green-800 font-medium">
                    "{state.currentMessage}"
                  </p>
                </div>
              )}

              {/* Main Microphone Button */}
              <button
                onClick={handleMicrophoneClick}
                disabled={state.isProcessing}
                className={getButtonClasses()}
              >
                {renderIcon()}
                <span className="text-xs mt-1 px-2 text-center leading-tight">
                  {buttonText}
                </span>
              </button>

              {/* Error Message */}
              {state.error && (
                <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg max-w-md text-center">
                  <p className="text-sm">{state.error}</p>
                </div>
              )}

              {/* Simple Status */}
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                  state.microphonePermission ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ml-2 ${
                    state.microphonePermission ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  {state.microphonePermission ? 'آماده برای گفتگو' : 'میکروفون غیرفعال'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Chat History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-green-800">تاریخچه گفتگو</h2>
              <div className="flex items-center gap-2">
                {state.history.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('آیا مطمئن هستید که می‌خواهید تاریخچه را پاک کنید؟')) {
                        dispatch({ type: 'CLEAR_HISTORY' });
                        // پاک کردن از localStorage
                        if (typeof window !== 'undefined') {
                          localStorage.removeItem(`voice-history-${tenantKey}`);
                          console.log('🗑️ History cleared from storage');
                        }
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    پاک کردن
                  </button>
                )}
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {state.history.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>هنوز گفتگویی ثبت نشده است</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.history.map((msg, index) => (
                    <div key={index} className="space-y-2">
                      {/* User Message */}
                      <div className="flex justify-end">
                        <div className="bg-green-100 text-green-800 rounded-lg p-3 max-w-[80%]">
                          <p className="text-sm font-semibold mb-1">شما:</p>
                          <p>{msg.user}</p>
                        </div>
                      </div>
                      {/* Robin Response */}
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-800 rounded-lg p-3 max-w-[80%]">
                          <p className="text-sm font-semibold mb-1">رابین:</p>
                          <p>{msg.robin}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-8 mt-16">
        <p className="text-green-600">
          میکروفون خودکار فعال است - فقط شروع به صحبت کنید
        </p>
      </footer>
    </div>
  );
}
