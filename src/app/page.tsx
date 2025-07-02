'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const login = async () => {
    const res = await fetch('http://localhost:8080/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('email', email);
      router.push('/chat');
    } else {
      alert('Login falhou');
    }
  };

  return (
      <div>
        <h1>Login</h1>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Senha" type="password" onChange={(e) => setPassword(e.target.value)} />
        <button onClick={login}>Entrar</button>
      </div>
  );
}
