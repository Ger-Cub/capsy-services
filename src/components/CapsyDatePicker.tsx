import React, { useState, useEffect, useRef, useMemo } from 'react';
import LucideIcon from './LucideIcon';

interface CapsyDatePickerProps {
  value: string; // Format "YYYY-MM-DD"
  availableDates: { value: string; label: string }[];
  onChange: (value: string) => void;
  id?: string;
}

export default function CapsyDatePicker({
  value,
  availableDates,
  onChange,
  id = 'capsy-date-picker',
}: CapsyDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set pour vérification O(1) des dates actives / ouvrables
  const availableSet = useMemo(() => {
    return new Set(availableDates.map((d) => d.value));
  }, [availableDates]);

  // Mois affiché dans le calendrier
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
      }
    }
    return new Date();
  });

  // Synchroniser le calendrier si la date sélectionnée change extérieurement
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setViewDate(new Date(Number(parts[0]), Number(parts[1]) - 1, 1));
      }
    }
  }, [value]);

  // Fermeture lors d'un clic extérieur ou appui sur Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Formatage lisible pour le bouton de déclenchement
  const formattedDisplay = useMemo(() => {
    if (!value) return 'Choisir une date';
    const found = availableDates.find((d) => d.value === value);
    if (found) return found.label;

    const parts = value.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    return value;
  }, [value, availableDates]);

  // Navigation dans les mois
  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  // Premier jour du mois (Lundi = 0, ..., Dimanche = 6)
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Jours du mois précédent (inactifs/grisés)
  const prevDays: number[] = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevDays.push(daysInPrevMonth - i);
  }

  // Jours du mois en cours
  const currentDays: number[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    currentDays.push(d);
  }

  // Jours du mois suivant pour compléter la grille
  const totalCells = prevDays.length + currentDays.length;
  const remainder = totalCells % 7;
  const nextDaysCount = remainder === 0 ? 0 : 7 - remainder;
  const nextDays: number[] = [];
  for (let d = 1; d <= nextDaysCount; d++) {
    nextDays.push(d);
  }

  const handleSelectDate = (isoString: string) => {
    onChange(isoString);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Bouton déclencheur champ de saisie */}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full p-3.5 border-2 rounded-xl bg-white font-sans text-brand-dark flex items-center justify-between transition-all text-left cursor-pointer ${
          isOpen ? 'border-brand-wellbeing ring-2 ring-brand-wellbeing/20' : 'border-gray-200 hover:border-gray-300'
        }`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-brand-wellbeing/10 text-brand-wellbeing flex items-center justify-center shrink-0">
            <LucideIcon name="Calendar" className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-brand-dark truncate capitalize">
            {formattedDisplay}
          </span>
        </div>
        <LucideIcon
          name="ChevronDown"
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-brand-wellbeing' : ''
          }`}
        />
      </button>

      {/* Popover Calendrier déroulant */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[320px] bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
          {/* Flèche pointant vers le champ */}
          <div className="absolute -top-1.5 left-7 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45" />

          {/* En-tête : Navigation mois & année */}
          <div className="flex items-center justify-between mb-3 relative z-10 px-0.5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition cursor-pointer"
              title="Mois précédent"
            >
              <LucideIcon name="ChevronLeft" className="h-4 w-4" />
            </button>
            <span className="font-poppins font-bold text-brand-dark capitalize text-sm">
              {monthName}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition cursor-pointer"
              title="Mois suivant"
            >
              <LucideIcon name="ChevronRight" className="h-4 w-4" />
            </button>
          </div>

          {/* En-tête des jours de la semaine */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 mb-2">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <div key={i} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grille des dates */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Jours du mois précédent (inactifs) */}
            {prevDays.map((d, i) => (
              <div
                key={`prev-${i}`}
                className="h-8 w-8 mx-auto flex items-center justify-center text-gray-300/60 font-light select-none"
              >
                {d}
              </div>
            ))}

            {/* Jours du mois courant */}
            {currentDays.map((d) => {
              const padMonth = String(month + 1).padStart(2, '0');
              const padDay = String(d).padStart(2, '0');
              const iso = `${year}-${padMonth}-${padDay}`;
              const isAvailable = availableSet.has(iso);
              const isSelected = value === iso;

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => handleSelectDate(iso)}
                  title={
                    isAvailable
                      ? isSelected
                        ? 'Date actuellement sélectionnée'
                        : 'Cliquer pour choisir ce jour ouvrable'
                      : 'Jour non ouvrable ou fermé'
                  }
                  className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs transition-all ${
                    isSelected
                      ? 'bg-brand-wellbeing text-white font-bold shadow-xs ring-2 ring-brand-wellbeing/20'
                      : isAvailable
                      ? 'text-brand-dark font-medium hover:bg-brand-wellbeing/15 hover:text-brand-wellbeing cursor-pointer'
                      : 'text-gray-300 font-normal cursor-not-allowed select-none'
                  }`}
                >
                  {d}
                </button>
              );
            })}

            {/* Jours du mois suivant (inactifs) */}
            {nextDays.map((d, i) => (
              <div
                key={`next-${i}`}
                className="h-8 w-8 mx-auto flex items-center justify-center text-gray-300/60 font-light select-none"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Pied du calendrier explicatif */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-brand-gray-text">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-brand-wellbeing inline-block" />
              Jours ouvrables CAPSY
            </span>
            <span className="text-[10px] text-gray-400">
              Dimanches fermés
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
