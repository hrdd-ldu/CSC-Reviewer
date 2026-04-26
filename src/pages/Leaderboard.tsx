import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, query, where, orderBy, onSnapshot, limit, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Trophy, Medal, User as UserIcon, Trash2, Calendar, Target, Home } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface Result {
  id: string;
  nickname: string;
  userId: string;
  examTitle: string;
  percentage: number;
  completedAt: any;
  isRanked: boolean;
}

const Leaderboard = () => {
  const { profile } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'examResults'), 
      orderBy('percentage', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      setResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Result)));
      setLoading(false);
    });
  }, []);

  const removeEntry = async (id: string) => {
    if (confirm("Remove this entry from the leaderboard?")) {
      await deleteDoc(doc(db, 'examResults', id));
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return 'just now';
    const date = ts.toDate();
    return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' }).format(date);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16 max-w-7xl mx-auto py-16 px-6 lg:px-12 bg-[#F2F2F2] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
           <Link to="/" className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[#46178F] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-sm mb-12">
              <Home size={18} /> Home
           </Link>
          <h1 className="text-6xl font-black text-[#46178F] tracking-tighter uppercase italic leading-none">Candidate <br/> <span className="text-slate-900">Standings</span></h1>
        </div>
        <div className="bg-[#46178F] p-6 rounded-[2.5rem] shadow-xl border-b-8 border-[#2d0f5c] flex items-center gap-6 min-w-[280px]">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#46178F] shadow-lg">
              <Trophy size={32} strokeWidth={3} />
           </div>
           <div>
              <p className="text-3xl font-black text-white leading-none whitespace-nowrap">{results[0]?.nickname || 'Candidate'}</p>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-white rounded-3xl border-b-8 border-slate-200 animate-pulse" />)}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-200">
          <Medal size={64} className="mx-auto text-slate-200 mb-6" />
          <p className="text-slate-400 font-black uppercase text-sm tracking-[0.3em]">No examination records discovered</p>
        </div>
      ) : (
        <div className="space-y-20">
          {/* Enhanced Kahoot Podium */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-3xl mx-auto px-4 pt-16 pb-8">
            {/* 2nd Place */}
            {results[1] && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] bg-white border-4 border-slate-200 shadow-xl mb-6 flex items-center justify-center font-black text-[#46178F] overflow-hidden text-xl rotate-[-3deg]">
                  {results[1].nickname.substring(0, 2).toUpperCase()}
                </div>
                <div className="w-full bg-[#1368CE] rounded-t-[2.5rem] h-32 sm:h-40 flex flex-col items-center justify-center text-white relative shadow-2xl border-b-0 border-x-4 border-white/10">
                  <span className="text-3xl sm:text-5xl font-black italic">2</span>
                  <div className="absolute -top-12 w-full text-center px-2">
                     <p className="text-[10px] font-black uppercase tracking-widest text-[#1368CE] bg-white px-2 py-1 rounded-lg inline-block shadow-sm truncate max-w-full">{results[1].nickname}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 1st Place */}
            {results[0] && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center relative z-10"
              >
                <div className="relative mb-6">
                  <motion.div 
                     animate={{ rotate: [0, 10, -10, 0] }}
                     transition={{ repeat: Infinity, duration: 3 }}
                     className="absolute -top-12 left-1/2 -translate-x-1/2"
                  >
                     <Trophy size={48} className="text-amber-400 drop-shadow-[0_4px_0_#A87B00]" />
                  </motion.div>
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-amber-400 border-4 border-white shadow-2xl flex items-center justify-center font-black text-white text-3xl sm:text-4xl overflow-hidden ring-8 ring-amber-400/20 rotate-3">
                    {results[0].nickname.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="w-full bg-[#46178F] rounded-t-[3rem] h-48 sm:h-64 flex flex-col items-center justify-center text-white relative shadow-[0_30px_60px_-15px_rgba(70,23,143,0.3)] border-x-4 border-white/10">
                  <span className="text-5xl sm:text-7xl font-black italic">1</span>
                  <div className="absolute -top-12 w-full text-center px-2">
                     <p className="text-xs font-black uppercase tracking-widest text-white bg-amber-400 px-4 py-2 rounded-xl shadow-lg inline-block truncate max-w-full italic">TOP PERFORMER</p>
                     <p className="block mt-1 text-[10px] font-black text-[#46178F] bg-white px-3 py-1 rounded-lg shadow-sm">{results[0].nickname}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {results[2] && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] bg-white border-4 border-amber-200 shadow-xl mb-6 flex items-center justify-center font-black text-amber-600 overflow-hidden text-lg rotate-[3deg]">
                  {results[2].nickname.substring(0, 2).toUpperCase()}
                </div>
                <div className="w-full bg-[#D89E00] rounded-t-[2.5rem] h-24 sm:h-32 flex flex-col items-center justify-center text-white relative shadow-2xl border-b-0 border-x-4 border-white/10">
                  <span className="text-2xl sm:text-4xl font-black italic">3</span>
                  <div className="absolute -top-12 w-full text-center px-2">
                     <p className="text-[10px] font-black uppercase tracking-widest text-[#D89E00] bg-white px-2 py-1 rounded-lg inline-block shadow-sm truncate max-w-full">{results[2].nickname}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="bg-white rounded-[3.5rem] shadow-xl border-b-[12px] border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#46178F] border-b border-black/10">
                    <th className="px-8 py-8 text-[10px] font-black text-white uppercase tracking-[0.3em] text-center w-24">Rank</th>
                    <th className="px-8 py-8 text-[10px] font-black text-white uppercase tracking-[0.3em]">Candidate</th>
                    <th className="px-8 py-8 text-[10px] font-black text-white uppercase tracking-[0.3em]">Examination</th>
                    <th className="px-8 py-8 text-[10px] font-black text-white uppercase tracking-[0.3em]">Result Score</th>
                    <th className="px-8 py-8 text-[10px] font-black text-white uppercase tracking-[0.3em] text-right">Completion Date</th>
                    {profile?.isAdmin && <th className="px-8 py-8 text-[10px] font-black text-white uppercase tracking-[0.3em] text-right">Admin</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.slice(3).map((result, idx) => (
                      <motion.tr 
                        key={result.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={cn(
                          "group transition-all",
                          result.nickname === profile?.nickname && profile ? "bg-indigo-50" : "hover:bg-slate-50"
                        )}
                      >
                      <td className="px-8 py-6 text-center">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm mx-auto border-b-4",
                          idx === 0 ? "bg-amber-400 text-white border-amber-600 rotate-2" : 
                          "bg-slate-100 text-slate-400 border-slate-300"
                        )}>
                          {idx + 4}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm uppercase shadow-sm border-b-4",
                            result.nickname === profile?.nickname && profile ? "bg-[#46178F] border-[#2d0f5c]" : "bg-slate-300 border-slate-400"
                          )}>
                            {result.nickname.substring(0, 2)}
                          </div>
                          <span className={cn(
                            "font-black text-lg text-slate-800 uppercase italic tracking-tight",
                            result.nickname === profile?.nickname && profile ? "text-[#46178F]" : ""
                          )}>
                            {result.nickname}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest italic">{result.examTitle}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 w-24 bg-slate-100 h-3 rounded-full overflow-hidden hidden lg:block border border-slate-200">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${result.percentage}%` }}
                              className="bg-[#46178F] h-full"
                            ></motion.div>
                          </div>
                          <span className="text-2xl font-black text-slate-900 italic tracking-tighter">{result.percentage}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                           {formatDate(result.completedAt)}
                         </span>
                      </td>
                      {profile?.isAdmin && (
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => removeEntry(result.id)}
                            className="p-3 text-slate-300 hover:text-white hover:bg-[#E21B3C] rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* User Row Highlighted */}
            <div className="p-8 bg-[#46178F] text-white flex flex-col sm:flex-row items-center justify-between gap-6 border-t-8 border-amber-400">
               <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] mb-1">Result Summary</span>
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white text-[#46178F] flex items-center justify-center font-black text-xl border-b-4 border-slate-300">
                          {profile?.nickname?.substring(0, 2).toUpperCase() || '??'}
                        </div>
                        <div>
                           <p className="text-2xl font-black italic tracking-tighter uppercase leading-none">{profile?.nickname || 'Guest Mode'}</p>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Candidate Identification</p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-10">
                  <div className="text-center sm:text-right">
                     <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-1">Personal Best</p>
                     <p className="text-5xl font-black italic leading-none">{profile?.bestScore || 0}%</p>
                  </div>
                  <div className="w-px h-16 bg-white/10 hidden sm:block"></div>
                  <Link to="/exams" className="px-8 py-4 bg-white text-[#46178F] rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_6px_0_0_#d1d5db] active:translate-y-1 active:shadow-[0_2px_0_0_#d1d5db] transition-all">
                     Start Practice
                  </Link>
               </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Leaderboard;
