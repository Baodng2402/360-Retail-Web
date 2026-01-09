import {
  UserCheck,
  ShoppingCart,
  Users,
  Settings,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from "lucide-react";

export default function BodyComponent() {
  return (
    <div
      className="min-h-screen bg-background text-foreground transition-colors duration-300"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-linear-to-br from-teal-600/10 to-transparent rounded-full blur-3xl dark:from-teal-500/20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-linear-to-tr from-orange-600/10 to-transparent rounded-full blur-3xl dark:from-orange-500/20"></div>
      </div>

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-12 gap-16 items-center">
          {/* Left: Headline & CTA - 7 columns */}
          <div className="md:col-span-7 space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-teal-50 to-orange-50 rounded-full border border-teal-100/50 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <p
                className="text-teal-800"
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  letterSpacing: "0.02em",
                }}
              >
                Designed for Small & Medium Retail
              </p>
            </div>

            <h1
              className="text-foreground"
              style={{
                fontSize: "clamp(40px, 5vw, 62px)",
                fontWeight: "800",
                lineHeight: "1.1",
                letterSpacing: "-0.02em",
              }}
            >
              Run Your Shop
              <br />
              <span className="bg-linear-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                with Ease
              </span>
            </h1>

            <p
              className="text-muted-foreground"
              style={{
                fontSize: "19px",
                lineHeight: "1.7",
                letterSpacing: "0.01em",
                maxWidth: "540px",
              }}
            >
              Say goodbye to messy notebooks and complicated software. Manage
              staff, sales, and customers with the simplicity of a smartphone
              app.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                className="group relative bg-linear-to-br from-teal-600 to-teal-700 text-white px-8 py-4 rounded-2xl transition-all shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/30 hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
                style={{ fontSize: "17px", fontWeight: "600" }}
              >
                Get trial for 14 days
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                className="group px-8 py-4 rounded-2xl transition-all backdrop-blur-sm bg-card/60 border border-border hover:bg-card hover:shadow-md flex items-center justify-center gap-2 text-muted-foreground"
                style={{
                  fontSize: "17px",
                  fontWeight: "600",
                }}
              >
                Watch Demo
              </button>
            </div>

            <div
              className="flex items-center gap-6 pt-4 text-muted-foreground"
              style={{ fontSize: "14px" }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                <span>5-min setup</span>
              </div>
            </div>
          </div>

          {/* Right: Hero Visual - 5 columns */}
          <div className="md:col-span-5 relative">
            <div className="relative">
              {/* Glassmorphic Card */}
              <div className="relative rounded-[32px] overflow-hidden shadow-2xl shadow-teal-900/10 dark:shadow-teal-500/10 border border-border backdrop-blur-xl bg-linear-to-br from-card/90 to-card/70 p-4">
                <img
                  src="https://images.unsplash.com/photo-1705909773171-4ba952b9c0af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtaW5pbWFsJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2NjgyNTQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Clean dashboard interface"
                  className="w-full rounded-[24px]"
                />
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-linear-to-br from-card to-card/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/10 dark:shadow-teal-500/20 p-6 border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p
                      className="text-foreground"
                      style={{
                        fontSize: "24px",
                        fontWeight: "800",
                      }}
                    >
                      +142%
                    </p>
                    <p
                      className="text-muted-foreground"
                      style={{
                        fontSize: "13px",
                      }}
                    >
                      Avg. Growth
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple 3 Section */}
      <section className="relative px-6 py-10 bg-linear-to-b from-background to-teal-50/30 dark:to-teal-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2
              className="text-foreground"
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                fontWeight: "800",
                marginBottom: "16px",
                letterSpacing: "-0.02em",
              }}
            >
              Everything You Need,
              <br />
              <span className="text-teal-600 dark:text-teal-400">
                Nothing You Don't
              </span>
            </h2>
            <p
              className="text-muted-foreground"
              style={{
                fontSize: "18px",
                lineHeight: "1.7",
                letterSpacing: "0.01em",
              }}
            >
              Three elegant features that replace hours of manual work
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Staff */}
            <div className="group relative">
              {/* Gradient Border Effect */}
              <div className="absolute -inset-0.5 bg-linear-to-br from-teal-400 to-teal-600 rounded-[28px] opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>

              <div className="relative bg-card p-10 rounded-[28px] shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-teal-600/10 dark:hover:shadow-teal-500/20 transition-all duration-500 border border-teal-100/50 dark:border-teal-900/30">
                {/* Duotone Icon */}
                <div className="relative w-20 h-20 mb-8">
                  <div className="absolute inset-0 bg-linear-to-br from-teal-500 to-teal-600 rounded-[20px] opacity-10"></div>
                  <div className="absolute inset-0 bg-linear-to-br from-teal-500 to-teal-600 rounded-[20px] flex items-center justify-center">
                    <UserCheck
                      className="w-10 h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                <h3
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    marginBottom: "12px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Staff Check-In
                </h3>
                <p
                  style={{
                    fontSize: "16px",
                    lineHeight: "1.65",
                    letterSpacing: "0.01em",
                  }}
                >
                  Simple Face ID check-in. No more paper attendance sheets.
                  Track who's working in real-time.
                </p>
              </div>
            </div>

            {/* Card 2: Sales */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-linear-to-br from-orange-400 to-orange-600 rounded-[28px] opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>

              <div className="relative bg-card p-10 rounded-[28px] shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-orange-600/10 dark:hover:shadow-orange-500/20 transition-all duration-500 border border-orange-100/50 dark:border-orange-900/30">
                <div className="relative w-20 h-20 mb-8">
                  <div className="absolute inset-0 bg-linear-to-br from-orange-500 to-orange-600 rounded-[20px] opacity-10"></div>
                  <div className="absolute inset-0 bg-linear-to-br from-orange-500 to-orange-600 rounded-[20px] flex items-center justify-center">
                    <ShoppingCart
                      className="w-10 h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                <h3
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    marginBottom: "12px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Fast Checkout
                </h3>
                <p
                  style={{
                    fontSize: "16px",
                    lineHeight: "1.65",
                    letterSpacing: "0.01em",
                  }}
                >
                  Complete a sale in one click. Automatic inventory updates. No
                  complicated POS systems.
                </p>
              </div>
            </div>

            {/* Card 3: Customers */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-linear-to-br from-teal-400 via-teal-500 to-orange-500 rounded-[28px] opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>

              <div className="relative bg-card p-10 rounded-[28px] shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-teal-600/10 dark:hover:shadow-teal-500/20 transition-all duration-500 border border-teal-100/50 dark:border-teal-900/30">
                <div className="relative w-20 h-20 mb-8">
                  <div className="absolute inset-0 bg-linear-to-br from-teal-500 to-orange-500 rounded-[20px] opacity-10"></div>
                  <div className="absolute inset-0 bg-linear-to-br from-teal-500 to-orange-500 rounded-[20px] flex items-center justify-center">
                    <Users className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                </div>

                <h3
                  className="text-card-foreground"
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    marginBottom: "12px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Auto Loyalty Points
                </h3>
                <p
                  className="text-muted-foreground"
                  style={{
                    fontSize: "16px",
                    lineHeight: "1.65",
                    letterSpacing: "0.01em",
                  }}
                >
                  Customers earn points automatically via Zalo. Build loyalty
                  without any manual tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before vs After Section - Asymmetric Layout */}
      <section className="relative px-6 py-24 bg-linear-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2
              className="text-foreground"
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                fontWeight: "800",
                marginBottom: "16px",
                letterSpacing: "-0.02em",
              }}
            >
              From Chaos to{" "}
              <span className="text-teal-600 dark:text-teal-400">Clarity</span>
            </h2>
            <p
              className="text-muted-foreground"
              style={{
                fontSize: "18px",
                lineHeight: "1.7",
                letterSpacing: "0.01em",
              }}
            >
              Watch your retail business transform overnight
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Before: Manual Work */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-br from-red-200 to-red-300 rounded-[32px] opacity-20 blur-xl"></div>

              <div className="relative">
                <div
                  className="absolute top-6 left-6 bg-linear-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-full z-10 shadow-lg"
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    letterSpacing: "0.02em",
                  }}
                >
                  BEFORE
                </div>

                <div className="rounded-[32px] overflow-hidden border border-stone-200 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1757256137041-0aab889db199?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXNzeSUyMG5vdGVib29rcyUyMGNhbGN1bGF0b3J8ZW58MXx8fHwxNzY2OTA0MDc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Manual chaos"
                    className="w-full grayscale opacity-75"
                  />
                </div>

                <div className="mt-8 space-y-4 pl-2">
                  {[
                    "Hours wasted on manual bookkeeping",
                    "Lost sales from slow checkout",
                    "Customers forget loyalty points",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-60">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span
                          className="text-red-600"
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                          }}
                        >
                          ✕
                        </span>
                      </div>
                      <p
                        className="text-muted-foreground"
                        style={{
                          fontSize: "15px",
                          lineHeight: "1.6",
                        }}
                      >
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* After: FMA Retail */}
            <div className="relative group md:translate-y-12">
              <div className="absolute -inset-1 bg-linear-to-br from-teal-300 to-orange-300 rounded-[32px] opacity-30 blur-xl"></div>

              <div className="relative">
                <div
                  className="absolute top-6 left-6 bg-linear-to-r from-teal-600 to-teal-700 text-white px-5 py-2.5 rounded-full z-10 shadow-lg"
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    letterSpacing: "0.02em",
                  }}
                >
                  AFTER
                </div>

                <div className="rounded-[32px] overflow-hidden border border-border shadow-2xl dark:shadow-teal-500/10">
                  <img
                    src="https://images.unsplash.com/photo-1557944697-7c532ac293a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRhaWwlMjBzaG9wJTIwbmF0dXJhbCUyMGxpZ2h0fGVufDF8fHx8MTc2NjkwNDQ1MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Modern retail clarity"
                    className="w-full"
                  />
                </div>

                <div className="mt-8 space-y-4 pl-2">
                  {[
                    "Everything tracked automatically",
                    "Checkout in seconds, not minutes",
                    "Loyalty points added instantly",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-teal-600" />
                      </div>
                      <p
                        className="text-foreground"
                        style={{
                          fontSize: "15px",
                          fontWeight: "500",
                          lineHeight: "1.6",
                        }}
                      >
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="relative px-6 py-24 bg-linear-to-b from-background to-teal-50/20 dark:to-teal-950/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2
              className="text-foreground"
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                fontWeight: "800",
                marginBottom: "16px",
                letterSpacing: "-0.02em",
              }}
            >
              Get Started in{" "}
              <span className="text-teal-600 dark:text-teal-400">3 Steps</span>
            </h2>
            <p
              className="text-muted-foreground"
              style={{
                fontSize: "18px",
                lineHeight: "1.7",
                letterSpacing: "0.01em",
              }}
            >
              No tech expertise required. We promise.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Flowing Connection Path */}
            <svg
              className="hidden md:block absolute top-28 left-0 w-full h-32 pointer-events-none"
              viewBox="0 0 1000 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 50 60 Q 250 20, 500 60 T 950 60"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeDasharray="8 8"
                fill="none"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="50%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
            </svg>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Step 1 */}
              <div className="text-center relative">
                <div className="relative w-44 h-44 mx-auto mb-8 group">
                  <div className="absolute inset-0 bg-linear-to-br from-teal-500 to-teal-600 rounded-[32px] shadow-2xl shadow-teal-600/30 group-hover:scale-105 transition-transform duration-500"></div>
                  <div className="absolute inset-0 rounded-[32px] flex items-center justify-center">
                    <Settings
                      className="w-20 h-20 text-white"
                      strokeWidth={2}
                    />
                  </div>
                </div>

                <div className="inline-block px-5 py-2 bg-linear-to-r from-teal-100 to-teal-50 rounded-full mb-5 border border-teal-200/50">
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#0d9488",
                      letterSpacing: "0.08em",
                    }}
                  >
                    STEP 1
                  </p>
                </div>

                <h3
                  className="text-foreground"
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    marginBottom: "12px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Quick Setup
                </h3>
                <p
                  className="text-muted-foreground"
                  style={{
                    fontSize: "16px",
                    lineHeight: "1.65",
                    letterSpacing: "0.01em",
                    maxWidth: "280px",
                    margin: "0 auto",
                  }}
                >
                  Add your products and staff in under 5 minutes with our guided
                  walkthrough.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center relative">
                <div className="relative w-44 h-44 mx-auto mb-8 group">
                  <div className="absolute inset-0 bg-linear-to-br from-orange-500 to-orange-600 rounded-[32px] shadow-2xl shadow-orange-600/30 group-hover:scale-105 transition-transform duration-500"></div>
                  <div className="absolute inset-0 rounded-[32px] flex items-center justify-center">
                    <Zap className="w-20 h-20 text-white" strokeWidth={2} />
                  </div>
                </div>

                <div className="inline-block px-5 py-2 bg-linear-to-r from-orange-100 to-orange-50 rounded-full mb-5 border border-orange-200/50">
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#ea580c",
                      letterSpacing: "0.08em",
                    }}
                  >
                    STEP 2
                  </p>
                </div>

                <h3
                  className="text-foreground"
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    marginBottom: "12px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Start Selling
                </h3>
                <p
                  className="text-muted-foreground"
                  style={{
                    fontSize: "16px",
                    lineHeight: "1.65",
                    letterSpacing: "0.01em",
                    maxWidth: "280px",
                    margin: "0 auto",
                  }}
                >
                  Process your first sale. Everything else happens
                  automatically—inventory, reports, loyalty.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center relative">
                <div className="relative w-44 h-44 mx-auto mb-8 group">
                  <div className="absolute inset-0 bg-linear-to-br from-teal-600 via-teal-500 to-orange-500 rounded-[32px] shadow-2xl shadow-teal-600/30 group-hover:scale-105 transition-transform duration-500"></div>
                  <div className="absolute inset-0 rounded-[32px] flex items-center justify-center">
                    <TrendingUp
                      className="w-20 h-20 text-white"
                      strokeWidth={2}
                    />
                  </div>
                </div>

                <div className="inline-block px-5 py-2 bg-linear-to-r from-teal-100 to-orange-100 rounded-full mb-5 border border-teal-200/50">
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#0d9488",
                      letterSpacing: "0.08em",
                    }}
                  >
                    STEP 3
                  </p>
                </div>

                <h3
                  className="text-foreground"
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    marginBottom: "12px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Watch It Grow
                </h3>
                <p
                  className="text-muted-foreground"
                  style={{
                    fontSize: "16px",
                    lineHeight: "1.65",
                    letterSpacing: "0.01em",
                    maxWidth: "280px",
                    margin: "0 auto",
                  }}
                >
                  Get insights on what's selling and how to grow your business
                  smarter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-[40px] overflow-hidden border border-border">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1753164726626-e4c38056a03f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGJ1c2luZXNzJTIwb3duZXIlMjBzbWlsaW5nfGVufDF8fHx8MTc2NjkwNDQ1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Happy shop owner"
                className="w-full h-full object-cover opacity-15 "
              />
              <div className="absolute inset-0 bg-linear-to-br opacity-15 dark:from-teal-950/50 dark:to-orange-950/50"></div>
            </div>

            {/* Content */}
            <div className="relative px-12 py-16 md:py-20 text-center">
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-8 h-8 text-orange-500">
                    ★
                  </div>
                ))}
              </div>

              <p
                className="text-foreground"
                style={{
                  fontSize: "clamp(20px, 3vw, 28px)",
                  fontWeight: "600",
                  lineHeight: "1.6",
                  letterSpacing: "-0.01em",
                  marginBottom: "24px",
                  fontStyle: "italic",
                  maxWidth: "800px",
                  margin: "0 auto 24px",
                }}
              >
                "FMA Retail transformed how I run my boutique. What used to take
                me 2 hours every evening now happens automatically. I finally
                have time to focus on my customers."
              </p>

              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-teal-500 to-teal-600"></div>
                <div className="text-left">
                  <p
                    className="text-foreground"
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                    }}
                  >
                    Mai Nguyen
                  </p>
                  <p
                    className="text-muted-foreground"
                    style={{
                      fontSize: "14px",
                    }}
                  >
                    Owner, Lily Fashion Boutique
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative px-6 py-24 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-linear-to-br from-teal-600 via-teal-700 to-orange-600"></div>

        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h2
            style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: "800",
              color: "#ffffff",
              marginBottom: "20px",
              letterSpacing: "-0.02em",
              lineHeight: "1.1",
            }}
          >
            Ready to Simplify
            <br />
            Your Shop?
          </h2>

          <p
            style={{
              fontSize: "20px",
              color: "#ffffff",
              opacity: 0.95,
              marginBottom: "40px",
              lineHeight: "1.6",
              letterSpacing: "0.01em",
            }}
          >
            Join 1,000+ happy shop owners who've ditched the notebooks
          </p>

          <button
            className="group bg-white text-teal-700 px-12 py-5 rounded-2xl transition-all shadow-2xl hover:shadow-3xl hover:scale-105 inline-flex items-center gap-3"
            style={{ fontSize: "19px", fontWeight: "700" }}
          >
            Join 1,000+ Happy Shop Owners
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          <p
            style={{
              fontSize: "14px",
              color: "#ffffff",
              opacity: 0.85,
              marginTop: "24px",
              letterSpacing: "0.01em",
            }}
          >
            Free forever for your first 100 sales · No credit card needed
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-16 bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-200 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <h4
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  marginBottom: "12px",
                }}
              >
                FMA Retail
              </h4>
              <p
                style={{
                  fontSize: "15px",
                  opacity: 0.7,
                  lineHeight: "1.6",
                  maxWidth: "320px",
                }}
              >
                Empowering small and medium retail businesses with technology
                that feels as simple as a smartphone app.
              </p>
            </div>

            <div>
              <h5
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  marginBottom: "16px",
                  letterSpacing: "0.05em",
                  opacity: 0.5,
                }}
              >
                PRODUCT
              </h5>
              <ul
                className="space-y-3"
                style={{ fontSize: "15px", opacity: 0.8 }}
              >
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  marginBottom: "16px",
                  letterSpacing: "0.05em",
                  opacity: 0.5,
                }}
              >
                COMPANY
              </h5>
              <ul
                className="space-y-3"
                style={{ fontSize: "15px", opacity: 0.8 }}
              >
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-700 dark:border-gray-800 text-center">
            <p
              style={{
                fontSize: "14px",
                opacity: 0.6,
                letterSpacing: "0.01em",
              }}
            >
              © 2025 FMA Retail. Built for shop owners, by shop owners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
