'use client';
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type UserRole = 'ORDER_MANAGER' | 'ACCOUNTANT' | 'MANAGER' | 'CEO' | 'ADMIN' | 'CUSTOMER';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const role = searchParams.get('role');
    if (role) {
      setSelectedRole(role);
      // Pre-fill email based on role (for demo purposes)
      setEmail(`${role}@spade.com`);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      console.log('Attempting login with:', { email: email.toLowerCase() });
      
      const response = await fetch(`${process.env.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: email.toLowerCase(),
          password: password.trim()
        }),
      });

      // Log the full response for debugging
      console.log('Login response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers]),
      });

      const contentType = response.headers.get('content-type');
      // let errorData;
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          console.error('Login error response:', data);
          // errorData = data;
          throw new Error(data.message || 'Login failed');
        }
        
        console.log('Login success data:', { ...data, access_token: '***' });

        if (data.access_token) {
          try {
            // Get user role using the token
            const roleResponse = await fetch(`${process.env.BASE_URL}/auth/roles/${data.user.id}`, {
              headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${data.access_token}`
              },
              credentials: 'include',
            });

            if (!roleResponse.ok) {
              const roleError = await roleResponse.json();
              console.error('Role fetch error:', roleError);
              throw new Error(roleError.message || 'Failed to get user role');
            }

            const roleData = await roleResponse.json();
            console.log('Role data:', roleData);

            const user = {
              ...data.user,
              token: data.access_token,
              role: roleData.role.toUpperCase()
            };

            console.log('Setting user data:', user);

            // Set cookies with proper attributes
            document.cookie = `token=${data.access_token}; path=/; secure; samesite=strict`;
            document.cookie = `user=${JSON.stringify(user)}; path=/; secure; samesite=strict`;
            
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', data.access_token);

            const roleRedirects: Record<UserRole, string> = {
              'ORDER_MANAGER': '/dashboard/orders',
              'ACCOUNTANT': '/dashboard/finance',
              'MANAGER': '/dashboard/management',
              'CEO': '/dashboard/reports',
              'ADMIN': '/dashboard/admin',
              'CUSTOMER': '/dashboard/orders'
            };

            const defaultPath = roleRedirects[roleData.role.toUpperCase() as UserRole] || '/dashboard';
            console.log('Redirecting to:', defaultPath);
            router.push(defaultPath);
          } catch (roleError) {
            console.error('Role fetch error:', roleError);
            throw roleError;
          }
        } else {
          throw new Error('No access token received');
        }
      } else {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Login error details:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    }
  };

  const getRoleTitle = (roleId: string) => {
    const roleTitles: { [key: string]: string } = {
      ORDER_MANAGER: 'ORDER_MANAGER',
      ACCOUNTANT: 'ACCOUNTANT',
      MANAGER: 'MANAGER',
      CEO: 'CEO',
      ADMIN: 'ADMIN',
      CUSTOMER: 'CUSTOMER'
    };
    return roleTitles[roleId] || '';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logos/logo-spade.png"
              alt="SpaDe Company Logo"
              width={80}
              height={80}
              className="mx-auto object-contain"
            />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to SpaDe
          </h2>
          {selectedRole && (
            <p className="mt-2 text-lg text-indigo-600">
              Logging in as {getRoleTitle(selectedRole)}
            </p>
          )}
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to access your dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
} 
