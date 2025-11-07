import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import logo from "@/assets/logo.png";
import campusBackground from "@/assets/campus-background.png";

const authSchema = z.object({
  email: z.string()
    .email("Invalid email address"),
    // .refine((email) => email.endsWith("@torontomu.ca"), {
    //   message: "Only @torontomu.ca email addresses are allowed",
    // }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (user) {
      navigate(redirectTo);
    }
  }, [user, navigate, redirectTo]);

  // Check if we're in password reset mode
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setIsResettingPassword(true);
      setIsForgotPassword(false);
      setIsLogin(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isResettingPassword) {
        // Handle password reset
        const validated = z.string().min(6, "Password must be at least 6 characters").parse(formData.password);

        const { error } = await supabase.auth.updateUser({
          password: validated,
        });

        if (error) throw error;

        // Sign out the user after password reset
        await supabase.auth.signOut();

        toast({
          title: "Password updated!",
          description: "Please login with your new password.",
        });
        
        // Reset form and switch to login mode
        setFormData({ email: "", password: "", fullName: "" });
        setIsResettingPassword(false);
        setIsLogin(true);
      } else if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/auth`,
        });

        if (error) throw error;

        toast({
          title: "Password reset email sent!",
          description: "Please check your email for the password reset link.",
        });
        setIsForgotPassword(false);
      } else {
        const validationData = isLogin 
          ? { email: formData.email, password: formData.password }
          : formData;
        
        const validated = authSchema.parse(validationData);

        if (isLogin) {
          const { error } = await supabase.auth.signInWithPassword({
            email: validated.email,
            password: validated.password,
          });

          if (error) throw error;

          toast({
            title: "Welcome back!",
            description: "You've successfully logged in.",
          });
        } else {
          const { error } = await supabase.auth.signUp({
            email: validated.email,
            password: validated.password,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                full_name: validated.fullName,
              },
            },
          });

          if (error) throw error;

          toast({
            title: "Welcome to the app!",
            description: "Your account has been created successfully.",
          });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${campusBackground})` }}
      >
        <div className="absolute inset-0 bg-background/50"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="CampusTrades Logo" className="w-20 h-20 object-contain" />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-black dark:text-foreground">
            {isResettingPassword ? "Set New Password" : isForgotPassword ? "Reset Password" : isLogin ? "Login" : "Sign Up"}
          </h1>
          <p className="text-black dark:text-muted-foreground">
            {isResettingPassword
              ? "Enter your new password below"
              : isForgotPassword 
                ? "Enter your email to receive a password reset link" 
                : isLogin ? "Welcome to CampusTrades" : "Create your CampusTrades account"
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {!isLogin && !isForgotPassword && !isResettingPassword && (
            <div className="space-y-1">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  className="pl-10 h-12"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName}</p>
              )}
            </div>
          )}

          {!isResettingPassword && (
            <div className="space-y-1">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  className="pl-10 h-12"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
          )}

          {!isForgotPassword && (
            <div className="space-y-1">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder={isResettingPassword ? "New Password" : "Password"}
                  className="pl-10 h-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>
          )}

          {isLogin && !isForgotPassword && !isResettingPassword && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-black dark:text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
            {loading ? "Please wait..." : isResettingPassword ? "Update Password" : isForgotPassword ? "Send Reset Link" : isLogin ? "Login" : "Sign Up"}
          </Button>
        </form>

        {/* Toggle Login/Signup */}
        {!isResettingPassword && (
          <div className="text-center">
            {isForgotPassword ? (
            <p className="text-sm text-black dark:text-muted-foreground">
              Remember your password?{" "}
              <button
                onClick={() => setIsForgotPassword(false)}
                className="text-primary font-medium"
              >
                Back to Login
              </button>
            </p>
          ) : (
            <p className="text-sm text-black dark:text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-medium"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
