"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { handleApiError } from "@/utils/errorHandler"; // Import the error handler


export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [birthday, setBirthday] = useState("");
  const [mobile, setMobile] = useState("");
  const [isEmailSignup, setIsEmailSignup] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      try {
        const response = await fetch("http://localhost:8080/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: email, password }),
        });

        if (!response.ok) {
          try {
            const errorData = await response.json();
            setError(errorData.message || "Login failed");
            router.push("/error/403");
          } catch {
            setError("Login failed. Please try again.");

          }
          return;
        }

        const data = await response.json();

        // Save token and userId in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);

        // Decode JWT to get user role
        try {
          const base64Url = data.token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const decodedPayload = JSON.parse(atob(base64));
          const userRole = decodedPayload.role;

          // Redirect based on role
          if (userRole === "ADMIN") {
            router.push("/admin/accounts");
          } else {
            router.push("/dashboard");
          }
        } catch {
          setError("Login succeeded, but an error occurred while processing user role.");
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
    } else if (isEmailSignup) {
      // Registration logic
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      try {
        const newUser = {
          name,
          username,
          email,
          password,
          birthday, // the input returns an ISO date string
          mobile: Number(mobile),
          date_joined: new Date(), // current date
          role: "USER", // default role
        };

        const response = await fetch("http://localhost:8080/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });

        if (!response.ok) {
          try {
            const errorData = await response.json();
            setError(errorData.message || "Registration failed");
          } catch {
            setError("Registration failed. Please try again.");
          }
          return;
        }

        // Automatically log in after successful registration
        try {
          const loginResponse = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email, password }),
          });

          if (!loginResponse.ok) {
            setError("Registration succeeded, but auto-login failed. Please log in manually.");
            return;
          }

          const loginData = await loginResponse.json();
          localStorage.setItem("token", loginData.token);
          localStorage.setItem("userId", loginData.userId);

          router.push("/dashboard");
        } catch (err) {
          console.error(err);
          setError("Registration succeeded, but an error occurred during auto-login.");
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred during registration.");
      }
    } else {
      // For initial sign-up, show the extended sign-up form
      setIsEmailSignup(true);
    }
  };







  const toggleAuthMode = () => {
    if (isEmailSignup) {
      setIsEmailSignup(false);
      setIsLogin(false);
    } else {
      setIsLogin(!isLogin);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left side - Image */}
      <motion.div
        className="w-2/3 h-screen flex items-center justify-center bg-white"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
        <motion.img
          src="/pablologo.png"
          alt="Pablo EscoBANKS Logo"
          className="w-128 scale-105"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        </motion.div>
      </motion.div>

      {/* Right side - Form */}
      <motion.div
        className="w-1/3 min-h-screen p-12 flex flex-col bg-gray-900 shadow-[inset_6px_6px_12px_#0a0a0a,inset_-6px_-6px_12px_#141414] rounded-2xl m-2 text-white overflow-auto relative"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <motion.div
          className="mb-8 w-full text-center flex flex-col items-center justify-center"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="text-4xl font-bold mb-1">Pablo Esco-Banks</h1>
          <p className="text-lg text-gray-400">Where your money gets high</p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isEmailSignup ? "email-signup" : isLogin ? "login" : "signup"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1">
                {isLogin ? "Welcome back" : "Create an account"}
              </h2>
              <p className="text-sm text-gray-400">
                {isLogin
                  ? "Enter your credentials to access your account"
                  : "Enter your email to sign up for this app"}
              </p>
            </div>

            {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 mb-4">
              {isEmailSignup ? (
                <>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-4 py-2 border border-gray-600 rounded bg-black text-white"
                    required
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full px-4 py-2 border border-gray-600 rounded bg-black text-white"
                    required
                  />
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-600 rounded bg-black text-white"
                    required
                  />
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Mobile Number"
                    className="w-full px-4 py-2 border border-gray-600 rounded bg-black text-white"
                    required
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Email"
                    className="w-full px-4 py-2 border border-gray-600 rounded bg-black text-white"
                    required
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Password"
                    className="w-full px-4 py-2 border border-gray-600 rounded bg-black text-white"
                    required
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Confirm Password"
                    className="w-full px-4 py-2 border border-gray-600 rounded bg-black text-white"
                    required
                  />
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ x: -5, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <input
                      type="text"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Username or Email"
                      className="w-full px-4 py-2 border border-gray-600 rounded bg-black text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                      required
                    />
                  </motion.div>
                  <motion.div
                    initial={{ x: -5, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <input
                      type="password"
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Password"
                      className="w-full px-4 py-2 border border-gray-600 rounded bg-black text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                      required
                    />
                  </motion.div>
                </>
              )}

              <motion.button
                type="submit"
                className="w-full bg-white text-black py-2 rounded hover:bg-gray-300 transition-all duration-200"
              >
                {isEmailSignup
                  ? "Complete Sign Up"
                  : isLogin
                  ? "Sign in"
                  : "Sign up with email"}
              </motion.button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">or continue with</span>
              </div>
            </div>

            {/* Google auth button removed for now */}
            <div className="text-center text-sm text-gray-400">
              <p>
                By clicking continue, you agree to our{" "}
                <Link href="/terms" className="text-white font-medium hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-white font-medium hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>

            <motion.div
              className="mt-6 text-center"
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {isEmailSignup ? (
                <motion.button
                  onClick={() => setIsEmailSignup(false)}
                  className="block w-full bg-white text-black py-2 rounded mt-2 hover:bg-gray-300 transition-all duration-200"
                >
                  Back
                </motion.button>
              ) : (
                <>
                  <p className="text-gray-400">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                  </p>
                  <motion.button
                    onClick={toggleAuthMode}
                    className="block w-full bg-white text-black py-2 rounded mt-2 hover:bg-gray-300 transition-all duration-200"
                  >
                    {isLogin ? "Sign up" : "Log in"}
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
