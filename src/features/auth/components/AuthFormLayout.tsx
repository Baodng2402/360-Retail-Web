import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

import logo from "@/assets/logo.png";

interface AuthFormLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  backTo?: string;
  backLabel?: string;
}

export const AuthFormLayout = ({
  title,
  description,
  children,
  backTo = "/login",
  backLabel = "Back to Login",
}: AuthFormLayoutProps) => {
  const { t } = useTranslation("auth");

  const resolvedBackLabel =
    backLabel ??
    t("layout.backToLogin", {
      defaultValue: "Back to Login",
    });

  return (
    <div className="flex min-h-screen w-full bg-white text-gray-900">
      <div className="mx-auto flex w-full max-w-[1920px]">
        {/* Left: Form — full width on mobile, 45% when right panel visible */}
        <div className="relative flex w-full sm:w-[45%] min-w-0 flex-col items-center justify-center bg-white px-6 py-12 text-gray-900 sm:px-8 md:px-16">
          <div className="pointer-events-none absolute left-0 top-0 h-[532px] w-[532px] -ml-[122px] -mt-[125px] rounded-full bg-gradient-to-br from-[rgba(13,148,136,0.18)] to-[rgba(13,148,136,0)] blur-[32px] rotate-[36deg]" />

          <div className="absolute left-8 top-10 z-20 md:left-16">
            <img
              src={logo}
              alt="360 Retail"
              className="h-20 w-auto object-contain md:h-24"
            />
          </div>

          <motion.div
            className="relative z-10 w-full max-w-md mt-24"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="mb-8">
              <Link
                to={backTo}
                className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{resolvedBackLabel}</span>
              </Link>
            </div>

            <div className="mb-6 space-y-2">
              <h1 className="text-[28px] font-bold leading-tight tracking-tight text-teal-600 md:text-[32px]">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>

            {children}
          </motion.div>
        </div>

        {/* Right: Decorative panel (same as Login) */}
        <div className="relative hidden w-[55%] overflow-hidden rounded-bl-[32px] bg-gradient-to-br from-[#19D6C8] to-[#FF7B21] min-h-[88vh] sm:block">
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
