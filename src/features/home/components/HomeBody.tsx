import { Link } from "react-router-dom";
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

const HomeBody = () => {
  return (
    <div
      className="min-h-screen bg-background transition-colors duration-300"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#0d9488]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#ea580c]/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <section className="relative px-6 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-12 gap-16 items-center">
          <div className="md:col-span-7 space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-50 to-orange-50 dark:from-teal-950/50 dark:to-orange-950/50 rounded-full border border-teal-100/50 dark:border-teal-800/50 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <p
                className="text-teal-800 dark:text-teal-200"
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
              <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
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
              One app to manage staff, sales, and customers. Say goodbye to
              messy notebooks and complicated software.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/dashboard"
                className="group relative bg-gradient-to-br from-teal-600 to-teal-700 text-white px-8 py-4 rounded-2xl transition-all shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/30 hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
                style={{ fontSize: "17px", fontWeight: "600" }}
              >
                Get Started for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                className="group px-8 py-4 rounded-2xl transition-all backdrop-blur-sm bg-card/60 dark:bg-card/40 border border-border hover:bg-card hover:shadow-md flex items-center justify-center gap-2 text-muted-foreground"
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

          <div className="md:col-span-5 relative">
            <div className="relative">
              <div className="relative rounded-[32px] overflow-hidden shadow-2xl shadow-teal-900/10 border border-border backdrop-blur-xl bg-gradient-to-br from-card/90 to-card/70 dark:from-card/70 dark:to-card/50 p-4">
                <img
                  src="https://images.unsplash.com/photo-1705909773171-4ba952b9c0af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtaW5pbWFsJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2NjgyNTQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Clean dashboard interface"
                  className="w-full rounded-[24px]"
                />
              </div>

              <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-card to-card/90 dark:from-card/90 dark:to-card/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/10 p-6 border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
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
                    <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
                      Avg. Growth
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-6 py-24 bg-gradient-to-b from-background to-teal-50/30 dark:to-teal-950/30">
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
              <span className="text-teal-600">Nothing You Don't</span>
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
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-teal-400 to-teal-600 rounded-[28px] opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>

              <div className="relative bg-card p-10 rounded-[28px] shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-teal-600/10 transition-all duration-500 border border-border">
                <div className="relative w-20 h-20 mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-600 rounded-[20px] opacity-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-600 rounded-[20px] flex items-center justify-center">
                    <UserCheck
                      className="w-10 h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                <h3
                  className="text-foreground"
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    marginBottom: "12px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Staff Check-In
                  <br />
                  <span className="text-muted-foreground" style={{ fontSize: "16px" }}>
                    (Nhân viên)
                  </span>
                </h3>
                <p
                  className="text-muted-foreground"
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

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[28px] opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>

              <div className="relative bg-card p-10 rounded-[28px] shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-orange-600/10 transition-all duration-500 border border-border">
                <div className="relative w-20 h-20 mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[20px] opacity-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[20px] flex items-center justify-center">
                    <ShoppingCart
                      className="w-10 h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                <h3
                  className="text-foreground"
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    marginBottom: "12px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Fast Checkout
                  <br />
                  <span className="text-muted-foreground" style={{ fontSize: "16px" }}>
                    (Bán hàng)
                  </span>
                </h3>
                <p
                  className="text-muted-foreground"
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

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-teal-400 via-teal-500 to-orange-500 rounded-[28px] opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>

              <div className="relative bg-card p-10 rounded-[28px] shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-teal-600/10 transition-all duration-500 border border-border">
                <div className="relative w-20 h-20 mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-orange-500 rounded-[20px] opacity-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-orange-500 rounded-[20px] flex items-center justify-center">
                    <Users
                      className="w-10 h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                <h3
                  className="text-foreground"
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    marginBottom: "12px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Auto Loyalty Points
                  <br />
                  <span className="text-muted-foreground" style={{ fontSize: "16px" }}>
                    (Khách hàng)
                  </span>
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

      <section className="relative px-6 py-24 bg-gradient-to-b from-background to-teal-50/20 dark:to-teal-950/20">
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
              Get Started in <span className="text-teal-600">3 Steps</span>
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
              <div className="text-center relative">
                <div className="relative w-44 h-44 mx-auto mb-8 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-600 rounded-[32px] shadow-2xl shadow-teal-600/30 group-hover:scale-105 transition-transform duration-500"></div>
                  <div className="absolute inset-0 rounded-[32px] flex items-center justify-center">
                    <Settings className="w-20 h-20 text-white" strokeWidth={2} />
                  </div>
                </div>

                <div className="inline-block px-5 py-2 bg-gradient-to-r from-teal-100 to-teal-50 rounded-full mb-5 border border-teal-200/50">
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

              <div className="text-center relative">
                <div className="relative w-44 h-44 mx-auto mb-8 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[32px] shadow-2xl shadow-orange-600/30 group-hover:scale-105 transition-transform duration-500"></div>
                  <div className="absolute inset-0 rounded-[32px] flex items-center justify-center">
                    <Zap className="w-20 h-20 text-white" strokeWidth={2} />
                  </div>
                </div>

                <div className="inline-block px-5 py-2 bg-gradient-to-r from-orange-100 to-orange-50 rounded-full mb-5 border border-orange-200/50">
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

              <div className="text-center relative">
                <div className="relative w-44 h-44 mx-auto mb-8 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-500 to-orange-500 rounded-[32px] shadow-2xl shadow-teal-600/30 group-hover:scale-105 transition-transform duration-500"></div>
                  <div className="absolute inset-0 rounded-[32px] flex items-center justify-center">
                    <TrendingUp className="w-20 h-20 text-white" strokeWidth={2} />
                  </div>
                </div>

                <div className="inline-block px-5 py-2 bg-gradient-to-r from-teal-100 to-orange-100 rounded-full mb-5 border border-teal-200/50">
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

      <section className="relative px-6 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-orange-600"></div>

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

          <Link
            to="/dashboard"
            className="group bg-white dark:bg-card text-teal-700 dark:text-teal-400 px-12 py-5 rounded-2xl transition-all shadow-2xl hover:shadow-3xl hover:scale-105 inline-flex items-center gap-3"
            style={{ fontSize: "19px", fontWeight: "700" }}
          >
            Join 1,000+ Happy Shop Owners
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>

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

      <footer className="px-6 py-16 bg-stone-900 text-white">
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
                  <a
                    href="#"
                    className="hover:text-teal-400 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-teal-400 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-teal-400 transition-colors"
                  >
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
                  <a
                    href="#"
                    className="hover:text-teal-400 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-teal-400 transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-teal-400 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center">
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
};

export { HomeBody };

