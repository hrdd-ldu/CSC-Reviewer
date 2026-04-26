import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { ClipboardCheck, Timer, Trophy, AlertTriangle, ChevronRight, X, CheckCircle2, User as UserIcon, Home, ArrowRight, ArrowLeft, Clock, Flame, XCircle, Circle, Square, Triangle, Diamond, Layers } from 'lucide-react';
import { cn } from '../lib/utils';

interface Exam {
  id: string;
  title: string;
  description: string;
  category: string;
  timeLimit: number;
  isRanked: boolean;
  questionCount: number;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
}

const Exams = () => {
  const { user, profile } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isExamMode, setIsExamMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [guestNickname, setGuestNickname] = useState('');
  const [showNicknamePrompt, setShowNicknamePrompt] = useState(false);
  const [tempExam, setTempExam] = useState<Exam | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'exams'), orderBy('title'));
    return onSnapshot(q, (snapshot) => {
      setExams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam)));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let timer: any;
    if (isExamMode && timeLeft > 0 && !isFinished && !showFeedback) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isExamMode && !showFeedback) {
      handleAnswer(-1); // Time out
    }
    return () => clearInterval(timer);
  }, [isExamMode, timeLeft, isFinished, showFeedback]);

  const initiateExam = (exam: Exam) => {
    setTempExam(exam);
    // Use existing profile nickname as default if available
    if (profile?.nickname && !guestNickname) {
      setGuestNickname(profile.nickname);
    }
    setShowNicknamePrompt(true);
  };

  const startExam = async (exam: Exam, customNickname?: string) => {
    const qSnapshot = await getDocs(collection(db, `exams/${exam.id}/questions`));
    const qs = qSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
    if (qs.length === 0) {
      alert("No questions found in this exam.");
      return;
    }
    if (customNickname) setGuestNickname(customNickname);
    setQuestions(qs);
    setSelectedExam(exam);
    setTimeLeft(exam.timeLimit * 60);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsExamMode(true);
    setIsFinished(false);
    setScore(0);
    setStreak(0);
    setShowNicknamePrompt(false);
    setShowFeedback(false);
  };

  const handleAnswer = (optionIdx: number) => {
    const correct = questions[currentQuestionIndex].correctOption === optionIdx;
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIdx }));
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setShowFeedback(false);
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishExam();
    }
  };

  const finishExam = async () => {
    if (isFinished) return;
    setIsFinished(true);
    setShowFeedback(false);

    if (selectedExam) {
      const percentage = Math.round((score / questions.length) * 100);
      // Prioritize the nickname from the prompt/state
      const nickname = guestNickname || profile?.nickname || 'Anonymous';
      
      await addDoc(collection(db, 'examResults'), {
        userId: user?.uid || 'guest',
        nickname,
        examId: selectedExam.id,
        examTitle: selectedExam.title,
        score: score,
        total: questions.length,
        percentage,
        isRanked: selectedExam.isRanked,
        completedAt: serverTimestamp(),
      });

      if (user) {
        const profileRef = doc(db, 'profiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const pData = profileSnap.data();
          const newExamsTaken = (pData.examsTaken || 0) + 1;
          const newBestScore = Math.max(pData.bestScore || 0, percentage);
          const newAvgScore = Math.round(((pData.avgScore || 0) * (pData.examsTaken || 0) + percentage) / newExamsTaken);
          
          await updateDoc(profileRef, {
            examsTaken: newExamsTaken,
            bestScore: newBestScore,
            avgScore: newAvgScore,
            lastActiveAt: serverTimestamp(),
          });
        }
      }
    }
  };

  if (isExamMode) {
    const q = questions[currentQuestionIndex];
    const shapes = [
      { color: 'bg-[#E21B3C] border-[#B2152F]', icon: <Triangle fill="currentColor" />, label: 'Triangle' },
      { color: 'bg-[#1368CE] border-[#0E4A96]', icon: <Diamond fill="currentColor" />, label: 'Diamond' },
      { color: 'bg-[#D89E00] border-[#A87B00]', icon: <Circle fill="currentColor" />, label: 'Circle' },
      { color: 'bg-[#26890C] border-[#1D6C09]', icon: <Square fill="currentColor" />, label: 'Square' }
    ];

    return (
      <div className="fixed inset-0 z-[60] bg-[#46178F] flex flex-col overflow-y-auto text-white font-sans">
        <AnimatePresence mode="wait">
          {!showFeedback && !isFinished ? (
            <motion.div 
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col pt-8 pb-4"
            >
              {/* Question Text */}
              <div className="bg-white/10 mx-6 p-12 rounded-[2rem] flex items-center justify-center min-h-[300px]">
                <motion.h2 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-3xl md:text-5xl lg:text-6xl font-black text-center leading-tight max-w-6xl"
                >
                  {q.text}
                </motion.h2>
              </div>

              {/* Progress & Timer */}
              <div className="flex items-center justify-center gap-12 my-8">
                 <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/20">
                    <span className="text-4xl font-black">{timeLeft}</span>
                 </div>
                 <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-white/50 mb-1">Status</p>
                    <p className="text-2xl font-black italic">{currentQuestionIndex + 1} / {questions.length}</p>
                 </div>
              </div>

              {/* Answers Grid */}
              <div className="flex-1 px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(idx)}
                    className={cn(
                      "flex items-center gap-6 px-10 rounded-2xl text-left border-b-[8px] transition-all",
                      shapes[idx].color
                    )}
                  >
                    <div className="w-12 h-12 flex items-center justify-center text-white/40">
                      {shapes[idx].icon}
                    </div>
                    <span className="text-xl md:text-2xl font-black uppercase italic tracking-tight">{option}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : showFeedback && !isFinished ? (
            <motion.div 
              key="feedback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "flex-1 flex flex-col items-center justify-center p-10",
                isCorrect ? "bg-[#26890C]" : "bg-[#E21B3C]"
              )}
            >
               <motion.div 
                 initial={{ scale: 0.5 }}
                 animate={{ scale: 1 }}
                 className="text-center"
               >
                 <div className="w-48 h-48 bg-white/20 rounded-[3rem] flex items-center justify-center mx-auto mb-10 border-8 border-white/20 shadow-2xl">
                    {isCorrect ? <CheckCircle2 size={120} strokeWidth={3} /> : <XCircle size={120} strokeWidth={3} />}
                 </div>
                 <h1 className="text-8xl font-black mb-4 italic tracking-tighter uppercase">{isCorrect ? 'Correct' : 'Incorrect'}</h1>
                 {isCorrect && streak > 1 && (
                   <motion.div 
                     animate={{ scale: [1, 1.1, 1] }}
                     transition={{ repeat: Infinity, duration: 1 }}
                     className="bg-amber-400 px-10 py-4 rounded-3xl text-[#46178F] font-black text-3xl uppercase italic shadow-2xl"
                   >
                     {streak} Streak! 🔥
                   </motion.div>
                 )}
                 {!isCorrect && (
                   <p className="text-3xl font-black mt-4 uppercase italic">Mastery Target: {q.options[q.correctOption]}</p>
                 )}
                 
                 <div className="mt-16 flex flex-col items-center gap-4">
                    <p className="text-2xl font-black uppercase text-white/50 tracking-widest leading-none mb-4">Current Score: {score}</p>
                    <button 
                      onClick={nextQuestion}
                      className="px-20 py-8 bg-white text-[#46178F] rounded-[3rem] font-black text-3xl uppercase italic shadow-[0_12px_0_0_#d1d5db] active:translate-y-2 active:shadow-[0_4px_0_0_#d1d5db] transition-all"
                    >
                      Next
                    </button>
                 </div>
               </motion.div>
            </motion.div>
          ) : (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-10 bg-[#46178F]"
              >
                <div className="bg-white p-16 rounded-[4rem] shadow-2xl border-b-[12px] border-slate-200 text-center max-w-2xl mx-auto w-full relative overflow-hidden text-slate-800">                  
                  <div className="w-36 h-36 bg-amber-400 rounded-[3rem] flex items-center justify-center mx-auto mb-10 rotate-6 shadow-[0_8px_0_0_#A87B00]">
                    <Trophy size={80} className="text-white" />
                  </div>
                  <h2 className="text-6xl font-black text-slate-900 mb-2 italic tracking-tighter uppercase">COMPLETED</h2>
                  <p className="text-slate-400 font-black uppercase text-xs tracking-[0.4em] mb-12">Exam Conclusion</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
                    <div className="p-8 bg-[#F2F2F2] rounded-[3rem] border-b-8 border-slate-200">
                      <p className="text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Points</p>
                      <p className="text-7xl font-black text-[#46178F] tracking-tighter italic">{score}</p>
                    </div>
                    <div className="p-8 bg-[#26890C]/10 rounded-[3rem] border-b-8 border-[#26890C]/30 text-[#26890C]">
                      <p className="text-xs font-black mb-2 uppercase tracking-widest opacity-60">Accuracy</p>
                      <p className="text-7xl font-black tracking-tighter italic">{Math.round((score / questions.length) * 100)}%</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <button 
                      onClick={() => setIsExamMode(false)}
                      className="w-full py-8 bg-[#46178F] text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xl shadow-[0_10px_0_0_#2d0f5c] hover:translate-y-1 hover:shadow-[0_4px_0_0_#2d0f5c] active:translate-y-2 active:shadow-none transition-all"
                    >
                      Return to Dashboard
                    </button>
                    <Link 
                      to="/leaderboard"
                      onClick={() => setIsExamMode(false)}
                      className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-[#46178F] transition-colors"
                    >
                      Check Global Rankings
                    </Link>
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16 max-w-7xl mx-auto py-16 px-6 lg:px-12 bg-[#F2F2F2] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
           <Link to="/" className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[#46178F] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-sm mb-12">
              <Home size={18} /> Home
           </Link>
          <h1 className="text-6xl font-black text-[#46178F] tracking-tighter uppercase italic leading-none">Assessment <br/> <span className="text-slate-900">Center</span></h1>
          <p className="text-xl font-bold text-slate-400 mt-4 leading-tight">Evaluation of candidate proficiency through official mock examinations.</p>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-b-8 border-slate-100 flex items-center gap-6 min-w-[280px]">
           <div className="w-16 h-16 bg-[#26890C] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-100">
              <ClipboardCheck size={32} />
           </div>
           <div>
              <p className="text-3xl font-black text-slate-900 leading-none">{exams.length}</p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Available Modules</p>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="h-80 bg-white rounded-[3rem] border-b-8 border-slate-200 animate-pulse" />)}
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-200">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-slate-100">
             <ClipboardCheck size={48} className="text-slate-200" />
          </div>
          <p className="text-slate-400 font-black uppercase text-sm tracking-[0.3em]">Operational units offline</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exams.map((exam, i) => {
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
                key={exam.id}
                whileHover={{ scale: 1.02, y: -8 }}
                className={cn(
                  "group p-10 rounded-[3rem] transition-all relative overflow-hidden flex flex-col justify-between min-h-[400px] border-b-8 cursor-pointer",
                  theme.color
                )}
                onClick={() => initiateExam(exam)}
              >
                <div className="relative z-10">
                   <div className="flex items-center justify-between mb-8">
                      <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
                         {exam.isRanked ? 'Competitive' : 'Practice'}
                      </div>
                      <Trophy size={20} className={cn(exam.isRanked ? 'text-amber-400' : 'text-white/50')} />
                   </div>
                   <h3 className="text-3xl font-black text-white mb-4 leading-none uppercase italic tracking-tighter">{exam.title}</h3>
                   <p className="text-white/70 text-sm font-bold leading-tight line-clamp-3">{exam.description || 'Intensive module designed for rapid concept mastery and strategic recall.'}</p>
                </div>
                
                <div className="relative z-10 pt-10">
                   <div className="flex items-center gap-6 mb-8 text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">
                      <span className="flex items-center gap-2"><Clock size={16} /> {exam.timeLimit}m</span>
                      <span className="flex items-center gap-2"><Layers size={16} /> {exam.questionCount} Qs</span>
                   </div>
                   <div className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-3 group-hover:bg-amber-400 transition-colors">
                      Start Exam <ArrowRight size={20} />
                   </div>
                </div>
                
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-black/5 rounded-full blur-3xl"></div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Nickname Prompt for Guests */}
      <AnimatePresence>
        {showNicknamePrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <UserIcon size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 text-center mb-2">Candidate Registration</h2>
              <p className="text-slate-400 text-center text-sm font-medium mb-8">Please provide a candidate nickname to be utilized for examination standings and performance tracking.</p>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Indicate your nickname..." 
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  value={guestNickname}
                  onChange={(e) => setGuestNickname(e.target.value)}
                  maxLength={15}
                />
                
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowNicknamePrompt(false)}
                    className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={!guestNickname.trim()}
                    onClick={() => tempExam && startExam(tempExam, guestNickname)}
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 hover:bg-slate-900 disabled:opacity-50 transition-all"
                  >
                    Begin Examination
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex gap-6 shadow-sm">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
          <AlertTriangle size={32} />
        </div>
        <div>
          <h4 className="font-black text-amber-900 uppercase text-xs tracking-widest mb-1">Ranked Awareness</h4>
          <p className="text-amber-800/80 text-sm leading-relaxed font-medium">
            Competitive Mock Exams impact your global rating. Your performance, speed, and accuracy are converted into points visible in the Public Hall of Fame. Results are absolute once submitted.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Exams;
