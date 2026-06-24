import React, { useState, useRef, useEffect } from 'react';
import LucideIcon from './LucideIcon';
import logoIcon from '../assets/images/capsy-icon-new.png';

interface Message {
  role: 'user' | 'model';
  text: string;
  suggestedServiceId?: string;
  isWelcome?: boolean;
}

interface ChatbotProps {
  onOpenBooking: (serviceId?: string) => void;
  isFullScreen?: boolean;
}

export default function Chatbot({ onOpenBooking, isFullScreen = false }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('capsy_chat_history');
      return saved ? JSON.parse(saved) : [
        {
          role: 'model',
          text: "Bonjour ! Je suis **CAPSY**, votre conseiller virtuel d'écoute et d'orientation 💚.\n\nJe suis là pour vous accompagner de manière confidentielle et sans jugement. Vous pouvez :\n- Réaliser un **test interactif de votre niveau de stress** 📊.\n- Vous informer sur nos **services de psychothérapie et nos tarifs** 💼.\n- Faciliter la **prise de rendez-vous** avec un de nos cliniciens 📅.\n\nComment puis-je vous aider aujourd'hui ?",
          isWelcome: true
        }
      ];
    } catch (e) {
      return [
        {
          role: 'model',
          text: "Bonjour ! Je suis **CAPSY**, votre conseiller virtuel d'écoute et d'orientation 💚.\n\nJe suis là pour vous accompagner de manière confidentielle et sans jugement. Vous pouvez :\n- Réaliser un **test interactif de votre niveau de stress** 📊.\n- Vous informer sur nos **services de psychothérapie et nos tarifs** 💼.\n- Faciliter la **prise de rendez-vous** avec un de nos cliniciens 📅.\n\nComment puis-je vous aider aujourd'hui ?",
          isWelcome: true
        }
      ];
    }
  });
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const clinicians = [
    { name: 'Jacques Batenga', role: 'Psychologue Clinicien Principal' },
    { name: 'Josué Kasereka Shamamba', role: 'Psychologue Praticien' },
    { name: 'Samuel Kasereka Musisiva', role: 'Psychologue & Superviseur' }
  ];

  const ethicalValues = ['Non-marchandisation', 'Confidentialité', 'Dignité', 'Bienveillance', 'Éthique'];

  // Auto scroll to latest response
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen || isFullScreen) {
      setUnreadCount(0);
      setTimeout(scrollToBottom, 50);
    }
  }, [isOpen, isFullScreen, messages]);

  // Persist messages to localStorage
  useEffect(() => {
    localStorage.setItem('capsy_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  // Handle parsing special [SUGGEST_BOOKING:id] blocks from response
  const parseMessageText = (rawText: string) => {
    const suggestRegex = /\[SUGGEST_BOOKING:([a-zA-Z0-9_-]+)\]/g;
    let cleanText = rawText;
    let serviceId: string | undefined;

    const match = suggestRegex.exec(rawText);
    if (match) {
      serviceId = match[1];
      // Clean up all instances of the bracket code from displayed output
      cleanText = rawText.replace(suggestRegex, '').trim();
    }

    return { cleanText, serviceId };
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // Add user message locally
    const newUserMsg: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, newUserMsg]);
    setInputVal('');
    setIsLoading(true);
    setIsStreaming(false);

    try {
      // Filter out system welcome markers or empty strings before sending to API
      const historyPayload = messages
        .filter(m => !m.isWelcome)
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error("Impossible de joindre le service de discussion.");
      }

      // Read the stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullStreamText = "";
      let displayedText = "";
      let modelMessageAdded = false;
      let isStreamFinished = false;

      if (!reader) throw new Error("Flux non disponible");

      // Shared update function for smooth typing
      const processDisplayedText = async () => {
        while (!isStreamFinished || displayedText.length < fullStreamText.length) {
          if (displayedText.length < fullStreamText.length) {
            // Add a chunk of characters (e.g., 2-4) for smoothness without being too slow
            const charsToAdd = fullStreamText.length - displayedText.length > 10 ? 5 : 2;
            displayedText += fullStreamText.slice(displayedText.length, displayedText.length + charsToAdd);

            setMessages(prev => {
              const newMsgs = [...prev];
              if (!modelMessageAdded) {
                newMsgs.push({ role: 'model', text: displayedText });
                modelMessageAdded = true;
                setIsStreaming(true);
              } else {
                newMsgs[newMsgs.length - 1] = {
                  ...newMsgs[newMsgs.length - 1],
                  text: displayedText
                };
              }
              return newMsgs;
            });
            // Delay between each character group to create the typing effect
            await new Promise(resolve => setTimeout(resolve, 15));
          } else {
            // Briefly wait for more data to arrive in fullStreamText
            await new Promise(resolve => setTimeout(resolve, 30));
          }
        }
      };

      // Start the typing effect loop in parallel
      const typingPromise = processDisplayedText();

      // Read from the network stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                fullStreamText += data.text;
                // fullStreamText is updated, processDisplayedText loop will pick it up
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) { }
          }
        }
      }

      isStreamFinished = true;
      await typingPromise; // Wait for typing to finish showing everything

      // Final pass to check for service suggestions and clean up
      const { cleanText, serviceId } = parseMessageText(fullStreamText);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = {
          ...newMsgs[newMsgs.length - 1],
          text: cleanText,
          suggestedServiceId: serviceId
        };
        return newMsgs;
      });

    } catch (err: any) {
      console.error("Chatbot response error:", err);
      // If we already added a model message but it failed mid-stream
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'model' && !last.isWelcome) {
          return prev; // keep what we have
        }
        return [...prev, {
          role: 'model',
          text: "Désolé, j'encours des difficultés de réseau en ce moment. Vous pouvez toujours nous appeler ou écrire directement au +243 997 707 312 📞."
        }];
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleSuggestClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const renderMessageContent = (text: string, isUser?: boolean) => {
    // Simple robust markdown parsing for **bold** and newlines
    const paragraphs = text.split('\n');
    return paragraphs.map((p, idx) => {
      if (!p.trim()) return <div key={idx} className="h-2" />;

      // Parse **bold** phrases safely
      const parts = [];
      let lastIndex = 0;
      const boldRegex = /\*\*([^*]+)\*\*/g;
      let match;

      while ((match = boldRegex.exec(p)) !== null) {
        if (match.index > lastIndex) {
          parts.push(p.substring(lastIndex, match.index));
        }
        parts.push(
          <strong
            key={match.index}
            className={`font-bold ${isUser ? 'text-white underline decoration-white/30' : 'text-brand-dark'}`}
          >
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < p.length) {
        parts.push(p.substring(lastIndex));
      }

      return (
        <p key={idx} className={`leading-relaxed text-sm mb-1 ${isUser ? 'text-white/95' : 'text-gray-800'}`}>
          {parts.length > 0 ? parts : p}
        </p>
      );
    });
  };

  const translateServiceId = (id: string): { name: string; urlId: string } => {
    switch (id) {
      case 'individuelle': return { name: 'Séance Individuelle (40 USD)', urlId: 'individuelle' };
      case 'couple': return { name: 'Thérapie de Couple (65 USD)', urlId: 'couple' };
      case 'familiale': return { name: 'Thérapie Familiale (100 USD)', urlId: 'familiale' };
      case 'enfants_ados': return { name: 'Accompagnement Enfants/Ados (30 USD)', urlId: 'enfants-ados' };
      case 'post_incident': return { name: 'Soutien Post-Incident (55 USD)', urlId: 'post-incident' };
      case 'supervision': return { name: 'Supervision Clinique (70 USD)', urlId: 'supervision' };
      default: return { name: 'Prendre rendez-vous', urlId: '' };
    }
  };

  if (isFullScreen) {
    return (
      <div className="flex flex-col md:flex-row h-screen w-screen bg-gray-50 text-brand-dark overflow-hidden font-sans select-none" id="capsy-fullscreen-chat-workspace">
        {/* Left Side Panel - Information & Aesthetics */}
        <div className="hidden lg:flex flex-col lg:w-1/3 xl:w-1/4 bg-brand-dark text-white p-8 border-r border-white/10 shrink-0 select-text overflow-y-auto chat-left-panel">
          {/* Logo & Info */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-brand-green/20 border border-brand-green/30 flex items-center justify-center text-brand-green">
              <img src={logoIcon} alt="CAPSY" className="w-7 h-7 rounded-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-white font-poppins">CAPSY SERVICES</h1>
              <p className="text-[10px] text-white/50 font-medium">Santé Mentale & Innovation</p>
            </div>
          </div>

          {/* Back to Home page */}
          <a
            href="/"
            className="mb-8 flex items-center gap-2.5 px-4.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-white/90 font-bold text-xs transition-all border border-white/10 backdrop-blur-md cursor-pointer self-start"
          >
            <LucideIcon name="ChevronLeft" className="w-4 h-4 text-brand-green" />
            Retourner au site principal
          </a>

          {/* Emergency Alert Panel */}
          <div className="mb-8 bg-red-500/10 border border-red-500/25 rounded-2xl p-4.5">
            <span className="flex items-center gap-2 text-xs font-black text-red-400 uppercase tracking-wider mb-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping shrink-0" />
              Urgence Psychosociale RDC
            </span>
            <p className="text-xs text-white/80 leading-relaxed mb-3">
              Si vous traversez une crise psychosociale majeure de désespoir ou de fatigue extrême, vous n'êtes pas seul. Contactez-nous immédiatement :
            </p>
            <div className="flex flex-col gap-1.5 font-mono text-xs text-brand-green">
              <div className="flex items-center gap-2">
                <LucideIcon name="Phone" className="w-3.5 h-3.5 text-brand-green" />
                <a href="tel:+243997707312" className="hover:underline text-white/95 font-bold">+243 997 707 312</a>
              </div>
              <div className="flex items-center gap-2">
                <LucideIcon name="Lock" className="w-3.5 h-3.5 text-brand-green" />
                <span className="text-white/70">Secret professionnel garanti</span>
              </div>
            </div>
          </div>

          {/* Dedicated Psychologists Profile */}
          <div className="mb-8 space-y-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2">
              <LucideIcon name="Users" className="w-3.5 h-3.5 text-brand-green" />
              Nos Cliniciens Référents
            </h3>

            <div className="space-y-3">
              {clinicians.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all">
                  <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center font-bold text-xs text-brand-green border border-brand-green/25">
                    {c.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{c.name}</h4>
                    <p className="text-[10px] text-white/50">{c.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ethical Values */}
          <div className="mt-auto pt-6 border-t border-white/5">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
              <LucideIcon name="ShieldCheck" className="w-3.5 h-3.5 text-brand-green" />
              Piliers de CAPSY
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {ethicalValues.map((val, idx) => (
                <span key={idx} className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-white/70 border border-white/10 font-medium">
                  {val}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Panel - The Full screen Interactive Exchange space */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          {/* Top Bar for Chat */}
          <div className="bg-brand-dark px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3.5">
              <a
                href="/"
                className="lg:hidden p-2 rounded-xl bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Retour"
              >
                <LucideIcon name="ChevronLeft" className="w-5 h-5" />
              </a>

              <div className="w-10 h-10 rounded-full bg-brand-green/20 border border-brand-green/30 flex items-center justify-center text-brand-green relative shrink-0">
                <img src={logoIcon} alt="CAPSY" className="w-7 h-7 rounded-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-brand-dark" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-1.5 font-poppins">
                  CAPSY Assistant IA
                  <LucideIcon name="Sparkles" className="w-3.5 h-3.5 text-brand-green" />
                </h2>
                <p className="text-[10px] sm:text-xs text-white/60">Discussions, orientation & évaluation du stress en RDC</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm("Voulez-vous réinitialiser cette discussion ?")) {
                    const initialMsg: Message[] = [
                      {
                        role: 'model',
                        text: "Bonjour ! Je suis **CAPSY**, votre conseiller virtuel d'écoute et d'orientation 💚.\n\nJe suis là pour vous accompagner de manière confidentielle et sans jugement. Vous pouvez :\n- Réaliser un **test interactif de votre niveau de stress** 📊.\n- Vous informer sur nos **services de psychothérapie et nos tarifs** 💼.\n- Faciliter la **prise de rendez-vous** avec un de nos cliniciens 📅.\n\nComment puis-je vous aider aujourd'hui ?",
                        isWelcome: true
                      }
                    ];
                    setMessages(initialMsg);
                    localStorage.setItem('capsy_chat_history', JSON.stringify(initialMsg));
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-xs text-white/95 font-bold transition-all border border-white/10 cursor-pointer flex items-center gap-1.5"
                title="Nouvelle discussion"
              >
                <LucideIcon name="X" className="w-3.5 h-3.5 text-red-400" />
                Démarrer à zéro
              </button>
            </div>
          </div>

          <div className="lg:hidden bg-red-500/10 border-b border-red-500/20 px-4 py-2.5 flex items-center justify-between shrink-0">
            <span className="text-[11px] font-black text-red-600 flex items-center gap-1.5 uppercase">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0" />
              Urgence Psycho :
            </span>
            <a href="tel:+243997707312" className="text-xs font-mono font-black text-red-600 hover:underline">
              +243 997 707 312
            </a>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 select-text chat-feed-viewport" id="chatbot-messages-feed" style={{ scrollBehavior: 'smooth' }}>
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, i) => {
                const isModel = msg.role === 'model';
                return (
                  <div key={i} className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}>
                    <div className={`flex gap-3 max-w-[85%] ${isModel ? '' : 'flex-row-reverse'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isModel ? 'bg-brand-green/10 text-brand-green border border-brand-green/20' : 'bg-brand-wellbeing/10 text-brand-wellbeing border border-brand-wellbeing/20'}`}>
                        {isModel ? <img src={logoIcon} alt="CAPSY" className="w-6 h-6 rounded-full object-cover" /> : <LucideIcon name="User" className="w-4 h-4" />}
                      </div>

                      <div className="flex flex-col space-y-1">
                        <div
                          className={`rounded-2xl px-5 py-4 text-sm md:text-base leading-relaxed shadow-sm ${isModel
                            ? 'bg-gray-50 border border-gray-150 text-gray-800 rounded-tl-none font-normal'
                            : 'bg-brand-wellbeing text-white rounded-tr-none font-medium'
                            }`}
                        >
                          {renderMessageContent(msg.text, !isModel)}

                          {isModel && msg.suggestedServiceId && (
                            <div className="mt-4 pt-3 border-t border-brand-gray/10 flex flex-col items-stretch">
                              <p className="text-[11px] text-brand-gray-text font-bold mb-2.5 flex items-center gap-1.5">
                                <LucideIcon name="Target" className="w-3.5 h-3.5 text-brand-green" />
                                Recommandation pour votre bien-être :
                              </p>
                              <a
                                href={`/?booking=${translateServiceId(msg.suggestedServiceId!).urlId}`}
                                className="w-full sm:w-auto self-start bg-brand-green hover:bg-brand-green-dark text-white font-black text-xs md:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-[1.02]"
                              >
                                <LucideIcon name="Calendar" className="w-4 h-4 text-white" />
                                {`Réserver une Consultation (${translateServiceId(msg.suggestedServiceId!).name.replace(/\D/g, '')} USD)`}
                              </a>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-brand-gray-text font-mono px-1">
                          {isModel ? 'CAPSY' : 'Vous'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && !isStreaming && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 flex items-center justify-center shrink-0">
                      <img src={logoIcon} alt="CAPSY" className="w-5 h-5 rounded-full object-cover" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <div className="bg-gray-50 border border-gray-150 rounded-2xl rounded-tl-none px-5 py-4 flex items-center space-x-2 shadow-sm">
                        <span className="w-2 h-2.5 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2.5 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2.5 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[10px] text-brand-gray-text font-mono px-1">CAPSY réfléchit...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="py-2 bg-gray-50/50 border-t border-gray-100 shrink-0">
            <div className="max-w-3xl mx-auto px-4 flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto md:overflow-x-visible scrollbar-none">
              <button
                onClick={() => handleSuggestClick("📋 Évaluer mon niveau de stress")}
                className="px-3.5 py-1.5 text-[11px] font-semibold border border-brand-green/20 hover:border-brand-green text-brand-dark bg-brand-green/5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer hover:bg-brand-green/10"
              >
                📊 Évaluer mon stress
              </button>
              <button
                onClick={() => handleSuggestClick("💼 Quels sont les types de services et les tarifs ?")}
                className="px-3.5 py-1.5 text-[11px] font-semibold border border-brand-green/20 hover:border-brand-green text-brand-dark bg-brand-green/5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer hover:bg-brand-green/10"
              >
                💼 Tarifs & Services
              </button>
              <button
                onClick={() => handleSuggestClick("📍 Où se trouvent vos centres de consultation ?")}
                className="px-3.5 py-1.5 text-[11px] font-semibold border border-brand-green/20 hover:border-brand-green text-brand-dark bg-brand-green/5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer hover:bg-brand-green/10"
              >
                📍 Adresses d'écoute en RDC
              </button>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputVal);
            }}
            className="px-4.5 pt-2 pb-3 bg-white border-t border-gray-150 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]"
          >
            <div className="max-w-3xl mx-auto relative">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Écrivez votre message..."
                disabled={isLoading}
                className="w-full text-sm md:text-base bg-gray-50 border border-gray-200 focus:border-brand-green focus:bg-white px-5 py-3.5 rounded-full outline-none transition-all placeholder:text-gray-400 text-gray-800 pr-15"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-brand-green text-white hover:bg-brand-green-dark flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                aria-label="Envoyer"
              >
                <LucideIcon name="Send" className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-brand-gray-text/80 text-center mt-1 tracking-wide">
              🔒 Vos conversations avec l'IA sont entièrement confidentielles et temporaires.
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="capsy-chatbot-container">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-brand-green text-white shadow-xl hover:bg-brand-green-dark hover:scale-105 active:scale-95 transition-all outline-none border border-white/20 group cursor-pointer"
          id="btn-open-chatbot"
          aria-label="Discuter avec CAPSY IA"
        >
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-brand-wellbeing text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white animate-bounce">
              {unreadCount}
            </span>
          )}
          <LucideIcon name="MessageSquare" className="w-6 h-6 group-hover:rotate-6 transition-transform" />
          <span className="absolute right-16 bg-brand-dark/95 text-white/90 text-xs px-3 py-1.5 rounded-lg shadow-md font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            Besoin d'aide ? Discutons 💬
          </span>
        </button>
      )}

      {isOpen && (
        <div
          className="flex flex-col w-90 sm:w-100 h-137.5 max-h-[85vh] rounded-2xl bg-white border border-gray-150 shadow-2xl overflow-hidden transition-all duration-300 transform scale-100 origin-bottom-right"
          id="chatbot-window"
        >
          <div className="bg-brand-dark px-5 py-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-green/20 border border-brand-green/30 flex items-center justify-center text-brand-green shrink-0 relative">
                <img src={logoIcon} alt="CAPSY" className="w-7 h-7 rounded-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-brand-dark" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                  CAPSY Assistant IA
                  <LucideIcon name="Sparkles" className="w-3.5 h-3.5 text-brand-green" />
                </h4>
                <p className="text-[10px] text-white/60">Écoute active & orientation</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href="?chat=true"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                title="Ouvrir dans un nouvel onglet"
              >
                <LucideIcon name="Maximize2" className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                id="btn-close-chatbot"
                aria-label="Fermer la discussion"
              >
                <LucideIcon name="X" className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4" id="chatbot-messages-feed">
            {messages.map((msg, i) => {
              const isModel = msg.role === 'model';
              return (
                <div key={i} className={`flex flex-col ${isModel ? 'items-start' : 'items-end'} space-y-1`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isModel
                      ? 'bg-white border border-gray-150 text-gray-800 rounded-tl-none'
                      : 'bg-brand-wellbeing text-white rounded-tr-none font-medium'
                      }`}
                  >
                    {renderMessageContent(msg.text, !isModel)}

                    {isModel && msg.suggestedServiceId && (
                      <div className="mt-3.5 pt-2.5 border-t border-brand-gray/10 flex flex-col items-stretch">
                        <p className="text-[10px] text-brand-gray-text font-semibold mb-2 flex items-center gap-1.5">
                          <LucideIcon name="Target" className="w-3 h-3 text-brand-green" />
                          Orientation suggérée pour vous :
                        </p>
                        <button
                          onClick={() => {
                            onOpenBooking(translateServiceId(msg.suggestedServiceId!).urlId);
                            setIsOpen(false);
                          }}
                          className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-[1.02]"
                        >
                          <LucideIcon name="Calendar" className="w-3.5 h-3.5 text-white" />
                          {`Enregistrer un rendez-vous (${translateServiceId(msg.suggestedServiceId!).name.replace(/\D/g, '')} USD)`}
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-brand-gray-text px-1 font-mono">
                    {isModel ? 'CAPSY' : 'Vous'}
                  </span>
                </div>
              );
            })}

            {isLoading && !isStreaming && (
              <div className="flex flex-col items-start space-y-1">
                <div className="bg-white border border-gray-150 rounded-2xl rounded-tl-none px-4 py-3 flex items-center space-x-1.5 shadow-sm">
                  <span className="w-2 h-2 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[9px] text-brand-gray-text px-1 font-mono">CAPSY écrit...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 py-2 bg-white flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-none border-t border-gray-100">
            <button
              onClick={() => handleSuggestClick("📋 Évaluer mon niveau de stress")}
              className="px-2.5 py-1 text-[11px] font-medium border border-brand-green/20 hover:border-brand-green text-brand-dark bg-brand-green/5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer hover:bg-brand-green/10"
            >
              📊 Évaluer mon stress
            </button>
            <button
              onClick={() => handleSuggestClick("💼 Quels sont les types de services et les tarifs ?")}
              className="px-2.5 py-1 text-[11px] font-medium border border-brand-green/20 hover:border-brand-green text-brand-dark bg-brand-green/5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer hover:bg-brand-green/10"
            >
              💼 Tarifs & Services
            </button>
            <button
              onClick={() => handleSuggestClick("📍 Où se trouvent vos centres de consultation ?")}
              className="px-2.5 py-1 text-[11px] font-medium border border-brand-green/20 hover:border-brand-green text-brand-dark bg-brand-green/5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer hover:bg-brand-green/10"
            >
              📍 Adresses en RDC
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputVal);
            }}
            className="px-4.5 pt-3.5 pb-4 bg-white border-t border-gray-150 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]"
          >
            <div className="max-w-3xl mx-auto relative">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Écrivez votre message..."
                disabled={isLoading}
                className="w-full text-sm md:text-base bg-gray-50 border border-gray-200 focus:border-brand-green focus:bg-white px-5 py-4 rounded-full outline-none transition-all placeholder:text-gray-400 text-gray-800 pr-16"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-brand-green text-white hover:bg-brand-green-dark flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                aria-label="Envoyer"
              >
                <LucideIcon name="Send" className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-brand-gray-text/80 text-center mt-1 tracking-wide">
              🔒 Vos conversations avec l'IA sont entièrement confidentielles et temporaires.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
