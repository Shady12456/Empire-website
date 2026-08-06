'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import type { Locale } from '@/types';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
  locale: Locale;
}

export function SignInForm({ locale }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });
  
  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (error) {
        setError(error.message);
        return;
      }
      
      // Redirect on success
      window.location.href = `/${locale}/dashboard`;
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          {locale === 'fr' ? 'Email' : 'Email'}
        </label>
        <input
          type="email"
          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          id="email"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <div className="invalid-feedback">
            {locale === 'fr' ? 'Email invalide' : 'Invalid email'}
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="password" className="form-label">
          {locale === 'fr' ? 'Mot de passe' : 'Password'}
        </label>
        <input
          type="password"
          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          id="password"
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && (
          <div className="invalid-feedback">
            {locale === 'fr' ? 'Mot de passe requis (min 6 caractères)' : 'Password required (min 6 characters)'}
          </div>
        )}
      </div>
      
      <button
        type="submit"
        className="btn btn-empire-primary w-100"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            {locale === 'fr' ? 'Connexion...' : 'Signing in...'}
          </>
        ) : (
          locale === 'fr' ? 'Se connecter' : 'Sign In'
        )}
      </button>
    </form>
  );
}
