// components/LoginForm.tsx
import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await onLogin(email, password);
      if (!success) {
        setError('Credenciales inválidas');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <input
          type="email"
          className="form-control"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
      </div>
      <div className="mb-3">
        <input
          type="password"
          className="form-control"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <button type="submit" className="btn btn-primary w-100" disabled={loading}>
        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
};

export default LoginForm;