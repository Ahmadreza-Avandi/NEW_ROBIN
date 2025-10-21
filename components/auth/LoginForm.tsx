'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function LoginForm({ onSuccess, redirectTo = '/dashboard' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          // Wait for cookie to be set, then redirect
          setTimeout(() => {
            window.location.href = redirectTo;
          }, 100);
        }
      } else {
        setError(data.message || 'خطا در ورود به سیستم');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('خطا در اتصال به سرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative border-border/50 backdrop-blur-sm bg-background/95 shadow-2xl">
      <CardContent className="p-8">

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold font-vazir text-foreground mb-2">
            خوش آمدید
          </h2>
          <p className="text-muted-foreground font-vazir">
            لطفاً برای ادامه وارد شوید
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-vazir text-sm font-medium">
              ایمیل
            </Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ایمیل خود را وارد کنید"
                required
                className="font-vazir h-12 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                dir="rtl"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-vazir text-sm font-medium">
              رمز عبور
            </Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور خود را وارد کنید"
                required
                className="font-vazir h-12 px-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                dir="rtl"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              disabled={isLoading}
            />
            <Label htmlFor="remember" className="font-vazir text-sm cursor-pointer">
              مرا به خاطر بسپار
            </Label>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              <p className="text-destructive text-sm font-vazir">
                {error}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 font-vazir bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                در حال ورود...
              </div>
            ) : (
              'ورود به سیستم'
            )}
          </Button>

          {/* Forgot password link */}
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 font-vazir"
              disabled={isLoading}
            >
              رمز عبور خود را فراموش کرده‌اید؟
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}