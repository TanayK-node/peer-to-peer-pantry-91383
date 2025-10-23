import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication - in real app, this would call backend
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-4xl">C</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{isLogin ? "Login" : "Sign Up"}</h1>
          <p className="text-muted-foreground">
            {isLogin ? "Welcome to CampusTrades" : "Create your CampusTrades account"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Username"
              className="pl-10 h-12"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              className="pl-10 h-12"
              required
            />
          </div>

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Forget Password?
              </button>
            </div>
          )}

          <Button type="submit" className="w-full h-12 text-base">
            {isLogin ? "Login" : "Sign Up"}
          </Button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium"
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
