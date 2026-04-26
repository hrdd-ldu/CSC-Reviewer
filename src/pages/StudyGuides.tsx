import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BookOpen, ChevronLeft, Download, ExternalLink, Home, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface Guide {
  id: string;
  title: string;
  description: string;
  contentUrl: string;
  category: string;
}

const StudyGuides = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'studyGuides'), orderBy('title'));
    return onSnapshot(q, (snapshot) => {
      setGuides(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guide)));
      setLoading(false);
    });
  }, []);

  const categories = ['All', ...new Set(guides.map(g => g.category))];
  const filteredGuides = guides.filter(g => activeCategory === 'All' || g.category === activeCategory);

  if (selectedGuide) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="fixed inset-0 bg-[#F2F2F2] z-[100] flex flex-col md:flex-row overflow-hidden"
      >
        {/* Left Side: Content Viewer */}
        <div className="flex-1 bg-slate-100 relative h-[50vh] md:h-full">
           <iframe 
              src={selectedGuide.contentUrl.includes('drive.google.com') ? selectedGuide.contentUrl.replace('/view', '/preview') : selectedGuide.contentUrl} 
              className="w-full h-full border-none"
              title={selectedGuide.title}
           />
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-[450px] p-10 lg:p-14 flex flex-col h-full bg-white overflow-y-auto shadow-2xl relative z-10">
          <button 
             onClick={() => setSelectedGuide(null)}
             className="self-end w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-950 transition-all mb-12 shadow-sm"
          >
             <X size={24} strokeWidth={3} />
          </button>

          <div className="mb-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-5 py-2 bg-[#1368CE] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-100">
                {selectedGuide.category}
              </span>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Academic Resource</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-950 leading-[1.05] mb-8 tracking-tighter uppercase italic">
              {selectedGuide.title}
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-10 font-bold opacity-70">
              {selectedGuide.description || 'Professional study material provided for educational purposes.'}
            </p>
          </div>

          <div className="space-y-4 pb-4">
             <a 
                href={selectedGuide.contentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-6 bg-[#26890C] text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-slate-900 border-b-8 border-[#1D6C09] transition-all shadow-2xl active:translate-y-2 active:border-b-0"
             >
                <Download size={22} /> Download Material
             </a>
             <a 
                href={selectedGuide.contentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-6 bg-white text-slate-950 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-slate-50 border-2 border-slate-100 transition-all border-b-6 border-slate-200"
             >
                <ExternalLink size={20} /> Launch External Viewer
             </a>
          </div>

          <div className="mt-12 pt-10 border-t border-slate-100 flex items-center justify-between opacity-50">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] italic">2026 OFFICIAL GUIDE</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16 max-w-7xl mx-auto py-16 px-6 lg:px-12 bg-[#F2F2F2] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
           <Link to="/" className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[#1368CE] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-sm mb-12">
              <Home size={18} /> Home
           </Link>
          <h1 className="text-6xl font-black text-[#1368CE] tracking-tighter uppercase italic leading-none">Study <br/> <span className="text-slate-900">Guides</span></h1>
          <p className="text-xl font-bold text-slate-400 mt-4 leading-tight">Master the official curriculum with curated manual repositories.</p>
        </div>
        <div className="bg-[#1368CE] p-6 rounded-[2.5rem] shadow-xl border-b-8 border-[#0E4A96] flex items-center gap-6 min-w-[280px]">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#1368CE] shadow-lg">
              <BookOpen size={32} />
           </div>
           <div>
              <p className="text-3xl font-black text-white leading-none whitespace-nowrap">{guides.length} Materials</p>
              <p className="text-xs font-black text-white/50 uppercase tracking-widest">Library Resource</p>
           </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar">
          {categories.map((cat, idx) => {
            const colors = ['bg-[#46178F]', 'bg-[#1368CE]', 'bg-[#26890C]', 'bg-[#D89E00]', 'bg-[#E21B3C]'];
            const color = colors[idx % colors.length];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "whitespace-nowrap px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-b-4 active:translate-y-1 active:border-b-0",
                  isActive 
                    ? `${color} text-white border-black/20 shadow-md scale-105` 
                    : "bg-white text-slate-400 border-slate-200 hover:text-slate-600 shadow-sm"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-[3rem] border-b-8 border-slate-200 animate-pulse" />)}
             </div>
        ) : filteredGuides.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-200">
            <BookOpen size={64} className="mx-auto text-slate-200 mb-6" />
            <p className="text-slate-400 font-black uppercase text-sm tracking-[0.3em]">No materials found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGuides.map((guide, i) => {
              const themes = [
                { color: 'bg-[#1368CE] border-[#0E4A96]' },
                { color: 'bg-[#E21B3C] border-[#B2152F]' },
                { color: 'bg-[#D89E00] border-[#A87B00]' },
                { color: 'bg-[#26890C] border-[#1D6C09]' },
                { color: 'bg-[#46178F] border-[#2d0f5c]' }
              ];
              const theme = themes[i % themes.length];
              return (
                <motion.div 
                  key={guide.id}
                  whileHover={{ scale: 1.05, y: -8 }}
                  onClick={() => setSelectedGuide(guide)}
                  className={cn(
                    "relative p-10 rounded-[3.5rem] transition-all cursor-pointer overflow-hidden h-72 flex flex-col justify-between border-b-[8px]",
                    theme.color
                  )}
                >
                  <div className="relative z-10">
                     <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6">
                        <BookOpen size={28} />
                     </div>
                     <h3 className="text-3xl font-black text-white leading-none uppercase italic tracking-tighter">{guide.title}</h3>
                     <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-2">{guide.category}</p>
                  </div>
                  
                  <div className="relative z-10 flex items-center justify-between">
                     <span className="px-5 py-2 bg-white text-slate-900 text-[10px] font-black rounded-xl italic uppercase tracking-widest">
                        Study Now
                     </span>
                     <ArrowRight size={24} className="text-white/50" />
                  </div>
                  
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StudyGuides;
