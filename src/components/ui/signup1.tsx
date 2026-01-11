import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import fbLogo from "@/assets/facebook.png";
import googleLogo from "@/assets/google.png";

interface Signup1Props {
  heading?: string;
  buttonText?: string;
  googleText?: string;
  signupText?: string;
  signupUrl?: string;
  className?: string;
}

const Signup1 = ({
  heading = "Register with",
  buttonText = "Create Account",
  signupText = "Already have an account?",
  signupUrl = "https://shadcnblocks.com",
  className,
}: Signup1Props) => {
  return (
    <section className={cn("mt-10", className)}>
      <div className="flex h-full items-center justify-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-6 lg:justify-start">
          <div className="flex w-full max-w-md min-w-md flex-col items-center gap-y-3 rounded-md border border-muted bg-background px-6 py-6 shadow-md">
            {heading && (
              <h1 className="text-xl font-semibold font-family-jakartan mt-4">
                {heading}
              </h1>
            )}
            <div className="flex gap-3 justify-center w-full">
              {/* justify-center: căn giữa 2 cái nút so với chiều ngang của form */}

              <button className="bg-background border-gray-200 border w-[75px] h-[75px] rounded-lg flex items-center justify-center hover:bg-gray-50 transition-all">
                {/* flex items-center justify-center: đưa logo vào chính giữa button */}
                <img src={fbLogo} className="w-8 h-8" alt="Facebook" />
              </button>

              <button className="bg-background border-gray-200 border w-[75px] h-[75px] rounded-lg flex items-center justify-center hover:bg-gray-50 transition-all">
                <img src={googleLogo} className="w-8 h-8" alt="Google" />
              </button>
            </div>
            <span className="text-gray-400 font-bold text-[18px] font-family-jakarta">
              or
            </span>

            {/* Name Field */}
            <div className="w-full">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                className="text-sm w-full h-[50px]"
                required
              />
            </div>

            {/* Email Field */}
            <div className="w-full">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Your email address"
                className="text-sm w-full h-[50px]"
                required
              />
            </div>

            {/* Password Field */}
            <div className="w-full">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                className="text-sm w-full h-[50px]"
                required
              />
            </div>

            {/* Confirm Password Field */}
            <div className="w-full">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                className="text-sm w-full h-[50px]"
                required
              />
            </div>

            <div className="flex justify-start items-center gap-2 w-full mt-2">
              <input
                type="checkbox"
                id="terms"
                required // Bắt buộc phải tích mới cho submit form
                className="w-4 h-4 cursor-pointer" // accent giúp đổi màu checkbox khi tích
              />
              <label
                htmlFor="terms"
                className="text-sm cursor-pointer select-none text-gray-400 flex items-center gap-1"
              >
                I agree to the Terms & Conditions
                <span className="text-red-500 font-bold">*</span>
                {/* Dấu sao đỏ biểu thị trường bắt buộc */}
              </label>
            </div>
            <div className="flex justify-start items-center gap-2 w-full -mt-3 mb-3">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="text-sm cursor-pointer select-none text-gray-400"
              >
                I want to receive news and updates
              </label>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#00ad9a] hover:bg-[#00ad9a]/80 transition-all duration-200"
            >
              {buttonText}
            </Button>
            <div className="flex text-gray-400 justify-center gap-1 text-sm">
              <p>{signupText}</p>
              <a
                href={signupUrl}
                className="font-medium text-teal-300 hover:underline"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Signup1 };
