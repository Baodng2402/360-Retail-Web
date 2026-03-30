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
    <div className="flex min-h-screen w-full bg-gray-100 overflow-hidden">
      <div className="mx-auto flex w-full max-w-[1920px]">
        {/* Left: Form — full width on mobile, 45% when right panel visible */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className="relative flex w-full sm:w-[45%] min-w-0 flex-col items-center justify-center bg-white px-6 py-12 backdrop-blur-xl sm:px-8 md:px-16"
        >
          {/* Background glow effects */}
          <div className="pointer-events-none absolute left-0 top-0 h-[400px] w-[400px] -ml-[100px] -mt-[100px] rounded-full bg-gradient-to-br from-[#FF7B21]/10 to-[#19D6C8]/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-gradient-to-tr from-[#19D6C8]/10 to-transparent blur-2xl" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="absolute left-8 top-8 z-20 md:left-16"
          >
            <img
              src={logo}
              alt="360 Retail"
              className="h-14 w-auto object-contain md:h-16 transition-transform duration-300 hover:scale-105"
            />
          </motion.div>

          <motion.div
            className="relative z-10 w-full max-w-md mt-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mb-8"
            >
              <Link
                to={backTo}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-[#FF7B21] hover:gap-3"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                <span>{resolvedBackLabel}</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mb-8 space-y-3"
            >
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent sm:text-3xl leading-snug pb-1">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-muted-foreground leading-relaxed pt-1">{description}</p>
              )}
            </motion.div>

            {children}
          </motion.div>
        </motion.div>

        {/* Right: Decorative panel with brand gradient */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className="relative hidden w-[55%] overflow-hidden rounded-bl-[32px] min-h-[88vh] sm:block"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21] via-[#FF9F45] to-[#19D6C8]">
            {/* Animated orbs */}
            <div className="absolute top-1/4 -right-20 w-[400px] h-[400px] rounded-full bg-white/10 blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 -left-20 w-[300px] h-[300px] rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5 backdrop-blur-sm" />

            {/* Decorative circles */}
            <div className="absolute top-20 right-20 w-32 h-32 rounded-full border-2 border-white/20" />
            <div className="absolute bottom-32 left-20 w-48 h-48 rounded-full border border-white/10" />
            <div className="absolute top-40 left-1/3 w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm" />
          </div>

          {/* Content overlay — logo trong khung tròn xoay (đồng bộ trang login) */}
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center text-white">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  className="relative mx-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/30 shadow-2xl">
                    <img
                      src={logo}
                      alt="360 Retail Logo"
                      className="w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 object-contain"
                    />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
