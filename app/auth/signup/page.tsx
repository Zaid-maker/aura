"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, User, AtSign, Sparkles } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Register the user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      // Sign in after successful registration
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "Registration successful, but sign in failed. Please try signing in.",
        );
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-pink-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-pink-950/20 dark:to-gray-950 px-4 py-12">
      <div className="w-full max-w-md space-y-4">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center space-y-4 pb-8">
              {/* Logo with gradient */}
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1
                }}
                className="flex justify-center"
              >
                <div className="bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text">
                  <CardTitle className="text-5xl font-bold text-transparent flex items-center gap-2 justify-center">
                    Aura
                    <Sparkles className="h-8 w-8 text-pink-600" />
                  </CardTitle>
                </div>
              </motion.div>
              <CardDescription className="text-base">
                Create your account and start building your aura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 border-2 focus-visible:ring-pink-500"
                    />
                  </div>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      name="name"
                      placeholder="Full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 border-2 focus-visible:ring-pink-500"
                    />
                  </div>
                </div>

                {/* Username Input */}
                <div className="space-y-2">
                  <div className="relative">
                    <AtSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 border-2 focus-visible:ring-pink-500"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password (min. 6 characters)"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="pl-10 pr-10 h-12 border-2 focus-visible:ring-pink-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  >
                    <p className="text-sm text-red-600 dark:text-red-400 text-center">
                      {error}
                    </p>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold text-base shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>

              {/* Terms */}
              <p className="text-xs text-center text-muted-foreground px-8">
                By signing up, you agree to our{" "}
                <span className="font-semibold">Terms</span>,{" "}
                <span className="font-semibold">Data Policy</span> and{" "}
                <span className="font-semibold">Cookies Policy</span>.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sign In Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-2">
            <CardContent className="pt-6 text-center">
              <p className="text-sm">
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="font-semibold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent hover:from-pink-700 hover:to-purple-700"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
