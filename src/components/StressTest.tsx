import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STRESS_TEST_QUESTIONS } from '../data/staticData';
import LucideIcon from './LucideIcon';

interface StressTestProps {
  onOpenBooking: (serviceId: string) => void;
}

export default function StressTest({ onOpenBooking }: StressTestProps) {
  const [currentIdx, setCurrentIdx] = useState(-1); // -1 is the "Start" state
  const [scores, setScores] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const totalScore = scores.reduce((sum, s) => sum + s, 0);
  const maxScore = STRESS_TEST_QUESTIONS.length * 3;

  const handleStart = () => {
    setCurrentIdx(0);
    setScores([]);
    setShowResult(false);
  };

  const handleAnswer = (score: number) => {
    const updatedScores = [...scores, score];
    setScores(updatedScores);

    if (currentIdx < STRESS_TEST_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setCurrentIdx(-1);
    setScores([]);
    setShowResult(false);
  };

  // Get localized interpretation and recommendations
  const getInterpretation = () => {
    if (totalScore >= 12) {
      return {
        level: 'Stress Élevé / Chronique',
        color: 'text-rose-600 bg-rose-50 border-rose-200',
        barColor: 'bg-rose-500',
        intro: "Le stress n'est pas une faiblesse. Lorsqu'il devient chronique, il affecte en profondeur votre santé, vos relations et votre milieu professionnel.",
        advice: "Vos indicateurs suggèrent que vous traversez une période d'épuisement ou de surmenage intense. Parler à un psychothérapeute qualifié de Capsy Services vous apportera les outils nécessaires pour retrouver l'équilibre et préserver votre santé mentale.",
        recommendedService: 'individuel',
        recommendedServiceName: 'Consultation Individuelle'
      };
    } else if (totalScore >= 6) {
      return {
        level: 'Stress Modéré',
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        barColor: 'bg-amber-500',
        intro: "Vous faites face à un niveau de stress modéré mais constant qui altère ponctuellement votre quotidien.",
        advice: "Prendre les devants maintenant vous évitera de basculer vers un épuisement professionnel ou familial. Une thérapie préventive ou des ateliers de relaxation peuvent grandement vous aider à évacuer ces tensions.",
        recommendedService: 'individuel',
        recommendedServiceName: 'Faire le point en consultation individuelle'
      };
    } else {
      return {
        level: 'Stress Léger / Gérable',
        color: 'text-brand-green bg-green-50 border-green-200',
        barColor: 'bg-brand-green',
        intro: "Votre niveau de stress actuel semble contenu et ne menace pas directement votre équilibre global.",
        advice: "Continuez de prendre soin de vous. Si toutefois vous traversez des crises familiales, professionnels ou de couple spécifiques, rappelez-vous que notre équipe reste à votre entière disposition pour une écoute sans jugement.",
        recommendedService: 'formation',
        recommendedServiceName: 'S\'inscrire à un Atelier de Bien-être'
      };
    }
  };

  const result = showResult ? getInterpretation() : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-150 shadow-lg p-6 sm:p-8 max-w-2xl mx-auto overflow-hidden relative" id="stress-test-section">
      {/* Decorative background vectors */}
      <div className="absolute -top-12 -right-12 h-32 w-32 bg-brand-green/5 rounded-full blur-xl" />
      <div className="absolute -bottom-12 -left-12 h-32 w-32 bg-brand-blue/5 rounded-full blur-xl" />

      <AnimatePresence mode="wait">
        {currentIdx === -1 && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center space-y-5 py-6"
            id="test-intro-container"
          >
            <div className="h-16 w-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue mx-auto">
              <LucideIcon name="Sparkles" className="h-8 w-8 text-brand-green animate-pulse" />
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand-green">Auto-Évaluation Gratuite</span>
              <h3 className="text-2xl font-bold font-poppins text-brand-dark">Évaluez votre niveau de stress</h3>
              <p className="text-sm text-brand-gray-text max-w-md mx-auto leading-relaxed font-sans">
                Prenez 2 minutes pour faire le point de manière anonyme et confidentielle sur vos tensions mentales et physiques actuelles.
              </p>
            </div>
            <button
              onClick={handleStart}
              className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold font-poppins hover:bg-brand-blue/90 shadow-md hover:shadow-lg transition-all cursor-pointer text-sm"
              id="start-test-btn"
            >
              Démarrer le questionnaire (6 questions)
            </button>
            <p className="text-xs text-brand-gray-text/75 italic">
              * Ce test est un indicateur de bien-être et ne remplace pas un diagnostic clinique.
            </p>
          </motion.div>
        )}

        {currentIdx >= 0 && !showResult && (
          <motion.div
            key={`question-${currentIdx}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Progress Header */}
            <div className="flex items-center justify-between text-xs text-brand-gray-text border-b border-gray-150 pb-3">
              <span className="font-poppins font-semibold">Question {currentIdx + 1} de {STRESS_TEST_QUESTIONS.length}</span>
              <div className="w-1/2 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-blue h-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / STRESS_TEST_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <h4 className="text-lg sm:text-xl font-poppins font-bold text-brand-dark leading-snug">
              {STRESS_TEST_QUESTIONS[currentIdx].text}
            </h4>

            {/* Options List */}
            <div className="space-y-2.5">
              {STRESS_TEST_QUESTIONS[currentIdx].options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => handleAnswer(opt.score)}
                  className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-brand-blue hover:bg-blue-50/10 transition-all font-sans text-sm text-brand-dark flex items-center justify-between group"
                >
                  <span className="group-hover:text-brand-blue transition-colors font-medium">{opt.text}</span>
                  <div className="h-4 w-4 rounded-full border border-gray-300 flex items-center justify-center shrink-0 group-hover:border-brand-blue ml-4">
                    <div className="h-2 w-2 rounded-full bg-brand-blue scale-0 group-hover:scale-100 transition-all" />
                  </div>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs text-brand-gray-text">
              <button
                onClick={handleReset}
                className="hover:text-rose-500 font-semibold flex items-center gap-1 transition-colors"
              >
                <LucideIcon name="X" className="h-4 w-4" /> Annuler le test
              </button>
              <span>Confidentialité totale garantie</span>
            </div>
          </motion.div>
        )}

        {showResult && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
            id="test-results-container"
          >
            {/* Header Result */}
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">Auto-Évaluation Résultat</span>
              <h3 className="text-2xl font-bold font-poppins text-brand-dark">Votre profil de bien-être</h3>
            </div>

            {/* Score Bar */}
            <div className="bg-brand-gray-light rounded-xl p-5 border border-gray-200 text-center space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-brand-gray-text">
                <span>Intensité du Stress</span>
                <span className="font-mono text-brand-dark">{totalScore} / {maxScore} points</span>
              </div>
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div
                  className={`${result.barColor} h-full rounded-full transition-all duration-1000`}
                  style={{ width: `${(totalScore / maxScore) * 100}%` }}
                />
              </div>
              <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold font-poppins ${result.color}`}>
                {result.level}
              </span>
            </div>

            {/* Qualitative Feedback */}
            <div className="space-y-4 text-sm leading-relaxed text-brand-dark">
              <p className="font-poppins font-bold text-brand-blue text-base">
                "{result.intro}"
              </p>
              <p className="text-brand-gray-text font-normal font-sans">
                {result.advice}
              </p>
            </div>

            {/* Action Box */}
            <div className="bg-brand-gray-light rounded-xl p-4 border border-gray-150 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
              <div className="flex gap-3 items-center sm:items-start text-center sm:text-left">
                <div className="p-2 bg-brand-green/10 text-brand-green rounded-lg hidden sm:block shrink-0 mt-0.5">
                  <LucideIcon name="MessageSquareShare" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-brand-gray-text font-semibold uppercase tracking-wider">Solution Recommandée</p>
                  <p className="text-sm font-poppins font-bold text-brand-blue mt-0.5">{result.recommendedServiceName}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onOpenBooking(result.recommendedService);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-brand-green hover:bg-brand-green/95 text-white font-bold font-poppins rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                id="results-callback-booking-btn"
              >
                <span>Prendre un rendez-vous</span>
                <LucideIcon name="Calendar" className="h-4 w-4" />
              </button>
            </div>

            {/* Control buttons */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleReset}
                className="text-xs text-brand-gray-text hover:text-brand-blue flex items-center gap-1.5 font-bold transition-colors"
                id="redo-test-btn"
              >
                <LucideIcon name="Sparkles" className="h-4 w-4 text-brand-green" /> Recommencer le test
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
