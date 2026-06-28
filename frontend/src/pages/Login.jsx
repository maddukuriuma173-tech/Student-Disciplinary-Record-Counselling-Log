import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Mail, 
  Key, 
  X,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

const Login = ({ onLoginSuccess, onToggleRegister }) => {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation error states
  const [errors, setErrors] = useState({ identity: '', password: '' });
  const [touched, setTouched] = useState({ identity: false, password: false });

  // Recovery Modal states
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryTouched, setRecoveryTouched] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const addToast = (title, message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Pre-fill username if redirected from registration
  useEffect(() => {
    const lastUser = localStorage.getItem('horizon_last_username');
    if (lastUser) {
      setIdentity(lastUser);
      localStorage.removeItem('horizon_last_username');
    }
  }, []);

  const getRegisteredUsers = () => {
    const users = localStorage.getItem('horizon_users');
    return users ? JSON.parse(users) : [];
  };

  const validateEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const handleIdentityChange = (e) => {
    const val = e.target.value;
    setIdentity(val);
    if (touched.identity) {
      setErrors(prev => ({ 
        ...prev, 
        identity: val.trim() === '' ? 'Please enter your username or email' : '' 
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (touched.password) {
      setErrors(prev => ({ 
        ...prev, 
        password: val === '' ? 'Password is required' : '' 
      }));
    }
  };

  const handleIdentityBlur = () => {
    setTouched(prev => ({ ...prev, identity: true }));
    setErrors(prev => ({ 
      ...prev, 
      identity: identity.trim() === '' ? 'Please enter your username or email' : '' 
    }));
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    setErrors(prev => ({ 
      ...prev, 
      password: password === '' ? 'Password is required' : '' 
    }));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    const isIdentityValid = identity.trim() !== '';
    const isPasswordValid = password !== '';

    setErrors({
      identity: isIdentityValid ? '' : 'Please enter your username or email',
      password: isPasswordValid ? '' : 'Password is required'
    });
    setTouched({ identity: true, password: true });

    if (!isIdentityValid || !isPasswordValid) {
      addToast('Validation Failed', 'Please enter both credentials.', 'error');
      return;
    }

    const users = getRegisteredUsers();
    
    // Find user
    const userIdx = users.findIndex(u => 
      u.username.toLowerCase() === identity.trim().toLowerCase() || 
      u.email.toLowerCase() === identity.trim().toLowerCase()
    );

    if (userIdx === -1 || users[userIdx].password !== password) {
      addToast('Access Denied', 'Invalid credentials, please try again.', 'error');
      return;
    }

    // Login success - increment count
    const matchedUser = users[userIdx];
    matchedUser.totalLogins = (matchedUser.totalLogins || 0) + 1;
    users[userIdx] = matchedUser;
    localStorage.setItem('horizon_users', JSON.stringify(users));

    const sessionData = {
      username: matchedUser.username,
      email: matchedUser.email,
      loginTime: new Date().toISOString()
    };

    if (rememberMe) {
      localStorage.setItem('horizon_session', JSON.stringify(sessionData));
    } else {
      sessionStorage.setItem('horizon_session', JSON.stringify(sessionData));
    }

    addToast('Access Granted', `Welcome back, ${matchedUser.username}!`, 'success');

    setTimeout(() => {
      onLoginSuccess(sessionData);
    }, 1000);
  };

  // Recovery email logic
  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    const isEmailValid = validateEmail(recoveryEmail.trim());
    
    setRecoveryError(
      recoveryEmail.trim() === '' 
        ? 'Email address is required' 
        : (!isEmailValid ? 'Please enter a valid email address' : '')
    );
    setRecoveryTouched(true);

    if (!isEmailValid) {
      addToast('Invalid Input', 'Please enter a valid email address.', 'error');
      return;
    }

    const users = getRegisteredUsers();
    const userExists = users.some(u => u.email.toLowerCase() === recoveryEmail.trim().toLowerCase());

    if (userExists) {
      addToast('Email Dispatched', `A password reset link was sent to ${recoveryEmail}`, 'success');
      setTimeout(() => {
        setShowRecovery(false);
        setRecoveryEmail('');
        setRecoveryError('');
        setRecoveryTouched(false);
      }, 2000);
    } else {
      setRecoveryError('Email address is not registered');
      addToast('Recovery Failed', 'This email address was not found in our system.', 'warning');
    }
  };

  const handleRecoveryEmailChange = (e) => {
    const val = e.target.value;
    setRecoveryEmail(val);
    if (recoveryTouched) {
      setRecoveryError(
        val.trim() === '' 
          ? 'Email address is required' 
          : (!validateEmail(val.trim()) ? 'Please enter a valid email address' : '')
      );
    }
  };

  return (
    <div className="auth-container-wrapper">
      {/* Dynamic Glowing Background Blobs */}
      <div className="auth-bg-blur">
        <div className="auth-blob auth-blob-indigo"></div>
        <div className="auth-blob auth-blob-purple"></div>
        <div className="auth-blob auth-blob-pink"></div>
      </div>

      {/* Toast Notification System */}
      <div className="auth-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`auth-toast auth-toast-${t.type}`}>
            <span className="auth-toast-icon">
              {t.type === 'success' && <CheckCircle size={18} />}
              {t.type === 'error' && <X size={18} />}
              {t.type === 'warning' && <AlertTriangle size={18} />}
              {t.type === 'info' && <Info size={18} />}
            </span>
            <div className="auth-toast-content">
              <h4 className="auth-toast-title">{t.title}</h4>
              <p className="auth-toast-message">{t.message}</p>
            </div>
            <button className="auth-toast-close" onClick={() => removeToast(t.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Recovery Modal */}
      {showRecovery && (
        <div className="auth-modal-backdrop" onClick={() => setShowRecovery(false)}>
          <div className="auth-recovery-card" onClick={e => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h2 className="auth-modal-title">
                <Key size={20} style={{ marginRight: '6px' }} /> Recover Password
              </h2>
              <button 
                type="button" 
                className="auth-btn-close" 
                onClick={() => {
                  setShowRecovery(false);
                  setRecoveryEmail('');
                  setRecoveryError('');
                  setRecoveryTouched(false);
                }}
              >
                &times;
              </button>
            </div>
            <p className="auth-modal-subtitle">
              Enter your registered email address and we will send you instructions to reset your password.
            </p>
            
            <form onSubmit={handleRecoverySubmit}>
              <div className="auth-form-group">
                <label htmlFor="recovery-email" className="auth-input-label">Email Address</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><Mail size={16} /></span>
                  <input 
                    type="email" 
                    id="recovery-email" 
                    className={`auth-form-input ${recoveryError ? 'is-invalid' : recoveryTouched && !recoveryError ? 'is-valid' : ''}`}
                    placeholder="e.g., alex@horizon.com" 
                    value={recoveryEmail}
                    onChange={handleRecoveryEmailChange}
                    required 
                  />
                </div>
                {recoveryError && <span className="auth-error-text">{recoveryError}</span>}
              </div>
              
              <button type="submit" className="auth-btn-primary">
                <span>Send Recovery Code</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <main className="auth-main-container">
        <section className="auth-card">
          <div className="auth-card-header">
            <div className="auth-logo">
              <Shield size={22} style={{ color: 'hsl(244 80% 65%)' }} />
              <span>Sri Gowthami Authentication World</span>
            </div>
            <h1 className="auth-card-title">Welcome Back</h1>
            <p className="auth-card-subtitle">Please sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleLoginSubmit}>
            {/* Username/Email Input Group */}
            <div className="auth-form-group">
              <label htmlFor="login-identity" className="auth-input-label">Username or Email</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><User size={16} /></span>
                <input 
                  type="text" 
                  id="login-identity" 
                  className={`auth-form-input ${errors.identity ? 'is-invalid' : touched.identity && !errors.identity ? 'is-valid' : ''}`}
                  placeholder="Username or email address" 
                  value={identity}
                  onChange={handleIdentityChange}
                  onBlur={handleIdentityBlur}
                  required 
                />
              </div>
              {errors.identity && <span className="auth-error-text">{errors.identity}</span>}
            </div>

            {/* Password Input Group */}
            <div className="auth-form-group">
              <div className="auth-label-row">
                <label htmlFor="login-password" className="auth-input-label">Password</label>
                <button 
                  type="button" 
                  className="auth-forgot-pass-link" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setShowRecovery(true)}
                >
                  Forgot password?
                </button>
              </div>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Lock size={16} /></span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="login-password" 
                  className={`auth-form-input ${errors.password ? 'is-invalid' : touched.password && !errors.password ? 'is-valid' : ''}`}
                  placeholder="Enter password" 
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  required 
                />
                <button 
                  type="button" 
                  className="auth-btn-toggle-password" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="auth-error-text">{errors.password}</span>}
            </div>

            {/* Remember Me Checkbox */}
            <div className="auth-form-options">
              <label className="auth-checkbox-container">
                <input 
                  type="checkbox" 
                  id="login-remember" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="auth-checkbox-checkmark"></span>
                <span className="auth-checkbox-label">Remember me on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" className="auth-btn-primary">
              <span>Sign In</span>
              <ArrowRight size={16} style={{ marginLeft: '6px' }} />
            </button>

            <p className="auth-redirect">
              New to Sri Gowthami? 
              <button type="button" onClick={onToggleRegister}>Create an account</button>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Login;
