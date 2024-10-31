import React from 'react';
import { User } from 'lucide-react';

interface LoginMethodsProps {
  loginMethod: 'account' | 'passwordless';
  setLoginMethod: (method: 'account' | 'passwordless') => void;
}

const LoginMethods: React.FC<LoginMethodsProps> = ({ loginMethod, setLoginMethod }) => {
  return (
    <div className="flex justify-center space-x-4 mb-8">
      <button
        onClick={() => setLoginMethod('account')}
        className={`flex items-center px-4 py-2 rounded-md ${
          loginMethod === 'account'
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <User className="h-5 w-5 mr-2" />
        Account ID
      </button>
      <button
        onClick={() => setLoginMethod('passwordless')}
        className={`flex items-center px-4 py-2 rounded-md ${
          loginMethod === 'passwordless'
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm0-9a1 1 0 011 1v3a1 1 0 11-2 0V8a1 1 0 011-1zm0 6a1 1 0 100 2 1 1 0 000-2z" />
        </svg>
        Passwordless
      </button>
    </div>
  );
};

export default LoginMethods;