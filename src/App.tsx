import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { 
  Home, 
  BookOpen, 
  Layers, 
  ClipboardCheck, 
  Trophy, 
  Settings, 
  LogOut,
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './pages/Dashboard';
import Flashcards from './pages/Flashcards';
import Exams from './pages/Exams';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import StudyGuides from './pages/StudyGuides';
import { cn } from './lib/utils';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !profile?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-soft border border-slate-100 text-center"
        >
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-indigo-200 rotate-3">
             <Settings size={48} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tighter">Admin Portal</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-12">Identification Required</p>
          
          <button 
            onClick={signIn}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-2xl"
          >
            <UserIcon size={18} />
            Sign in as Admin
          </button>
          
          <div className="mt-8">
            <Link to="/" className="text-sm font-bold text-indigo-600 hover:underline">Return to Public Portal</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

const Navbar = () => {
  const { profile, logout, user, signIn } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/study-guides', label: 'Study Guides' },
    { to: '/flashcards', label: 'Flashcards' },
    { to: '/exams', label: 'Practice Tests' },
    { to: '/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <nav className="h-16 bg-indigo-700 flex items-center justify-between px-4 lg:px-8 shadow-md shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-700 font-black text-xl shadow-inner">CSC</div>
        <h1 className="text-white font-bold text-lg lg:text-xl tracking-tight hidden sm:block">
          Reviewer Ace <span className="text-indigo-200 font-normal">| 2024 Portal</span>
        </h1>
      </div>

      <div className="hidden lg:flex items-center gap-6">
        <div className="flex gap-4 text-white/90 font-medium text-sm">
          {links.map(link => (
            <Link key={link.to} to={link.to} className="hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
          {profile?.isAdmin && (
            <Link to="/admin" className="text-indigo-200 hover:text-white transition-colors">Admin Panel</Link>
          )}
        </div>
        
        <div className="flex items-center gap-3 pl-4 border-l border-indigo-500">
          {user ? (
            <>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-white leading-none">{profile?.nickname || 'Admin'}</span>
                <button onClick={logout} className="text-[10px] text-indigo-200 hover:text-white uppercase tracking-tighter">Logout</button>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-400 border-2 border-indigo-200 flex items-center justify-center text-xs font-bold text-white uppercase">
                {profile?.nickname?.substring(0, 2) || 'AD'}
              </div>
            </>
          ) : (
            <button onClick={() => window.location.href = '/admin'} className="text-xs font-bold text-white bg-indigo-600 px-4 py-2 rounded-xl border border-indigo-400 hover:bg-indigo-500 transition-all">
              Admin Access
            </button>
          )}
        </div>
      </div>

      <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-0 right-0 bg-indigo-800 p-4 shadow-xl lg:hidden flex flex-col gap-4"
          >
            {links.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)} className="text-white font-medium">
                {link.label}
              </Link>
            ))}
            {profile?.isAdmin && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="text-indigo-200 font-medium">Admin Panel</Link>
            )}
            {user ? (
              <button onClick={logout} className="text-indigo-200 font-bold text-left pt-2 border-t border-indigo-600">Logout</button>
            ) : (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="text-white font-bold pt-2 border-t border-indigo-600">Admin Login</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white flex flex-col selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
          <main className="flex-1 w-full relative">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/study-guides" element={<StudyGuides />} />
                <Route path="/flashcards" element={<Flashcards />} />
                <Route path="/exams" element={<Exams />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
