import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const res = await axios.post('http://localhost:5000/signup', { emailOrPhone, password });
      setMessage(res.data.message);
      navigate('/login');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <h2>Signup</h2>
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
      <button onClick={handleSignup} style={{ width: '100%', padding: '10px' }}>Signup</button>
      <p>{message}</p>
      <p>
        Already have an account? <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => navigate('/login')}>Login</span>
      </p>
    </div>
  );
};

export default SignupPage;