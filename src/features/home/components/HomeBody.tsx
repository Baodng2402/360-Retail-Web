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
import TrueFocus from "@/shared/components/TrueFocus";
import { GithubGlobe } from "@/shared/components/configs/GithubGlobe";

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
            <h1
              className="text-foreground"
              style={{
                fontSize: "clamp(40px, 5vw, 62px)",
                fontWeight: "800",
                lineHeight: "1.1",
                letterSpacing: "-0.02em",
              }}
            >
              Quản lý bán hàng đa kênh
              <br />
              <span className="bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text flex justify-start pt-3">
                <TrueFocus
                  sentence="Cùng 360 Retail"
                  manualMode
                  blurAmount={5}
                  borderColor="#0d9488"
                  animationDuration={0.5}
                  pauseBetweenAnimations={1}
                />
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
              Đồng bộ nhân viên, đơn hàng và khách hàng từ cửa hàng tới online
              trên một màn hình duy nhất. Không còn sổ sách rời rạc hay phần mềm
              phức tạp.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/dashboard"
                className="group relative bg-gradient-to-br from-teal-600 to-teal-700 text-white px-8 py-4 rounded-2xl transition-all shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/30 hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
                style={{ fontSize: "17px", fontWeight: "600" }}
              >
                Bắt đầu dùng thử miễn phí
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                className="group px-8 py-4 rounded-2xl transition-all backdrop-blur-sm bg-card/60 dark:bg-card/40 border border-border hover:bg-card hover:shadow-md flex items-center justify-center gap-2 text-muted-foreground"
                style={{
                  fontSize: "17px",
                  fontWeight: "600",
                }}
              >
                Xem demo nhanh
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
                    <p
                      className="text-muted-foreground"
                      style={{ fontSize: "13px" }}
                    >
                      Tăng trưởng trung bình
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-center text-xs font-semibold tracking-[0.3em] uppercase text-muted-foreground mb-6">
            Được tin dùng bởi các thương hiệu bán lẻ tại Việt Nam
          </p>
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16 opacity-70 hover:opacity-100 transition-opacity duration-500">
            <div className="h-8 flex items-center gap-2 font-semibold text-sm md:text-base text-foreground">
              <span className="inline-block h-6 w-6 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600" />
              Urban Style
            </div>
            <div className="h-8 flex items-center gap-2 font-semibold text-sm md:text-base text-foreground">
              <span className="inline-block h-6 w-6 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500" />
              Coffee Corner
            </div>
            <div className="h-8 flex items-center gap-2 font-semibold text-sm md:text-base text-foreground">
              <span className="inline-block h-6 w-6 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500" />
              Mobile Hub
            </div>
            <div className="h-8 flex items-center gap-2 font-semibold text-sm md:text-base text-foreground">
              <span className="inline-block h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500" />
              Green Mart
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-6 py-24 bg-gradient-to-b from-background via-teal-50/60 to-emerald-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
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
              Một nền tảng,
              <br />
              <span className="text-teal-600">bao trùm mọi quy trình</span>
            </h2>
            <p
              className="text-muted-foreground"
              style={{
                fontSize: "18px",
                lineHeight: "1.7",
                letterSpacing: "0.01em",
              }}
            >
              Bộ tính năng gọn nhẹ thay thế hàng giờ nhập liệu và tổng hợp thủ
              công
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
                  Chấm công & ca làm
                  <br />
                  <span
                    className="text-muted-foreground"
                    style={{ fontSize: "16px" }}
                  >
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
                  Điểm danh nhanh, lịch làm rõ ràng, không còn file excel hay sổ
                  chấm công rời rạc.
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
                  Bán hàng cực nhanh
                  <br />
                  <span
                    className="text-muted-foreground"
                    style={{ fontSize: "16px" }}
                  >
                    (Tại quầy & online)
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
                  Hoàn tất đơn chỉ với vài thao tác, tự động trừ tồn kho và đồng
                  bộ dữ liệu giữa các kênh.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-teal-400 via-teal-500 to-orange-500 rounded-[28px] opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>

              <div className="relative bg-card p-10 rounded-[28px] shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-teal-600/10 transition-all duration-500 border border-border">
                <div className="relative w-20 h-20 mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-orange-500 rounded-[20px] opacity-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-orange-500 rounded-[20px] flex items-center justify-center">
                    <Users className="w-10 h-10 text-white" strokeWidth={2.5} />
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
                  Tích điểm & chăm sóc tự động
                  <br />
                  <span
                    className="text-muted-foreground"
                    style={{ fontSize: "16px" }}
                  >
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
                  Khách mua là có điểm, có ưu đãi. Hệ thống tự ghi nhận, bạn chỉ
                  việc chăm sóc và bán hàng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-6 py-24 bg-gradient-to-b from-emerald-50/60 via-background to-teal-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
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
              Bắt đầu trong <span className="text-teal-600">3 bước</span>
            </h2>
            <p
              className="text-muted-foreground"
              style={{
                fontSize: "18px",
                lineHeight: "1.7",
                letterSpacing: "0.01em",
              }}
            >
              Không cần am hiểu công nghệ, chỉ cần bạn đang vận hành cửa hàng.
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
                    <Settings
                      className="w-20 h-20 text-white"
                      strokeWidth={2}
                    />
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
                  Thiết lập nhanh
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
                  Nhập sản phẩm, nhân viên, ca làm theo hướng dẫn trực quan
                  trong vài phút.
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
                  Bắt đầu bán hàng
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
                  Tạo đơn đầu tiên, phần còn lại (tồn kho, báo cáo, tích điểm)
                  được tự động hóa.
                </p>
              </div>

              <div className="text-center relative">
                <div className="relative w-44 h-44 mx-auto mb-8 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-500 to-orange-500 rounded-[32px] shadow-2xl shadow-teal-600/30 group-hover:scale-105 transition-transform duration-500"></div>
                  <div className="absolute inset-0 rounded-[32px] flex items-center justify-center">
                    <TrendingUp
                      className="w-20 h-20 text-white"
                      strokeWidth={2}
                    />
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
                  Xem cửa hàng tăng trưởng
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
                  Nắm được mặt hàng bán chạy, khung giờ cao điểm để ra quyết
                  định thông minh hơn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              className="mb-6"
              style={{
                fontSize: "clamp(32px, 4vw, 44px)",
                fontWeight: "800",
                letterSpacing: "-0.02em",
              }}
            >
              Đồng hành cùng sự phát triển bán lẻ Việt Nam
            </h2>
            <p
              className="text-slate-300 mb-10"
              style={{
                fontSize: "18px",
                lineHeight: "1.7",
                letterSpacing: "0.01em",
              }}
            >
              Từ trung tâm thành phố đến tỉnh lẻ, 360 Retail giúp chủ shop theo
              dõi doanh thu và khách hàng theo khu vực, từ đó tối ưu chiến dịch
              và nguồn lực.
            </p>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-3xl md:text-4xl font-extrabold text-teal-400 mb-1">
                  5,000+
                </p>
                <p className="text-sm font-medium text-slate-300">
                  Cửa hàng sử dụng
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-extrabold text-teal-400 mb-1">
                  63
                </p>
                <p className="text-sm font-medium text-slate-300">
                  Tỉnh thành có khách hàng
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-extrabold text-teal-400 mb-1">
                  12+
                </p>
                <p className="text-sm font-medium text-slate-300">
                  Ngành hàng khác nhau
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-extrabold text-teal-400 mb-1">
                  24/7
                </p>
                <p className="text-sm font-medium text-slate-300">
                  Hỗ trợ đội ngũ CSKH
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-[360px] md:h-[420px]">

            <div className="w-full py-10">
              <div className="relative h-[360px] md:h-[420px] w-full max-w-3xl mx-auto">

                {/* Container Chính */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl border border-border/40 overflow-hidden flex items-center justify-center">

                  {/* 1. Hiệu ứng nền nhẹ (Background Radial) */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#22d3ee_0,_transparent_55%),radial-gradient(circle_at_bottom,_#fb923c_0,_transparent_55%)] z-0" />

                  {/* 2. Component Quả địa cầu */}
                  <div className="absolute inset-0 z-10">
                    <GithubGlobe />
                  </div>

                  {/* 3. Phần trung tâm (Logo 360 Retail) */}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-teal-50/60 via-background to-emerald-50/40 dark:from-slate-900/60 dark:via-background dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Đánh giá từ khách hàng
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Chủ shop nói gì về 360 Retail
            </h2>
          </div>

          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-background to-transparent dark:from-slate-900" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-background to-transparent dark:from-slate-900" />

            <div className="review-marquee flex gap-4 w-[200%]">
              {[
                {
                  initials: "MH",
                  name: "Mai Hương",
                  role: "Chủ shop thời trang local brand, Hà Nội",
                  content:
                    "Trước khi dùng 360 Retail, mình phải vừa ghi sổ tay, vừa nhập excel nên rất dễ sót đơn, nhầm tồn kho. Giờ mọi thứ tự động, đỡ stress hẳn.",
                },
                {
                  initials: "TN",
                  name: "Tuấn Nguyễn",
                  role: "Chuỗi cà phê 3 chi nhánh, TP.HCM",
                  content:
                    "Mình thích nhất là xem được doanh thu theo ca và theo chi nhánh trên cùng một màn hình, quyết định thay đổi menu hay khuyến mãi cũng tự tin hơn.",
                },
                {
                  initials: "LH",
                  name: "Lan Hạnh",
                  role: "Shop mẹ & bé, Đà Nẵng",
                  content:
                    "Nhân viên chỉ mất một buổi là quen hệ thống. Tính năng tích điểm tự động giúp khách quay lại nhiều, doanh thu ổn định hơn.",
                },
                {
                  initials: "QP",
                  name: "Quốc Phong",
                  role: "Cửa hàng điện thoại, Cần Thơ",
                  content:
                    "Trước đây hay bị nhầm tồn kho giữa online và cửa hàng. Từ khi dùng 360 Retail thì không còn cảnh xin lỗi khách vì hết hàng nữa.",
                },
              ]
                .concat([
                  {
                    initials: "MH",
                    name: "Mai Hương",
                    role: "Chủ shop thời trang local brand, Hà Nội",
                    content:
                      "Trước khi dùng 360 Retail, mình phải vừa ghi sổ tay, vừa nhập excel nên rất dễ sót đơn, nhầm tồn kho. Giờ mọi thứ tự động, đỡ stress hẳn.",
                  },
                  {
                    initials: "TN",
                    name: "Tuấn Nguyễn",
                    role: "Chuỗi cà phê 3 chi nhánh, TP.HCM",
                    content:
                      "Mình thích nhất là xem được doanh thu theo ca và theo chi nhánh trên cùng một màn hình, quyết định thay đổi menu hay khuyến mãi cũng tự tin hơn.",
                  },
                  {
                    initials: "LH",
                    name: "Lan Hạnh",
                    role: "Shop mẹ & bé, Đà Nẵng",
                    content:
                      "Nhân viên chỉ mất một buổi là quen hệ thống. Tính năng tích điểm tự động giúp khách quay lại nhiều, doanh thu ổn định hơn.",
                  },
                  {
                    initials: "QP",
                    name: "Quốc Phong",
                    role: "Cửa hàng điện thoại, Cần Thơ",
                    content:
                      "Trước đây hay bị nhầm tồn kho giữa online và cửa hàng. Từ khi dùng 360 Retail thì không còn cảnh xin lỗi khách vì hết hàng nữa.",
                  },
                ])
                .map((review, index) => (
                  <div
                    key={index}
                    className="min-w-[260px] max-w-sm bg-card border border-border rounded-2xl px-5 py-5 shadow-md flex flex-col gap-4"
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      “{review.content}”
                    </p>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-xs font-semibold text-white">
                        {review.initials}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold">{review.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {review.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
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
            Sẵn sàng tăng trưởng
            <br />
            với 360 Retail?
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
            Gia nhập cộng đồng chủ shop đang vận hành cửa hàng hiệu quả, không
            còn phụ thuộc vào sổ sách.
          </p>

          <Link
            to="/dashboard"
            className="group bg-white dark:bg-card text-teal-700 dark:text-teal-400 px-12 py-5 rounded-2xl transition-all shadow-2xl hover:shadow-3xl hover:scale-105 inline-flex items-center gap-3"
            style={{ fontSize: "19px", fontWeight: "700" }}
          >
            Trải nghiệm 360 Retail ngay
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
            Miễn phí cho giai đoạn thử nghiệm · Không cần thẻ thanh toán
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
                360 Retail
              </h4>
              <p
                style={{
                  fontSize: "15px",
                  opacity: 0.7,
                  lineHeight: "1.6",
                  maxWidth: "320px",
                }}
              >
                Nền tảng quản lý bán hàng đa kênh cho cửa hàng vừa và nhỏ, dễ
                dùng như một ứng dụng điện thoại.
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

          <div className="pt-8 border-t border-white/10 text-center">
            <p
              style={{
                fontSize: "14px",
                opacity: 0.6,
                letterSpacing: "0.01em",
              }}
            >
              © 2025 360 Retail. Built for shop owners, by shop owners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { HomeBody };
