import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useGameStore } from '../hooks/useGameStore';
import { motion } from 'motion/react';
import { LogIn, Mail, Phone, Chrome, X, Loader2 } from 'lucide-react';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setUser = useGameStore((state) => state.setUser);
  const loadProgress = useGameStore((state) => state.loadProgress);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        loadProgress(user.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [setUser, loadProgress]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    setLoading(true);
    setError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  };

  const handlePhoneSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(confirmation);
      setShowPhoneInput(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-gray-900 border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter uppercase italic text-red-600">Identity Required</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Access the shadows with your credentials</p>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/50 text-red-400 text-xs rounded flex items-center gap-2">
            <X className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Email/Password */}
          {!showPhoneInput && (
            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm outline-none focus:border-red-600/50 transition-colors"
                />
              </div>
              <div className="relative">
                <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm outline-none focus:border-red-600/50 transition-colors"
                />
              </div>
              <button 
                onClick={handleEmailAuth}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isRegistering ? 'Create Account' : 'Sign In'}
              </button>
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full text-[10px] text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
              >
                {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
              </button>
            </div>
          )}

          {/* Phone Auth */}
          {showPhoneInput ? (
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Enter OTP Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-sm outline-none focus:border-red-600/50"
              />
              <button 
                onClick={verifyOtp}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Code'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative flex items-center gap-2">
                <div className="flex-1 h-[1px] bg-white/10" />
                <span className="text-[10px] text-gray-600 uppercase">OR</span>
                <div className="flex-1 h-[1px] bg-white/10" />
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Chrome className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Google</span>
                </button>
                <button 
                  onClick={() => setShowPhoneInput(true)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Phone</span>
                </button>
              </div>
            </div>
          )}

          {showPhoneInput && !confirmationResult && (
             <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="+1 123 456 7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-sm outline-none focus:border-red-600/50"
                />
                <button 
                  onClick={handlePhoneSignIn}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Send OTP
                </button>
                <div id="recaptcha-container"></div>
             </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
