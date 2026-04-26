import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Layers, ChevronLeft, ChevronRight, RotateCw, Target, ArrowRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface Deck {
  id: string;
  title: string;
  category: string;
  cardCount: number;
}

interface Card {
  id: string;
  front: string;
  back: string;
}

const Flashcards = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'flashcardDecks'), orderBy('title'));
    return onSnapshot(q, (snapshot) => {
      setDecks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deck)));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedDeck) return;
    const q = query(collection(db, `flashcardDecks/${selectedDeck.id}/cards`));
    return onSnapshot(q, (snapshot) => {
      setCards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Card)));
      setCurrentIndex(0);
      setIsFlipped(false);
    });
  }, [selectedDeck]);

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  if (!selectedDeck) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16 max-w-7xl mx-auto py-16 px-6 lg:px-12 bg-[#F2F2F2] min-h-screen">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div>
             <Link to="/" className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[#46178F] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-sm mb-12">
                <Home size={18} /> Home
             </Link>
            <h1 className="text-6xl font-black text-[#46178F] tracking-tighter uppercase italic leading-none">Study <br/> <span className="text-slate-900">Modules</span></h1>
            <p className="text-xl font-bold text-slate-400 mt-4 leading-tight">Enhance your conceptual understanding with our specialized active recall modules.</p>
          </div>
          <div className="bg-[#D89E00] p-6 rounded-[2.5rem] shadow-xl border-b-8 border-[#A87B00] flex items-center gap-6 min-w-[280px]">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#D89E00] shadow-lg">
                <Layers size={32} />
             </div>
             <div>
                <p className="text-3xl font-black text-white leading-none whitespace-nowrap">{decks.length} Units</p>
                <p className="text-xs font-black text-white/50 uppercase tracking-widest">Active Recall</p>
             </div>
          </div>
        </div>
        
        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-[3rem] border-b-8 border-slate-200 animate-pulse" />)}
             </div>
        ) : decks.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-200">
            <Layers size={64} className="mx-auto text-slate-200 mb-6" />
            <p className="text-slate-400 font-black uppercase text-sm tracking-[0.3em]">No intel data detected</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {decks.map((deck, i) => {
              const themes = [
                { color: 'bg-[#E21B3C] border-[#B2152F]' },
                { color: 'bg-[#1368CE] border-[#0E4A96]' },
                { color: 'bg-[#D89E00] border-[#A87B00]' },
                { color: 'bg-[#26890C] border-[#1D6C09]' },
                { color: 'bg-[#46178F] border-[#2d0f5c]' }
              ];
              const theme = themes[i % themes.length];
              return (
                <motion.div 
                  key={deck.id}
                  whileHover={{ scale: 1.05, y: -8 }}
                  onClick={() => setSelectedDeck(deck)}
                  className={cn(
                    "relative p-10 rounded-[3.5rem] transition-all cursor-pointer overflow-hidden h-72 flex flex-col justify-between border-b-[8px]",
                    theme.color
                  )}
                >
                  <div className="relative z-10">
                     <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6">
                        <Target size={28} />
                     </div>
                     <h3 className="text-3xl font-black text-white leading-none uppercase italic tracking-tighter">{deck.title}</h3>
                     <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-2">{deck.category}</p>
                  </div>
                  
                  <div className="relative z-10 flex items-center justify-between">
                     <span className="px-5 py-2 bg-white text-slate-900 text-xs font-black rounded-xl italic">
                        {deck.cardCount || 0} FLASHCARDS
                     </span>
                     <ArrowRight size={24} className="text-white/50" />
                  </div>
                  
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-12 py-16 px-6 lg:px-12 bg-[#F2F2F2] min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <button 
          onClick={() => setSelectedDeck(null)}
          className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[#46178F] font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-sm"
        >
          <ChevronLeft size={18} /> All Decks
        </button>
        <div className="text-center sm:text-right">
           <h2 className="text-3xl font-black text-[#46178F] leading-none uppercase italic tracking-tighter">{selectedDeck.title}</h2>
           <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mt-2">Active Recall Session</span>
        </div>
      </div>

      <div className="space-y-16">
        {cards.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-b-8 border-slate-200">
            <Layers size={64} className="mx-auto text-slate-200 mb-6" />
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest tracking-[0.3em]">No intel data available</p>
          </div>
        ) : (
          <>
            <div 
              className="perspective-1000 h-[450px] w-full"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="relative w-full h-full preserve-3d cursor-pointer"
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-white rounded-[4rem] shadow-2xl border-b-[12px] border-slate-200 flex flex-col items-center justify-center p-12 text-center">
                  <div className="absolute top-10 bg-[#46178F]/10 px-4 py-1.5 rounded-full">
                     <span className="text-[10px] font-black text-[#46178F] uppercase tracking-[0.3em]">Terminology / Definition Prompt</span>
                  </div>
                  <h3 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight uppercase italic tracking-tighter">{currentCard?.front}</h3>
                  <div className="absolute bottom-10 flex items-center gap-3 text-[#46178F] font-black text-xs uppercase tracking-[0.2em] animate-pulse italic">
                     <RotateCw size={18} /> Click to Reveal Content
                  </div>
                </div>
                {/* Back */}
                <div className="absolute inset-0 backface-hidden bg-[#46178F] text-white rounded-[4rem] shadow-2xl flex flex-col items-center justify-center p-12 text-center rotate-y-180 border-b-[12px] border-[#2d0f5c]">
                  <div className="absolute top-10 bg-white/10 px-4 py-1.5 rounded-full">
                     <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Conceptual Identification</span>
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-black leading-relaxed uppercase italic tracking-tight">{currentCard?.back}</h3>
                  <div className="absolute bottom-10 flex items-center gap-3 text-amber-400 font-black text-xs uppercase tracking-[0.2em] italic">
                     <Target size={18} /> Self-Assessment Evaluation
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center justify-center gap-12">
              <button 
                onClick={prevCard}
                disabled={currentIndex === 0}
                className="w-20 h-20 flex items-center justify-center bg-white rounded-3xl border-b-4 border-slate-200 text-slate-400 hover:text-[#46178F] disabled:opacity-30 transition-all shadow-xl active:translate-y-1 active:border-b-0"
              >
                <ChevronLeft size={32} strokeWidth={3} />
              </button>
              
              <div className="text-center min-w-[100px]">
                 <p className="text-5xl font-black text-[#46178F] leading-none italic tracking-tighter">{currentIndex + 1}</p>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">{cards.length} TOTAL</p>
              </div>

              <button 
                onClick={nextCard}
                disabled={currentIndex === cards.length - 1}
                className="w-20 h-20 flex items-center justify-center bg-[#46178F] text-white rounded-3xl border-b-4 border-[#2d0f5c] shadow-xl hover:bg-slate-900 shadow-indigo-100 disabled:opacity-30 transition-all active:translate-y-1 active:border-b-0"
              >
                <ChevronRight size={32} strokeWidth={3} />
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Flashcards;
