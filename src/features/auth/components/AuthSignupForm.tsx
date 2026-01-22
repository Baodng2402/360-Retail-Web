import { useState } from "react";
import { Link } from "react-router-dom";
import { Apple, Chrome, Facebook, Mail, Lock } from "lucide-react";

import logo from "@/assets/logo.png";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";

const socialButtons = [
  { icon: Facebook, label: "Facebook" },
  { icon: Apple, label: "Apple" },
  { icon: Chrome, label: "Google" },
] as const;

export function AuthSignupForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-white">
      <div className="pointer-events-none absolute inset-x-10 top-10 h-[320px] rounded-[24px] bg-[linear-gradient(160deg,rgba(25,214,200,1)_0%,rgba(255,123,33,1)_100%)] shadow-md" />

      <div className="pointer-events-none absolute left-16 top-16 z-10">
        <img
          src={logo}
          alt="360 Retail"
          className="h-24 w-auto object-contain"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-24 z-10 flex justify-center">
        <div className="text-center text-white">
          <h2 className="text-sm font-semibold tracking-wide mb-2">
            Sign in with
          </h2>
          <div className="mb-6 flex justify-center gap-4">
            {socialButtons.map((item, index) => (
              <div
                key={item.label + index}
                className="flex h-[72px] w-[72px] items-center justify-center rounded-[16px] border border-white/40 bg-white/10 backdrop-blur-md"
              >
                <item.icon className="h-6 w-6" />
              </div>
            ))}
          </div>
          <h1 className="text-[40px] font-extrabold leading-[48px] tracking-[-0.9px]">
            Sign up
          </h1>
          <p className="mt-2 text-sm">Welcome 360 Retail</p>
        </div>
      </div>

      <div className="relative z-20 mt-24 flex w-full justify-center">
        <div className="w-full max-w-[420px] rounded-[16px] bg-white px-8 py-8 shadow-xl">
          <form className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                className="h-12 rounded-[12px] border border-gray-200 px-4 text-sm text-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email address"
                  className="h-12 rounded-[12px] border border-gray-200 pl-10 pr-4 text-sm text-gray-700"
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
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  className="h-12 rounded-[12px] border border-gray-200 pl-10 pr-10 text-sm text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <span className="text-xs">Hide</span>
                  ) : (
                    <span className="text-xs">Show</span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="remember"
                defaultChecked
                className="data-[state=checked]:bg-[linear-gradient(145deg,rgba(0,187,167,1)_0%,rgba(0,150,137,1)_100%)]"
              />
              <Label
                htmlFor="remember"
                className="cursor-pointer text-xs font-medium text-gray-700"
              >
                Remember me
              </Label>
            </div>

            <Button
              type="submit"
              className="mt-2 h-12 w-full rounded-full bg-[linear-gradient(145deg,rgba(0,187,167,1)_0%,rgba(0,150,137,1)_100%)] text-sm font-semibold tracking-wide text-white hover:opacity-90"
            >
              SIGN UP
            </Button>

            <p className="pt-2 text-center text-xs text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#0D9488] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
