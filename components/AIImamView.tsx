import React, { useState, useRef, useEffect } from 'react';
import { askAIImam } from '../services/geminiService';
import { Language } from '../types';
import { Send, User, Bot, Sparkles } from 'lucide-react';

interface AIImamViewProps {
  lang: Language;
  labels: any;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIImamView: React.FC<AIImamViewProps> = ({ lang, labels }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: lang === 'kk' ? 'Ассалаумағалейкум! Мен сіздің виртуалды көмекшіңізбін. Ислам туралы сұрақтарыңыз болса, қойыңыз.' : 'Ассаляму алейкум! Я ваш виртуальный помощник.' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const answer = await askAIImam(userMsg, lang);
    setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    setLoading(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full text-current">
      <div className="flex-1 overflow-y-auto space-y-6 p-6 custom-scrollbar" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            <div className={`flex items-end max-w-[90%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-emerald-500 border-emerald-400 text-white' 
                    : 'bg-white/10 border-white/20 text-emerald-200'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>

              {/* Bubble */}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm border backdrop-blur-sm ${
                msg.role === 'user' 
                  ? 'bg-emerald-600/90 text-white rounded-br-sm border-emerald-500/50' 
                  : 'bg-white/10 text-white rounded-bl-sm border-white/10'
              }`}>
                 {msg.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex items-end space-x-3">
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Bot size={14} className="text-emerald-200" />
               </div>
               <div className="bg-white/5 p-4 rounded-2xl rounded-bl-sm border border-white/10">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 flex-none bg-black/20 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.askQuestion}
            className="w-full pl-5 pr-14 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder-white/30 text-white shadow-inner"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 transition-all shadow-lg active:scale-90"
          >
            {loading ? <Sparkles size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIImamView;