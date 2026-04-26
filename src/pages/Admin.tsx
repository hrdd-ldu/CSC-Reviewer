import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { LogOut, Settings, BookOpen, Layers, ClipboardCheck, Plus, Trash2, Edit2, Save, X, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

const Admin = () => {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'guides' | 'flashcards' | 'exams'>('guides');

  if (!profile?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center animate-bounce">
           <AlertTriangle size={40} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Access Denied</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Unauthorized Personnel Only</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex gap-4">
           <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">Administrative Operations</p>
           </div>
           <button 
             onClick={logout}
             className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-100 transition-all ml-4"
           >
             <LogOut size={14} /> Exit Portal
           </button>
        </div>
        <div className="flex gap-2 p-1.5 bg-white border border-slate-100 rounded-[2rem] w-fit shadow-sm">
          {[
            { id: 'guides', label: 'Reviewers', icon: BookOpen },
            { id: 'flashcards', label: 'Flashcards', icon: Layers },
            { id: 'exams', label: 'Exams', icon: ClipboardCheck },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all",
                activeTab === tab.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[3rem] shadow-soft border border-slate-100"
      >
        {activeTab === 'guides' && <ManageGuides />}
        {activeTab === 'flashcards' && <ManageFlashcards />}
        {activeTab === 'exams' && <ManageExams />}
      </motion.div>
    </div>
  );
};

const ManageGuides = () => {
  const [guides, setGuides] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', contentUrl: '', category: 'General Info' });

  const fetchGuides = async () => {
    try {
      const q = await getDocs(collection(db, 'studyGuides'));
      setGuides(q.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching guides:", error);
    }
  };

  useEffect(() => { fetchGuides(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this study guide? This action cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'studyGuides', id));
      await fetchGuides();
    } catch (error) {
      console.error("Error deleting guide:", error);
      alert("Failed to delete the study guide. Please check your permissions.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'studyGuides'), { ...formData, createdAt: serverTimestamp() });
    setFormData({ title: '', description: '', contentUrl: '', category: 'General Info' });
    setIsAdding(false);
    fetchGuides();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Reviewers</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />} {isAdding ? 'Close Panel' : 'New Material'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit} 
            className="p-8 bg-slate-50 rounded-[2rem] space-y-5 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Title</label>
                <input required placeholder="Reviewer Name" className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                <input required placeholder="Category" className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Material Link (PDF/URL)</label>
              <input required placeholder="e.g. https://drive.google.com/rules.pdf" className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" value={formData.contentUrl} onChange={e => setFormData({...formData, contentUrl: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Executive Summary</label>
              <textarea placeholder="Brief overview of the material content..." className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold h-32" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Save Material</button>
          </motion.form>
        )}
      </AnimatePresence>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guides.map(g => (
          <div key={g.id} className="group flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all">
            <div>
              <p className="font-black text-slate-800 leading-none mb-1">{g.title}</p>
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{g.category}</p>
            </div>
            <button 
              onClick={() => handleDelete(g.id)} 
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ManageFlashcards = () => {
  const [decks, setDecks] = useState<any[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [cardData, setCardData] = useState({ front: '', back: '' });

  const fetchDecks = async () => {
    try {
      const q = await getDocs(collection(db, 'flashcardDecks'));
      setDecks(q.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching decks:", error);
    }
  };

  useEffect(() => { fetchDecks(); }, []);

  const handleDeleteDeck = async (id: string) => {
    if (!window.confirm('Delete this deck and all its flashcards? This cannot be undone.')) return;
    try {
      if (selectedDeckId === id) setSelectedDeckId(null);
      await deleteDoc(doc(db, 'flashcardDecks', id));
      await fetchDecks();
    } catch (error) {
      console.error("Error deleting deck:", error);
      alert("Failed to delete the deck. Please ensure you have administrative permissions.");
    }
  };

  const addDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'flashcardDecks'), { title: deckName, category: 'Intel Pack', cardCount: 0 });
    setDeckName('');
    setIsAdding(false);
    fetchDecks();
  };

  const addCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeckId) return;
    await addDoc(collection(db, `flashcardDecks/${selectedDeckId}/cards`), cardData);
    const deckRef = doc(db, 'flashcardDecks', selectedDeckId);
    const deck = decks.find(d => d.id === selectedDeckId);
    await updateDoc(deckRef, { cardCount: (deck.cardCount || 0) + 1 });
    setCardData({ front: '', back: '' });
    fetchDecks();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Flashcards</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all">
          {isAdding ? <X size={16} /> : <Plus size={16} />} Create New Deck
        </button>
      </div>

      {isAdding && (
         <form onSubmit={addDeck} className="p-8 bg-slate-50 rounded-[2rem] flex flex-col sm:flex-row gap-4">
           <input required placeholder="Deck Identification Name" className="flex-1 p-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold" value={deckName} onChange={e => setDeckName(e.target.value)} />
           <button type="submit" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Confirm Deck</button>
         </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map(d => (
          <div key={d.id} className={cn(
            "p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer relative group", 
            selectedDeckId === d.id ? "border-indigo-600 bg-indigo-50/50 shadow-soft" : "border-slate-50 bg-slate-50/30 hover:border-indigo-200"
          )} onClick={() => setSelectedDeckId(d.id)}>
              <div className="flex justify-between items-start mb-6">
                 <div className={cn(
                   "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                   selectedDeckId === d.id ? "bg-indigo-600 text-white" : "bg-white text-slate-300 group-hover:text-indigo-400"
                 )}>
                    <Layers size={18} />
                 </div>
                 <button 
                   onClick={(e) => { e.stopPropagation(); handleDeleteDeck(d.id); }} 
                   className="p-2 text-slate-200 hover:text-rose-500 transition-colors"
                 >
                   <Trash2 size={16} />
                 </button>
              </div>
              <h3 className="font-black text-slate-800 leading-tight mb-2">{d.title}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.cardCount || 0} Flashcards</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedDeckId && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pt-10 border-t border-slate-100"
          >
             <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row gap-10">
                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-6">Add Learning Objective</h3>
                  <form onSubmit={addCard} className="space-y-5">
                    <input required placeholder="Front: Prompt / Term" className="w-full p-4 rounded-2xl bg-white border border-slate-200 font-bold" value={cardData.front} onChange={e => setCardData({...cardData, front: e.target.value})} />
                    <textarea required placeholder="Back: Identification / Fact" className="w-full p-4 rounded-2xl bg-white border border-slate-200 font-bold h-32" value={cardData.back} onChange={e => setCardData({...cardData, back: e.target.value})} />
                    <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100">Commit to Database</button>
                  </form>
                </div>
                <div className="w-full md:w-64 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Selected Deck</p>
                   <h4 className="text-lg font-black text-indigo-600 leading-tight mb-2">{decks.find(d => d.id === selectedDeckId)?.title}</h4>
                   <Layers className="text-indigo-100 my-4" size={48} />
                   <button onClick={() => setSelectedDeckId(null)} className="text-[10px] font-black text-slate-400 uppercase hover:text-rose-500 transition-colors">Clear Selection</button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ManageExams = () => {
    const [exams, setExams] = useState<any[]>([]);
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [examData, setExamData] = useState({ title: '', description: '', timeLimit: 60, isRanked: true, category: 'General Proficiency' });
    const [questionData, setQuestionData] = useState({ text: '', options: ['', '', '', ''], correctOption: 0 });
  
    const fetchExams = async () => {
      try {
        const q = await getDocs(collection(db, 'exams'));
        setExams(q.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching exams:", error);
      }
    };
  
    useEffect(() => { fetchExams(); }, []);

    const handleDeleteExam = async (id: string) => {
      if (!window.confirm('Are you sure you want to delete this examination? All related data will be lost.')) return;
      try {
        if (selectedExamId === id) setSelectedExamId(null);
        await deleteDoc(doc(db, 'exams', id));
        await fetchExams();
      } catch (error) {
        console.error("Error deleting exam:", error);
        alert("Failed to delete the examination.");
      }
    };
  
    const addExam = async (e: React.FormEvent) => {
      e.preventDefault();
      await addDoc(collection(db, 'exams'), { ...examData, questionCount: 0 });
      setExamData({ title: '', description: '', timeLimit: 60, isRanked: true, category: 'General Proficiency' });
      setIsAdding(false);
      fetchExams();
    };
  
    const addQuestion = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedExamId) return;
      await addDoc(collection(db, `exams/${selectedExamId}/questions`), questionData);
      const examRef = doc(db, 'exams', selectedExamId);
      const exam = exams.find(ex => ex.id === selectedExamId);
      await updateDoc(examRef, { questionCount: (exam.questionCount || 0) + 1 });
      setQuestionData({ text: '', options: ['', '', '', ''], correctOption: 0 });
      fetchExams();
    };
  
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Exams</h2>
          <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 px-6 py-3 bg-amber-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-100 transition-all hover:bg-amber-500">
            {isAdding ? <X size={16} /> : <Plus size={16} />} New Examination
          </button>
        </div>
  
        {isAdding && (
           <form onSubmit={addExam} className="p-8 bg-slate-50 rounded-[2rem] gap-5 grid grid-cols-1 md:grid-cols-2">
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Examination Title</label>
                <input required placeholder="Official Exam Title" className="w-full p-4 rounded-2xl bg-white border border-slate-200 font-bold" value={examData.title} onChange={e => setExamData({...examData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Limit (Minutes)</label>
                <input type="number" required placeholder="60" className="w-full p-4 rounded-2xl bg-white border border-slate-200 font-bold" value={examData.timeLimit} onChange={e => setExamData({...examData, timeLimit: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evaluation Type</label>
                <select className="w-full p-4 rounded-2xl bg-white border border-slate-200 font-black uppercase text-xs" value={examData.isRanked ? 'true' : 'false'} onChange={e => setExamData({...examData, isRanked: e.target.value === 'true'})}>
                  <option value="true">Graded Result</option>
                  <option value="false">Practice Session</option>
                </select>
              </div>
              <button type="submit" className="col-span-1 md:col-span-2 mt-2 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-black transition-all">Create Examination</button>
           </form>
        )}
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(ex => (
            <div key={ex.id} className={cn(
              "p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer relative group", 
              selectedExamId === ex.id ? "border-amber-400 bg-amber-50/50" : "border-slate-50 bg-slate-50/30 hover:border-amber-200"
            )} onClick={() => setSelectedExamId(ex.id)}>
                <div className="flex justify-between items-start mb-6">
                   <div className={cn(
                     "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm",
                     selectedExamId === ex.id ? "bg-amber-400 text-white" : "bg-white text-slate-300 group-hover:text-amber-400"
                   )}>
                      <ClipboardCheck size={18} />
                   </div>
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleDeleteExam(ex.id); }} 
                     className="p-2 text-slate-200 hover:text-rose-500 transition-colors"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
                <h3 className="font-black text-slate-800 leading-tight mb-2">{ex.title}</h3>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ex.questionCount || 0} SCENARIOS</span>
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                    ex.isRanked ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                  )}>{ex.isRanked ? 'RANKED' : 'TRAIN'}</span>
                </div>
            </div>
          ))}
        </div>
  
        <AnimatePresence>
          {selectedExamId && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-10 border-t border-slate-100"
            >
               <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Question Deployment</h3>
                    <button onClick={() => setSelectedExamId(null)} className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-all uppercase tracking-widest flex items-center gap-2">
                       Dismiss <X size={14} />
                    </button>
                  </div>
                  
                  <form onSubmit={addQuestion} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Scenario Text</label>
                       <textarea required placeholder="What is the standard procedure for..." className="w-full p-5 rounded-[2rem] bg-white border border-slate-200 font-bold h-32 outline-none focus:ring-2 focus:ring-amber-400" value={questionData.text} onChange={e => setQuestionData({...questionData, text: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {questionData.options.map((opt, idx) => (
                            <div key={idx} className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Option {String.fromCharCode(65+idx)}</label>
                               <input required className="w-full p-4 rounded-2xl bg-white border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-amber-400" value={opt} onChange={e => {
                                   const newOpts = [...questionData.options];
                                   newOpts[idx] = e.target.value;
                                   setQuestionData({...questionData, options: newOpts});
                               }} />
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-white rounded-3xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correct Response Protocol:</span>
                            <div className="flex gap-2">
                                {[0, 1, 2, 3].map(val => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setQuestionData({...questionData, correctOption: val})}
                                    className={cn(
                                      "w-10 h-10 rounded-xl font-black text-xs transition-all",
                                      questionData.correctOption === val ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                    )}
                                  >
                                    {String.fromCharCode(65 + val)}
                                  </button>
                                ))}
                            </div>
                        </div>
                        <button type="submit" className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all">Deploy Question</button>
                    </div>
                  </form>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
};

export default Admin;
