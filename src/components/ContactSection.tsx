import React, { useState } from 'react';
import LucideIcon from './LucideIcon';
import LeafletMap from './LeafletMap';

export default function ContactSection() {
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formMessage) return;

    // Simulate sending message
    setIsSubmitted(true);
    setFormName('');
    setFormEmail('');
    setFormMessage('');

    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <section className="py-20 bg-white" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Alignment */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">CAPSY ACCUEIL</span>
          <h2 className="text-3xl sm:text-4xl font-poppins font-black text-brand-blue tracking-tight mt-1">
            Contactez Notre Centre
          </h2>
          <p className="text-sm text-brand-gray-text mt-3">
            Une question, un doute, besoin d'un renseignement immédiat ? Nos secrétaires cliniques vous répondent tous les jours ouvrables de la semaine.
          </p>
        </div>

        {/* Info Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch font-sans">
          
          {/* Column Left: Contact specifics */}
          <div className="lg:col-span-5 space-y-8 flex flex-col justify-between" id="contact-info-list">
            
            <div className="space-y-6">
              
              {/* Address detail - Goma & Kinshasa */}
              <div className="flex gap-4">
                <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl shrink-0 h-12 w-12 flex items-center justify-center">
                  <LucideIcon name="MapPin" className="h-6 w-6 text-brand-blue" />
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-brand-dark text-base">Nos Cabinets (RDC)</h4>
                  <div className="text-sm text-brand-gray-text mt-2 space-y-3">
                    <div>
                      <p className="font-bold text-xs text-brand-green uppercase tracking-wider">Siège de Goma</p>
                      <p className="text-xs mt-0.5">N°18, av. Des écoles, Q. Les Volcans, Goma, RDC</p>
                    </div>
                    <div>
                      <p className="font-bold text-xs text-brand-blue uppercase tracking-wider">Cabinet de Kinshasa</p>
                      <p className="text-xs mt-0.5">N°63, av. Kabinda, Q. Boyoma, Kinshasa, RDC</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone details */}
              <div className="flex gap-4">
                <div className="p-3 bg-brand-green/10 text-brand-green rounded-xl shrink-0 h-12 w-12 flex items-center justify-center">
                  <LucideIcon name="Phone" className="h-6 w-6 text-brand-green" />
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-brand-dark text-base">Téléphone & WhatsApp</h4>
                  <div className="text-sm text-brand-gray-text mt-1 space-y-1 font-mono font-semibold">
                    <p className="flex items-center gap-1.5 hover:text-brand-green transition-colors">
                      <a href="tel:+243997707312">+243 997 707 312</a>
                      <span className="text-[9px] bg-brand-green/10 text-brand-green py-0.5 px-1.5 rounded-sm font-bold uppercase tracking-wider">WhatsApp</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Email details */}
              <div className="flex gap-4">
                <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl shrink-0 h-12 w-12 flex items-center justify-center">
                  <LucideIcon name="Globe" className="h-6 w-6 text-brand-blue" />
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-brand-dark text-base">Secrétariat & Web</h4>
                  <div className="text-sm text-brand-gray-text mt-1 font-semibold space-y-0.5">
                    <p className="hover:text-brand-blue transition-colors">
                      <a href="mailto:contact@capsy-rdc.org">contact@capsy-rdc.org</a>
                    </p>
                    <p className="text-brand-green">
                      <a href="https://www.capsy-rdc.org" target="_blank" rel="noopener noreferrer">www.capsy-rdc.org</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex gap-4">
                <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl shrink-0 h-12 w-12 flex items-center justify-center">
                  <LucideIcon name="Clock" className="h-6 w-6 text-brand-blue" />
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-brand-dark text-base">Heures d'Ouverture</h4>
                  <p className="text-sm text-brand-gray-text mt-1">
                    Lundi - Vendredi : 08h00 - 17h00<br />
                    Samedi : 09h00 - 13h00 (Urgences uniquement)<br />
                    Dimanche : Fermé
                  </p>
                </div>
              </div>

            </div>

            {/* Social handles list card mirroring Image 1 footer */}
            <div className="bg-brand-gray-light p-5 rounded-2xl border border-gray-150 space-y-3">
              <p className="text-xs font-bold text-brand-dark uppercase tracking-wider font-poppins">Suivez-nous sur les réseaux</p>
              <div className="flex gap-2.5">
                {[
                  { icon: 'Facebook', href: '#', label: 'Capsy Services Facebook', color: 'hover:bg-blue-600 hover:text-white' },
                  { icon: 'Instagram', href: '#', label: 'Capsy Services Instagram', color: 'hover:bg-pink-600 hover:text-white' },
                  { icon: 'MessageSquareShare', href: 'https://wa.me/243997707312', label: 'WhatsApp direct link', color: 'hover:bg-green-600 hover:text-white bg-brand-green/20 text-brand-green' },
                  { icon: 'Send', href: '#', label: 'Telegram channel', color: 'hover:bg-sky-500 hover:text-white' },
                  { icon: 'Linkedin', href: '#', label: 'LinkedIn corporate handle', color: 'hover:bg-blue-800 hover:text-white' }
                ].map((social, sIdx) => (
                  <a
                    key={sIdx}
                    href={social.href}
                    title={social.label}
                    className={`h-9 w-9 bg-white text-brand-dark rounded-full flex items-center justify-center border border-gray-250 transition-all ${social.color}`}
                  >
                    <LucideIcon name={social.icon} className="h-4.5 w-4.5" />
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Column Right: Interactive messaging form & map placeholder */}
          <div className="lg:col-span-7 flex flex-col gap-6" id="contact-form-plane">
            {/* Action Messaging card */}
            <div className="bg-brand-gray-light rounded-2xl p-6 sm:p-8 border border-gray-150">
              <h4 className="font-poppins font-bold text-brand-blue text-lg mb-4">Écrivez-nous un message</h4>
              
              <form onSubmit={handleMessageSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-1.5">Nom complet *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: David Kabasubabo"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-1.5">E-mail (Conseillé)</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="votre.email@domaine.com"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-1.5">Votre message ou requête *</label>
                  <textarea
                    required
                    rows={4}
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="Dites-nous comment nous pouvons vous orienter..."
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue transition-colors resize-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <p className="text-[10px] text-brand-gray-text flex items-center gap-1">
                    <LucideIcon name="Lock" className="h-3.5 w-3.5 text-brand-green" />
                    Strictement confidentiel sous chiffrement
                  </p>
                  
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold font-poppins rounded-xl text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <LucideIcon name="Send" className="h-3.5 w-3.5 text-brand-green" />
                    <span>Envoyer le Message</span>
                  </button>
                </div>

                {isSubmitted && (
                  <div className="p-3.5 bg-brand-green/10 border border-brand-green/20 rounded-xl text-xs text-brand-green font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
                    <LucideIcon name="CheckCircle2" className="h-5 w-5" strokeWidth={2.5} />
                    <span>Merci pour votre loyauté ! Message enregistré. Nos secrétaires vous répondront promptement.</span>
                  </div>
                )}
              </form>
            </div>

            {/* Real Interactive Map using Leaflet pointing at Goma: -1.6815, 29.2306 */}
            <div className="h-64 bg-brand-dark/15 rounded-2xl relative overflow-hidden border border-gray-200 shadow-inner z-10 group">
              <LeafletMap 
                lat={-1.6815} 
                lng={29.2306} 
                zoom={16}
                title="CAPSY Services (Goma)"
                address="N°18, av. Des écoles, Q. Les Volcans, Goma, RDC"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[9px] font-bold font-poppins uppercase tracking-wider text-brand-blue z-20 select-none shadow-2xs pointer-events-none">
                📍 Goma : -1.6815, 29.2306
              </div>
            </div>


          </div>

        </div>

      </div>
    </section>
  );
}
