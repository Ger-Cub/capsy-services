import React, { useState } from 'react';
import { FAQS } from '../data/staticData';
import { motion, AnimatePresence } from 'motion/react';
import LucideIcon from './LucideIcon';

export default function Faqs() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-20 bg-brand-gray-light" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Alignment */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">FAQ — VOUS SOUHAITEZ COMPRENDRE ?</span>
          <h2 className="text-3xl font-poppins font-black text-brand-dark mt-1">
            Questions Fréquentes
          </h2>
          <p className="text-sm text-brand-gray-text mt-3">
            Tout ce qu'il faut savoir sur l'accompagnement, les consultations et le secret clinique professionnel chez Capsy Services.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-3.5" id="faqs-list">
          {FAQS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs transition-all hover:border-gray-300"
              >
                {/* Header Toggle Clicker */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-poppins font-bold text-brand-dark text-sm sm:text-base select-none cursor-pointer"
                >
                  <span className={`${isOpen ? 'text-brand-blue' : ''} transition-colors`}>
                    {item.question}
                  </span>
                  <div className={`p-1.5 rounded-xl bg-brand-gray-light text-brand-gray-text transition-transform duration-300 ${isOpen ? 'rotate-180 bg-brand-blue/10 text-brand-blue' : ''}`}>
                    <LucideIcon name="ChevronDown" className="h-4 w-4" />
                  </div>
                </button>

                {/* Content Area with dynamic Height expansion using motion */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-brand-gray-text leading-relaxed font-sans border-t border-gray-100">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Lower Banner Reassurance */}
        <div className="mt-10 p-5 rounded-2xl bg-[#EAF4ED] border border-brand-green/20 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left select-none">
          <div className="p-3 bg-[#D4EADE] text-brand-green rounded-full shrink-0">
            <LucideIcon name="Info" className="h-5 w-5" />
          </div>
          <p className="text-xs text-brand-dark leading-relaxed font-medium">
            Une question spécifique qui ne figure pas ici ? Aucun problème. Contactez notre accueil via WhatsApp au <span className="font-bold text-brand-green">+243 97 123 4567</span>. Nous vous répondrons en toute bienveillance.
          </p>
        </div>

      </div>
    </section>
  );
}
