import React, { useState } from 'react';
import { 
  Shield, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  X,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

const Register = ({ onToggleLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field states
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  // Toasts
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

  const getRegisteredUsers = () => {
    const users = localStorage.getItem('horizon_users');
    return users ? JSON.parse(users) : [];
  };

  const saveRegisteredUsers = (users) => {
    localStorage.setItem('horizon_users', JSON.stringify(users));
  };

  // Validations
  const validateUsername = (val) => {
    if (val.trim() === '') return 'Username is required';
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(val)) {
      return 'Username must be 3-20 characters (alphanumeric & underscores)';
    }
    return '';
  };

  const validateEmail = (val) => {
    if (val.trim() === '') return 'Email address is required';
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (val) => {
    if (val === '') return 'Password is required';
    if (val.length < 8) return 'Password must be at least 8 characters long';
    return '';
  };

  const validateConfirmPassword = (val, pass) => {
    if (val === '') return 'Please confirm your password';
    if (val !== pass) return 'Passwords do not match';
    return '';
  };

  // Password strength computation
  const evaluatePasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const getStrengthLabel = (score) => {
    if (!password) return 'None';
    if (score === 1) return 'Weak';
    if (score === 2) return 'Fair';
    if (score === 3) return 'Good';
    if (score === 4) return 'Strong';
    return 'Weak';
  };

  const getStrengthClass = (score) => {
    if (!password) return '';
    if (score === 1) return 'auth-strength-weak';
    if (score === 2) return 'auth-strength-fair';
    if (score === 3) return 'auth-strength-good';
    if (score === 4) return 'auth-strength-strong';
    return 'auth-strength-weak';
  };

  const strengthScore = evaluatePasswordStrength(password);

  // Field change handlers
  const handleUsernameChange = (e) => {
    const val = e.target.value;
    setUsername(val);
    if (touched.username) {
      setErrors(prev => ({ ...prev, username: validateUsername(val) }));
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (touched.email) {
      setErrors(prev => ({ ...prev, email: validateEmail(val) }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (touched.password) {
      setErrors(prev => ({ ...prev, password: validatePassword(val) }));
    }
    if (touched.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword, val) }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (touched.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(val, password) }));
    }
  };

  // Blur triggers
  const handleUsernameBlur = () => {
    setTouched(prev => ({ ...prev, username: true }));
    setErrors(prev => ({ ...prev, username: validateUsername(username) }));
  };

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    setErrors(prev => ({ ...prev, email: validateEmail(email) }));
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    setErrors(prev => ({ ...prev, password: validatePassword(password) }));
  };

  const handleConfirmPasswordBlur = () => {
    setTouched(prev => ({ ...prev, confirmPassword: true }));
    setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword, password) }));
  };

  // Submit Handler
  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    const uErr = validateUsername(username);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const cpErr = validateConfirmPassword(confirmPassword, password);

    setErrors({
      username: uErr,
      email: eErr,
      password: pErr,
      confirmPassword: cpErr
    });

    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (uErr || eErr || pErr || cpErr) {
      addToast('Validation Failed', 'Please fix form validation errors.', 'error');
      return;
    }

    const users = getRegisteredUsers();
    
    // Check if username already exists
    if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
      addToast('Registration Failed', 'Username is already registered.', 'warning');
      return;
    }

    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setErrors(prev => ({ ...prev, email: 'Email address is already registered' }));
      addToast('Registration Failed', 'Email address is already registered.', 'warning');
      return;
    }

    // Insert user
    const newUser = {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      totalLogins: 0
    };

    users.push(newUser);
    saveRegisteredUsers(users);

    addToast('Account Created', 'Registration successful! Redirecting to Sign In...', 'success');

    // Pre-fill username on login screen
    localStorage.setItem('horizon_last_username', newUser.username);

    setTimeout(() => {
      onToggleLogin();
    }, 1500);
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

      {/* Main Registration Card */}
      <main className="auth-main-container">
        <section className="auth-card">
          <div className="auth-card-header">
            <div className="auth-logo">
              <Shield size={22} style={{ color: 'hsl(244 80% 65%)' }} />
              <span>Sri Gowthami Authentication World</span>
            </div>
            <h1 className="auth-card-title">Create Account</h1>
            <p className="auth-card-subtitle">Sign up to access the secure portal</p>
          </div>

          <form onSubmit={handleRegisterSubmit}>
            {/* Username */}
            <div className="auth-form-group">
              <label htmlFor="reg-username" className="auth-input-label">Username</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><User size={16} /></span>
                <input 
                  type="text" 
                  id="reg-username" 
                  className={`auth-form-input ${errors.username ? 'is-invalid' : touched.username && !errors.username ? 'is-valid' : ''}`}
                  placeholder="3-20 characters, no spaces" 
                  value={username}
                  onChange={handleUsernameChange}
                  onBlur={handleUsernameBlur}
                  required 
                />
              </div>
              {errors.username && <span className="auth-error-text">{errors.username}</span>}
            </div>

            {/* Email */}
            <div className="auth-form-group">
              <label htmlFor="reg-email" className="auth-input-label">Email Address</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Mail size={16} /></span>
                <input 
                  type="email" 
                  id="reg-email" 
                  className={`auth-form-input ${errors.email ? 'is-invalid' : touched.email && !errors.email ? 'is-valid' : ''}`}
                  placeholder="e.g. alex@example.com" 
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  required 
                />
              </div>
              {errors.email && <span className="auth-error-text">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="auth-form-group">
              <label htmlFor="reg-password" className="auth-input-label">Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Lock size={16} /></span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="reg-password" 
                  className={`auth-form-input ${errors.password ? 'is-invalid' : touched.password && !errors.password ? 'is-valid' : ''}`}
                  placeholder="Minimum 8 characters" 
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
              
              {/* Strength Meter */}
              {password && (
                <div className={getStrengthClass(strengthScore)}>
                  <div className="auth-password-strength-meter">
                    <div className="bar bar-1"></div>
                    <div className="bar bar-2"></div>
                    <div className="bar bar-3"></div>
                    <div className="bar bar-4"></div>
                  </div>
                  <span className="auth-password-strength-label">
                    Password Strength: <span className="auth-strength-val">{getStrengthLabel(strengthScore)}</span>
                  </span>
                </div>
              )}
              {errors.password && <span className="auth-error-text">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="auth-form-group">
              <label htmlFor="reg-confirm-password" className="auth-input-label">Confirm Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Lock size={16} /></span>
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  id="reg-confirm-password" 
                  className={`auth-form-input ${errors.confirmPassword ? 'is-invalid' : touched.confirmPassword && !errors.confirmPassword ? 'is-valid' : ''}`}
                  placeholder="Repeat your password" 
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onBlur={handleConfirmPasswordBlur}
                  required 
                />
                <button 
                  type="button" 
                  className="auth-btn-toggle-password" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="auth-error-text">{errors.confirmPassword}</span>}
            </div>

            {/* Register Submit */}
            <button type="submit" className="auth-btn-primary" style={{ marginTop: '10px' }}>
              <span>Get Started</span>
              <ArrowRight size={16} style={{ marginLeft: '6px' }} />
            </button>

            <p className="auth-redirect">
              Already have an account? 
              <button type="button" onClick={onToggleLogin}>Sign In</button>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Register;
