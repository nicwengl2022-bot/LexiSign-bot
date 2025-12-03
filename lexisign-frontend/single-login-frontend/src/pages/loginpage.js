import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/login', { emailOrPhone, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Email or Phone"
        value={emailOrPhone}
        onChange={(e) => setEmailOrPhone(e.target.value)}
        style={{ width: '100%', padding: '10px', margin: '10px 0' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', padding: '10px', margin: '10px 0' }}
      />
      <button onClick={handleLogin} style={{ width: '100%', padding: '10px' }}>Login</button>
      <p>{message}</p>
      <p>
        Don't have an account? <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => navigate('/signup')}>Signup</span>
      </p>
    </div>
  );
};

export default LoginPage;