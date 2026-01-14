import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";

import logo from "@/assets/logo.png";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";

const LoginBody = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-white">
      <div className="mx-auto flex w-full max-w-[1920px]">
        <div className="relative flex w-[45%] flex-col items-center justify-center bg-white px-16 py-14">
          <div className="pointer-events-none absolute left-0 top-0 h-[531.85px] w-[531.85px] -ml-[121.8px] -mt-[124.6px] rounded-full bg-gradient-to-br from-[rgba(13,148,136,0.18)] to-[rgba(13,148,136,0)] blur-[32px] rotate-[36.47deg]" />

          <div className="absolute left-16 top-10 z-20">
            <img
              src={logo}
              alt="360 Retail"
              className="h-24 w-auto object-contain"
            />
          </div>

          <div className="relative z-10 w-full max-w-md mt-24">
            <div className="mb-3">
              <h1 className="mb-2 text-[35px] font-bold leading-[40px] tracking-[-0.9px] text-teal-600">
                Sign In
              </h1>
              <p className="text-sm text-gray-600">Welcome 360 Retail</p>
            </div>

            <div className="mb-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
            </div>

            <form className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email address"
                    className="h-12 bg-white border-gray-200 pl-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    className="h-12 bg-white border-gray-200 pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-teal-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="remember"
                  className="data-[state=checked]:bg-[#0D9488]"
                  defaultChecked
                />
                <Label
                  htmlFor="remember"
                  className="cursor-pointer text-sm font-medium text-gray-700"
                >
                  Remember me
                </Label>
              </div>

              <Button
                type="submit"
                className="h-12 w-full bg-[#0D9488] text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#0D9488]/90"
              >
                LOGIN
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Don&apos;t have an account? </span>
                <Link
                  to="/signup"
                  className="font-medium text-[#0D9488] hover:underline"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>

        <div className="relative w-[55%] h-[88vh] overflow-hidden rounded-bl-[32px] bg-gradient-to-br from-[#19D6C8] to-[#FF7B21]">
          <div className="absolute bottom-6 left-0 h-[548px] w-[677px] opacity-60">
            <div className="h-full w-full bg-gradient-to-t from-white/20 to-transparent blur-3xl" />
          </div>

          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2">
            <div className="h-full w-full rounded-full bg-white/5 backdrop-blur-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginBody;

