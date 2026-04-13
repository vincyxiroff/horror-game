import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { motion } from 'motion/react';
import { Ghost, Radio, Battery, AlertTriangle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export function HUD() {
  const sanity = useGameStore((state) => state.sanity);
  const tension = useGameStore((state) => state.tension);
  const isFlashlightOn = useGameStore((state) => state.isFlashlightOn);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...history, { role: 'user', parts: [{ text: input }] }],
        config: {
          systemInstruction: "You are a mysterious presence in an abandoned house. You speak in riddles and cryptic warnings. You are the 'Ghost Radio'. You know the player is trapped. Be eerie, helpful but scary. Keep responses short."
        }
      });

      const responseText = response.text || "...static...";
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "...static... can't... hear... you..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col justify-between p-8 font-mono text-white">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-48 h-2 bg-gray-900 border border-gray-700 overflow-hidden">
              <motion.div 
                className="h-full bg-red-600"
                animate={{ width: `${sanity}%` }}
              />
            </div>
            <span className="text-xs uppercase tracking-widest opacity-70">Sanity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-48 h-2 bg-gray-900 border border-gray-700 overflow-hidden">
              <motion.div 
                className="h-full bg-blue-400"
                animate={{ width: `${tension}%` }}
              />
            </div>
            <span className="text-xs uppercase tracking-widest opacity-70">Tension</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4">
          <div className={`flex items-center gap-2 ${!isFlashlightOn ? 'opacity-30' : 'animate-pulse'}`}>
            <Battery className="w-5 h-5" />
            <span className="text-xs">FLASHLIGHT ACTIVE</span>
          </div>
          {tension > 70 && (
            <div className="flex items-center gap-2 text-red-500 animate-bounce">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-xs">SOMETHING IS NEAR</span>
            </div>
          )}
        </div>
      </div>

      {/* Ghost Radio (Chat) */}
      <div className="flex justify-end pointer-events-auto">
        <div className={`w-80 transition-all duration-500 ${isChatOpen ? 'h-96' : 'h-12'} bg-black/80 border border-white/10 rounded-lg overflow-hidden flex flex-col`}>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-full h-12 flex items-center justify-between px-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Radio className={`w-4 h-4 ${isChatOpen ? 'text-blue-400' : 'text-gray-400'}`} />
              <span className="text-xs uppercase tracking-tighter">Ghost Radio</span>
            </div>
            <span className="text-[10px] opacity-50">{isChatOpen ? 'CLOSE' : 'OPEN'}</span>
          </button>

          {isChatOpen && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.length === 0 && (
                  <p className="text-[10px] text-gray-500 italic text-center">The radio crackles with static...</p>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[8px] uppercase opacity-40 mb-1">{m.role === 'user' ? 'You' : 'Unknown'}</span>
                    <div className={`max-w-[80%] p-2 rounded text-[11px] ${m.role === 'user' ? 'bg-blue-900/40 text-blue-100' : 'bg-gray-800/60 text-gray-100'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isTyping && <div className="text-[10px] animate-pulse">...receiving signal...</div>}
                <div ref={chatEndRef} />
              </div>
              <div className="p-2 border-t border-white/5 flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Speak into the void..."
                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] outline-none focus:border-blue-500/50"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Vignette & Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_40%,black_100%)] opacity-60" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
