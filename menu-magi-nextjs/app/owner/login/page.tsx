'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, Chrome } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function OwnerLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  // Email/Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if owner record exists
        const { data: ownerData, error: ownerError } = await supabase
          .from('owners')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (ownerError && ownerError.code === 'PGRST116') {
          // Owner record doesn't exist, create one
          const { error: insertError } = await supabase
            .from('owners')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              restaurant_name: 'My Restaurant', // Default name
            });

          if (insertError) {
            console.error('Error creating owner record:', insertError);
            toast.error('Account created but please contact admin to complete setup');
            await supabase.auth.signOut();
            return;
          }
        }

        toast.success('Login successful!');
        router.push('/owner/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !restaurantName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/owner/dashboard`,
          data: {
            restaurant_name: restaurantName,
          }
        },
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      if (data.user) {
        console.log('User created:', data.user.id);
        console.log('Session:', data.session ? 'Yes' : 'No');
        
        // Check if email confirmation is required
        if (!data.session) {
          toast.success('Account created! Please check your email to confirm your account.');
          setIsSignup(false);
          setEmail('');
          setPassword('');
          setRestaurantName('');
          setLoading(false);
          return;
        }
        
        // If we have a session, create owner record
        // Wait a moment for the session to be fully established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create owner record
        const { error: insertError } = await supabase
          .from('owners')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            restaurant_name: restaurantName,
          });

        if (insertError) {
          console.error('Error creating owner record:', insertError);
          console.error('Error details:', JSON.stringify(insertError, null, 2));
          console.error('User ID:', data.user.id);
          console.error('Auth UID check - trying to get session...');
          
          const { data: sessionCheck } = await supabase.auth.getSession();
          console.error('Session check:', sessionCheck.session ? 'Has session' : 'No session');
          console.error('Session user ID:', sessionCheck.session?.user.id);
          
          // Try to delete the auth user if owner creation fails
          await supabase.auth.signOut();
          throw new Error(`Failed to create restaurant account: ${insertError.message || insertError.code || 'Unknown error'}`);
        }

        toast.success('Account created successfully!');
        router.push('/owner/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Google login failed');
      setLoading(false);
    }
  };

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Home
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👨‍🍳</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignup ? 'Create Owner Account' : 'Owner Login'}
            </h1>
            <p className="text-gray-600">
              {isSignup ? 'Set up your restaurant' : 'Sign in to manage your restaurant'}
            </p>
          </div>

          {/* Google Login/Signup */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 bg-white border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Chrome className="h-5 w-5 text-red-500" />
            {isSignup ? 'Sign up with Google' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={isSignup ? handleEmailSignup : handleEmailLogin} className="space-y-4">
            {/* Restaurant Name (Signup only) */}
            {isSignup && (
              <div>
                <label htmlFor="restaurant" className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name
                </label>
                <input
                  id="restaurant"
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="My Amazing Restaurant"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                  disabled={loading}
                  required={isSignup}
                />
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@restaurant.com"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password {isSignup && <span className="text-gray-500">(min. 6 characters)</span>}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isSignup ? 'Creating Account...' : 'Signing in...') : (isSignup ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setEmail('');
                setPassword('');
                setRestaurantName('');
              }}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              disabled={loading}
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
          <p className="text-blue-200 text-sm">
            🔐 Secure authentication powered by Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
