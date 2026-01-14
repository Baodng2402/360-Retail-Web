import { Link } from "react-router-dom";
import { Apple, ArrowLeft, Chrome, Facebook } from "lucide-react";

import logo from "@/assets/logo.png";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";

const socialButtons = [
  {
    icon: Facebook,
    alt: "Facebook",
    className: "bg-[url(/rectangle-52.png)] bg-[100%_100%]",
  },
  {
    icon: Apple,
    alt: "Apple",
    className: "",
  },
  {
    icon: Chrome,
    alt: "Google",
    className: "",
  },
] as const;

const SignupPage = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-white overflow-x-hidden">
      <div className="relative z-0 mt-5 w-[calc(100%-40px)] mx-5 min-h-[35vh] sm:min-h-[38vh] md:min-h-[50vh] rounded-[24px] bg-[linear-gradient(160deg,rgba(25,214,200,1)_0%,rgba(255,123,33,1)_100%)] pt-2 pb-20 sm:pb-16 md:pb-24 text-white shadow-md">
        <div className="flex w-full items-start justify-between px-5">
          <img
            src={logo}
            alt="360 Retail"
            className="h-16 w-auto sm:h-20 md:h-24 object-contain"
          />

          <div />
        </div>

        <div className="mt-4 sm:mt-2 sm:-mt-4 md:-mt-10 flex flex-col items-center text-center px-4">
          <h1 className="text-2xl sm:text-3xl md:text-[40px] font-extrabold leading-tight sm:leading-[40px] md:leading-[48px] tracking-[-0.9px]">
            Sign up
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            No tech expertise required. We promise.
          </p>
        </div>
      </div>

      <div className="relative z-50 signup-card-wrapper mb-16 flex w-full max-w-[1120px] justify-center px-4 sm:px-6 md:px-0">
        <div className="w-full max-w-[440px] rounded-[15px] bg-white shadow-xl">
          <div className="px-4 sm:px-6 md:px-8 pb-9 pt-4 sm:pt-5 md:pt-6">
            <div className="flex flex-col gap-5">
              <div className="mb-3">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </Link>
              </div>

              <div className="flex flex-col gap-6 sm:gap-[30px]">
                <h2 className="text-center text-lg font-extrabold leading-[25.2px] text-graygray-700">
                  Sign in with
                </h2>

                <div className="flex items-center justify-center gap-3 sm:gap-[15px]">
                  {socialButtons.map((social, index) => (
                    <Button
                      key={social.alt + index}
                      variant="outline"
                      size="icon"
                      className={`flex h-14 w-14 sm:h-[75px] sm:w-[75px] items-center justify-center rounded-[15px] border border-graygray-200 bg-blackampwhitewhite hover:bg-gray-50 ${social.className}`}
                    >
                      <social.icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                    </Button>
                  ))}
                </div>

                <div className="text-center text-lg font-bold leading-[25.2px] text-graygray-400">
                  or
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col gap-2.5">
                  <Label
                    htmlFor="name"
                    className="text-sm font-normal leading-[19.6px] text-graygray-700"
                  >
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    className="h-12 sm:h-[50px] rounded-[15px] border border-graygray-200 bg-blackampwhitewhite px-4 sm:px-5 text-sm font-normal leading-[19.6px] text-graygray-400"
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-normal leading-[19.6px] text-graygray-700"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email address"
                    className="h-12 sm:h-[50px] rounded-[15px] border border-graygray-200 bg-blackampwhitewhite px-4 sm:px-5 text-sm font-normal leading-[19.6px] text-graygray-400"
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <Label
                    htmlFor="password"
                    className="text-sm font-normal leading-[19.6px] text-graygray-700"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    className="h-12 sm:h-[50px] rounded-[15px] border border-graygray-200 bg-blackampwhitewhite px-4 sm:px-5 text-sm font-normal leading-[19.6px] text-graygray-400"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <Switch
                    id="remember"
                    className="data-[state=checked]:bg-[linear-gradient(145deg,rgba(0,187,167,1)_0%,rgba(0,150,137,1)_100%)]"
                  />
                  <Label
                    htmlFor="remember"
                    className="cursor-pointer text-xs font-normal leading-[18px] text-graygray-700"
                  >
                    Remember me
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="h-auto rounded-xl bg-[linear-gradient(145deg,rgba(0,187,167,1)_0%,rgba(0,150,137,1)_100%)] px-2 py-3 text-[10px] font-bold leading-[15px] tracking-[0] text-blackampwhitewhite hover:opacity-90"
                >
                  SIGN UP
                </Button>

                <p className="text-center text-xs font-normal leading-[18px] text-graygray-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-[#00bba7] hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;


