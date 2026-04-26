import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Layers, 
  ClipboardCheck, 
  Trophy, 
  ShieldCheck,
  Settings
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const ModuleCard = ({ icon: Icon, title, description, color, to, onClick }: { icon: any, title: string, description: string, color: string, to?: string, onClick?: () => void }) => {
  const content = (
    <motion.div 
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative p-8 rounded-[2.5rem] flex flex-col justify-between h-64 transition-all cursor-pointer overflow-hidden border-b-[8px]",
        color
      )}
    >
      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6">
        <Icon size={32} />
      </div>
      <div className="relative z-10">
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">
          {title}
        </h2>
        <p className="text-white/80 text-sm font-bold leading-tight">{description}</p>
      </div>
      <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
    </motion.div>
  );

  if (to) return <Link to={to} className="w-full flex-1">{content}</Link>;
  return <div onClick={onClick} className="w-full flex-1">{content}</div>;
};

const Dashboard = () => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      {/* Kahoot Header with Hero Image */}
      <header className="relative min-h-[500px] flex flex-col overflow-hidden bg-[#46178F]">
        {/* Background Hero Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/header.png" 
            alt="Civil Service Exam Reviewer" 
            className="w-full h-full object-cover opacity-90"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=2000";
              (e.target as HTMLImageElement).className = "w-full h-full object-cover opacity-30 grayscale";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#46178F]/60 via-transparent to-[#46178F]/30" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10 px-6 lg:px-12 pt-12 pb-32 flex flex-col justify-between h-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16 mt-auto">
            <div className="max-w-xl text-center md:text-left bg-[#46178F]/40 backdrop-blur-sm p-8 rounded-[3rem] border border-white/10">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl lg:text-7xl font-black text-white mb-6 leading-none tracking-tighter uppercase italic drop-shadow-2xl"
              >
                Ready to <br/> <span className="text-amber-400">Excel?</span>
              </motion.h2>
              <p className="text-lg lg:text-xl font-bold text-white/90 leading-tight drop-shadow-md">
                Master your Civil Service journey with our comprehensive gamified platform.
              </p>
            </div>
            
            <div className="relative group">
               <div className="absolute -inset-8 bg-white/10 blur-3xl rounded-full animate-pulse"></div>
               <div className="relative w-64 h-64 bg-gradient-to-tr from-[#E21B3C] to-[#46178F] rounded-[4rem] border-4 border-white/20 flex flex-col items-center justify-center text-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <Trophy size={64} className="text-amber-400 mb-4 drop-shadow-[0_4px_0_rgba(168,123,0,0.5)]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">High Score</p>
                  <p className="text-5xl font-black italic">{profile?.bestScore || 0}%</p>
               </div>
            </div>
          </div>
        </div>
        
        {/* Kahoot Wave Pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#F2F2F2] rounded-t-[4rem] z-10" />
      </header>

      {/* Grid Menu */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 mt-12 pb-24 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <ModuleCard 
            icon={ClipboardCheck}
            title="Practice Exams"
            description="Complete comprehensive mock examinations"
            color="bg-[#E21B3C] border-[#B2152F]"
            to="/exams"
          />
          <ModuleCard 
            icon={BookOpen}
            title="Study Guides"
            description="Access official manual study materials"
            color="bg-[#1368CE] border-[#0E4A96]"
            to="/study-guides"
          />
          <ModuleCard 
            icon={Layers}
            title="Flashcards"
            description="Engage in rapid-fire concept recall"
            color="bg-[#D89E00] border-[#A87B00]"
            to="/flashcards"
          />
          <ModuleCard 
            icon={Trophy}
            title="Leaderboard"
            description="View top candidate performance results"
            color="bg-[#26890C] border-[#1D6C09]"
            to="/leaderboard"
          />
        </div>
      </main>

      {/* Playful Footer */}
      <footer className="py-20 px-6 lg:px-12 bg-[#F2F2F2] border-t border-slate-200">
         <div className="max-w-7xl mx-auto flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 mb-16">
               <Link to="/leaderboard" className="text-sm font-black uppercase text-slate-400 hover:text-[#46178F] transition-colors tracking-widest">Hall of Fame</Link>
               <Link to="/exams" className="text-sm font-black uppercase text-slate-400 hover:text-[#46178F] transition-colors tracking-widest">Practice Ground</Link>
               <Link to="/flashcards" className="text-sm font-black uppercase text-slate-400 hover:text-[#46178F] transition-colors tracking-widest">Flashcards</Link>
               <Link to="/study-guides" className="text-sm font-black uppercase text-slate-400 hover:text-[#46178F] transition-colors tracking-widest">Library</Link>
               <Link to="/admin" className="px-6 py-3 bg-white text-slate-400 hover:text-[#46178F] border-[3px] border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 hover:border-[#46178F]">
                  <ShieldCheck size={16} /> Admin Access
               </Link>
            </div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.8em]">Knowledge is Power</div>
         </div>
      </footer>
    </div>
  );
};

export default Dashboard;
