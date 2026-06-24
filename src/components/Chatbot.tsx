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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Impossible de joindre le service de discussion.");
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
      const errorMessage = err.message || "Désolé, j'ai une petite difficulté technique de connexion. Pourriez-vous réessayer dans un instant ?";

      setMessages(prev => {
        const last = prev[prev.length - 1];
        // If we already started showing a model response, keep it and maybe append error
        if (last && last.role === 'model' && !last.isWelcome && isStreaming) {
          return prev;
        }
        return [...prev, {
          role: 'model',
          text: `${errorMessage}\n\nVous pouvez aussi nous contacter directement au **+243 997 707 312** 📞.`
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
    // 1. Pre-process: Strip markdown card wraps if they exist (sometimes agent adds them redundantly)
    let processedText = text.trim();
    if (processedText.startsWith('```markdown')) {
      processedText = processedText.replace(/^```markdown\n?/, '').replace(/\n?```$/, '').trim();
    } else if (processedText.startsWith('```')) {
      processedText = processedText.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim();
    }

    const lines = processedText.split('\n');
    return lines.map((line, idx) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <div key={idx} className="h-2" />;

      // Handle Bullet Points
      const isBullet = trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || trimmedLine.startsWith('• ');
      const isNumbered = /^\d+\.\s/.test(trimmedLine);
      const isHeader = trimmedLine.startsWith('#');

      let content = trimmedLine;
      if (isBullet) content = trimmedLine.substring(2);
      else if (isNumbered) content = trimmedLine.replace(/^\d+\.\s/, '');
      else if (isHeader) {
        const match = trimmedLine.match(/^(#+)\s+(.*)$/);
        if (match) {
          const level = match[1].length;
          content = match[2];
          const headerClasses = level === 1 ? 'text-lg font-black' : level === 2 ? 'text-base font-bold' : 'text-sm font-bold';
          return (
            <h3 key={idx} className={`${headerClasses} mt-3 mb-1.5 ${isUser ? 'text-white' : 'text-brand-dark'}`}>
              {content}
            </h3>
          );
        }
      }

      // Parse inline styles: **bold** and *italic*
      const parseInline = (chunk: string) => {
        const parts = [];
        let lastIndex = 0;
        // Regex for bold **text** or __text__, and italic *text* or _text_
        const inlineRegex = /(\*\*|__|\*|_)(.*?)\1/g;
        let match;

        while ((match = inlineRegex.exec(chunk)) !== null) {
          if (match.index > lastIndex) {
            parts.push(chunk.substring(lastIndex, match.index));
          }
          const tag = match[1];
          const innerText = match[2];

          if (tag === '**' || tag === '__') {
            parts.push(
              <strong key={match.index} className={`font-bold ${isUser ? 'text-white underline decoration-white/30' : 'text-brand-dark'}`}>
                {innerText}
              </strong>
            );
          } else {
            parts.push(<em key={match.index} className="italic">{innerText}</em>);
          }
          lastIndex = inlineRegex.lastIndex;
        }

        if (lastIndex < chunk.length) {
          parts.push(chunk.substring(lastIndex));
        }
        return parts.length > 0 ? parts : chunk;
      };

      const renderedContent = parseInline(content);

      if (isBullet || isNumbered) {
        return (
          <div key={idx} className="flex gap-2.5 mb-1.5 pl-1">
            <span className={`shrink-0 font-bold ${isUser ? 'text-white/70' : 'text-brand-green'}`}>
              {isBullet ? '•' : line.match(/^(\d+\.)/)?.[1]}
            </span>
            <div className={`leading-relaxed text-sm ${isUser ? 'text-white/95' : 'text-gray-800'}`}>
              {renderedContent}
            </div>
          </div>
        );
      }

      return (
        <p key={idx} className={`leading-relaxed text-sm mb-2 ${isUser ? 'text-white/95' : 'text-gray-800'}`}>
          {renderedContent}
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
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Left Side Panel - Information & Aesthetics */}
        <div className={`
          fixed inset-y-0 left-0 z-[70] w-[280px] lg:relative lg:w-1/3 xl:w-1/4 bg-brand-dark text-white p-8 border-r border-white/10 shrink-0 select-text overflow-y-auto chat-left-panel transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 flex'}
          inline-flex flex-col
        `}>
          {/* Logo & Info */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-green/20 border border-brand-green/30 flex items-center justify-center text-brand-green">
                <img src={logoIcon} alt="CAPSY" className="w-7 h-7 rounded-full object-cover" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wider text-white font-poppins">CAPSY SERVICES</h1>
                <p className="text-[10px] text-white/50 font-medium">Santé Mentale & Innovation</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-white/50 hover:text-white"
            >
              <LucideIcon name="X" className="w-6 h-6" />
            </button>
          </div>

          {/* Back to Home page */}
          <a
            href="/"
            className="mb-8 flex items-center gap-2.5 px-4.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-white/90 font-bold text-xs transition-all border border-white/10 backdrop-blur-md cursor-pointer self-start"
          >
            <LucideIcon name="ChevronLeft" className="w-4 h-4 text-brand-green" />
            Retourner au site principal
          </a>


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
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Menu"
              >
                <LucideIcon name="ChevronRight" className="w-5 h-5 md:hidden" />
                <LucideIcon name="ChevronLeft" className="w-5 h-5 hidden md:block" />
              </button>

              <a
                href="/"
                className="w-10 h-10 rounded-full bg-brand-green/20 border border-brand-green/30 flex items-center justify-center text-brand-green relative shrink-0 cursor-pointer"
              >
                <img src={logoIcon} alt="CAPSY" className="w-7 h-7 rounded-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-brand-dark" />
              </a>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-1.5 font-poppins">
                  CAPSY <span className="hidden sm:inline">Assistant IA</span>
                  <LucideIcon name="Sparkles" className="w-3.5 h-3.5 text-brand-green" />
                </h2>
                <p className="text-[10px] sm:text-xs text-white/60 line-clamp-1">Discussions, orientation & évaluation du stress en RDC</p>
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
                <LucideIcon name="RefreshCw" className="w-3.5 h-3.5 text-brand-green" />
                <span className="hidden sm:inline">Démarrer à zéro</span>
              </button>
            </div>
          </div>


          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 select-text chat-feed-viewport" id="chatbot-messages-feed" style={{ scrollBehavior: 'smooth' }}>
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, i) => {
                const isModel = msg.role === 'model';
                return (
                  <div key={i} className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}>
                    <div className={`flex gap-3 max-w-[85%] ${isModel ? '' : 'flex-row-reverse'}`}>
                      <div className={`hidden md:flex w-8 h-8 rounded-full items-center justify-center shrink-0 ${isModel ? 'bg-brand-green/10 text-brand-green border border-brand-green/20' : 'bg-brand-wellbeing/10 text-brand-wellbeing border border-brand-wellbeing/20'}`}>
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
                        <span className="hidden md:inline text-[10px] text-brand-gray-text font-mono px-1">
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
                    <div className="hidden md:flex w-8 h-8 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 items-center justify-center shrink-0">
                      <img src={logoIcon} alt="CAPSY" className="w-5 h-5 rounded-full object-cover" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <div className="bg-gray-50 border border-gray-150 rounded-2xl rounded-tl-none px-5 py-4 flex items-center space-x-2 shadow-sm">
                        <span className="w-2 h-2.5 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2.5 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2.5 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="hidden md:inline text-[10px] text-brand-gray-text font-mono px-1">CAPSY réfléchit...</span>
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
            className="px-4.5 pt-2 pb-3 bg-white shrink-0"
          >
            <div className="max-w-3xl mx-auto rounded-[28px] border border-brand-green/30 bg-gray-50/30 p-1.5 md:p-2 focus-within:border-brand-green transition-all shadow-sm">
              <div className="flex items-end gap-2 px-3">
                <textarea
                  rows={1}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(inputVal);
                    }
                  }}
                  placeholder="Posez une question à CAPSY AI"
                  disabled={isLoading}
                  className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400/80 placeholder:text-[13px] resize-none overflow-hidden min-h-[40px] py-3"
                  style={{ height: 'auto' }}
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || isLoading}
                  className="mb-1.5 w-10 h-10 rounded-xl bg-brand-green/50 text-white hover:bg-brand-green flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shadow-sm shrink-0"
                >
                  <LucideIcon name="Send" className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-1 px-2 pb-1 border-t border-brand-green/10 mt-1 pt-1">
                <button type="button" className="p-1.5 md:p-2 text-gray-500 hover:text-brand-green transition-colors"><LucideIcon name="Plus" className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                <button type="button" className="p-1.5 md:p-2 text-gray-500 hover:text-brand-green transition-colors"><LucideIcon name="Mic" className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                <button type="button" className="p-1.5 md:p-2 text-gray-500 hover:text-brand-green transition-colors"><LucideIcon name="Phone" className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 sm:right-6 sm:bottom-6 left-6 sm:left-auto z-50 font-sans flex flex-col items-center sm:items-end" id="capsy-chatbot-container">
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
          className="flex flex-col w-[calc(100vw-2rem)] sm:w-100 h-[75vh] sm:h-137.5 max-h-[85vh] rounded-2xl bg-white border border-gray-150 shadow-2xl overflow-hidden transition-all duration-300 fixed bottom-24 left-4 right-4 sm:relative sm:bottom-0 sm:left-auto sm:right-0"
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
                  CAPSY <span className="hidden sm:inline">IA</span>
                  <LucideIcon name="Sparkles" className="w-3.5 h-3.5 text-brand-green" />
                </h4>
                <p className="text-[10px] text-white/60 line-clamp-1">Écoute active & orientation</p>
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

                  <span className="hidden md:inline text-[9px] text-brand-gray-text px-1 font-mono">
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
                <span className="hidden md:inline text-[9px] text-brand-gray-text px-1 font-mono">CAPSY écrit...</span>
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
            className="px-4 pb-4 bg-white shrink-0"
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-2xl border border-brand-green/30 px-4 py-1.5 focus-within:border-brand-green transition-all">
                <textarea
                  rows={1}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(inputVal);
                    }
                  }}
                  placeholder="Posez une question..."
                  disabled={isLoading}
                  className="w-full text-sm bg-transparent outline-none placeholder:text-gray-400/80 placeholder:text-[12px] resize-none overflow-hidden min-h-[32px] py-1.5 pt-2"
                />
              </div>
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="w-11 h-11 rounded-2xl bg-brand-green/50 text-white hover:bg-brand-green flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <LucideIcon name="Send" className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
