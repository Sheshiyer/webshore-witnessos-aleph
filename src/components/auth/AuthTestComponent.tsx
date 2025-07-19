/**
 * Authentication Test Component
 * 
 * Simple component to test backend-frontend authentication connection
 */

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const AuthTestComponent: React.FC = () => {
  const { login, register, logout, isAuthenticated, user, isLoading, error } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword123');
  const [name, setName] = useState('Test User');
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testRegistration = async () => {
    addTestResult('Testing registration...');
    try {
      const result = await register(email, password, name);
      if (result.success) {
        addTestResult('✅ Registration successful');
      } else {
        addTestResult(`❌ Registration failed: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ Registration error: ${error}`);
    }
  };

  const testLogin = async () => {
    addTestResult('Testing login...');
    try {
      const result = await login(email, password);
      if (result.success) {
        addTestResult('✅ Login successful');
      } else {
        addTestResult(`❌ Login failed: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ Login error: ${error}`);
    }
  };

  const testLogout = async () => {
    addTestResult('Testing logout...');
    try {
      await logout();
      addTestResult('✅ Logout successful');
    } catch (error) {
      addTestResult(`❌ Logout error: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 text-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">🔐 Authentication Test Panel</h2>
      
      {/* Current Auth State */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current State</h3>
        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Loading:</strong> {isLoading ? '🔄 Yes' : '✅ No'}</p>
        <p><strong>User:</strong> {user ? `${user.name} (${user.email})` : 'None'}</p>
        {error && <p className="text-red-400"><strong>Error:</strong> {error}</p>}
      </div>

      {/* Test Credentials */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Test Credentials</h3>
        <div className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 bg-gray-700 rounded border border-gray-600"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 bg-gray-700 rounded border border-gray-600"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full p-2 bg-gray-700 rounded border border-gray-600"
          />
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={testRegistration}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded"
        >
          Test Register
        </button>
        <button
          onClick={testLogin}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded"
        >
          Test Login
        </button>
        <button
          onClick={testLogout}
          disabled={isLoading || !isAuthenticated}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded"
        >
          Test Logout
        </button>
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
        >
          Clear Results
        </button>
      </div>

      {/* Test Results */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Test Results</h3>
        <div className="max-h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-400">No tests run yet</p>
          ) : (
            <ul className="space-y-1 text-sm font-mono">
              {testResults.map((result, index) => (
                <li key={index} className="text-gray-300">{result}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
