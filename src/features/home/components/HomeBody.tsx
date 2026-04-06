import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Settings,
  Zap,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { GithubGlobe } from "@/shared/components/configs/GithubGlobe";
import { HeroSection } from "./HeroSection";
import { PlatformSection } from "./PlatformSection";
import { useTranslation } from "react-i18next";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const HomeBody = () => {
  const { t } = useTranslation("home");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      className="min-h-screen bg-background transition-colors duration-300"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {/* ========== NEW: HERO SECTION ========== */}
      <HeroSection />

      {/* Trust Bar */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="border-y"
        style={{
          background: isDark
            ? "linear-gradient(to right, #0f172a, #1e293b, #0f172a)"
            : "linear-gradient(to right, rgba(255,123,33,0.05), rgba(25,214,200,0.05), rgba(255,123,33,0.05))",
          borderColor: isDark ? "#1e293b" : "#e2e8f0",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 sm:py-10">
          <p
            className="text-center text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] uppercase mb-4 sm:mb-6"
            style={{ color: isDark ? "#64748b" : "#94a3b8" }}
          >
            Được tin dùng bởi các thương hiệu bán lẻ tại Việt Nam
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 lg:gap-16 hover:opacity-100 transition-opacity duration-500"
          >
            {[
              { color: "from-[#FF7B21] to-[#FF9F45]", name: "Urban Style" },
              { color: "from-orange-500 to-amber-500", name: "Coffee Corner" },
              { color: "from-sky-500 to-indigo-500", name: "Mobile Hub" },
              { color: "from-emerald-500 to-[#19D6C8]", name: "Green Mart" },
            ]              .map((brand, i) => (
                <motion.div
                  key={brand.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isDark ? 0.7 : 0.6, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  whileHover={{ opacity: 1, scale: 1.05 }}
                  className="flex items-center gap-1 sm:gap-1.5 font-semibold text-[10px] sm:text-xs md:text-base"
                  style={{ color: isDark ? "#e2e8f0" : "#334155" }}
                >
                <span className={`inline-block h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 rounded-lg bg-gradient-to-br ${brand.color}`} />
                <span className="whitespace-nowrap">{brand.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ========== NEW: PLATFORM SECTION ========== */}
      <PlatformSection />

      {/* Steps Section */}
      <section className="relative px-4 sm:px-6 py-12 sm:py-16 md:py-24 bg-gradient-to-b from-emerald-50/60 via-background to-[#19D6C8]/5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-12 md:mb-20 max-w-2xl mx-auto px-2"
          >
            <h2 className="text-foreground text-[clamp(24px,4vw,48px)] font-extrabold mb-3 sm:mb-4 tracking-tight px-2">
              Bắt đầu trong <span className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">3 bước</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed px-2 sm:px-4">
              Không cần am hiểu công nghệ, chỉ cần bạn đang vận hành cửa hàng.
            </p>
          </motion.div>

          <div className="relative max-w-5xl mx-auto px-4">
            <svg
              className="hidden lg:block absolute top-20 lg:top-28 left-0 w-full h-24 lg:h-32 pointer-events-none"
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
                  <stop offset="0%" stopColor="#FF7B21" />
                  <stop offset="50%" stopColor="#FF9F45" />
                  <stop offset="100%" stopColor="#19D6C8" />
                </linearGradient>
              </defs>
            </svg>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid sm:grid-cols-3 gap-8 lg:gap-12 relative"
            >
              {/* Step 1 */}
              <motion.div variants={itemVariants} className="text-center relative">
                <motion.div whileHover={{ scale: 1.05 }} className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 mx-auto mb-5 sm:mb-6 lg:mb-8 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21] to-[#FF9F45] rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] shadow-2xl shadow-[#FF7B21]/30 group-hover:shadow-[#FF7B21]/40 transition-all duration-500" />
                  <div className="absolute inset-0 rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] flex items-center justify-center">
                    <Settings className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-white" strokeWidth={2} />
                  </div>
                </motion.div>

                <div className="inline-block px-3 sm:px-4 sm:py-2 py-1.5 bg-gradient-to-r from-[#FF7B21]/10 to-[#FF9F45]/10 rounded-full mb-3 sm:mb-5 border border-[#FF7B21]/20">
                  <p className="text-[10px] sm:text-xs font-extrabold text-[#FF7B21] tracking-widest">STEP 1</p>
                </div>

                <h3 className="text-foreground text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 tracking-tight">Thiết lập nhanh</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-[220px] sm:max-w-[260px] lg:max-w-[280px] mx-auto">
                  Nhập sản phẩm, nhân viên, ca làm theo hướng dẫn trực quan trong vài phút.
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div variants={itemVariants} className="text-center relative">
                <motion.div whileHover={{ scale: 1.05 }} className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 mx-auto mb-5 sm:mb-6 lg:mb-8 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] shadow-2xl shadow-orange-600/30 group-hover:shadow-orange-600/40 transition-all duration-500" />
                  <div className="absolute inset-0 rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] flex items-center justify-center">
                    <Zap className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-white" strokeWidth={2} />
                  </div>
                </motion.div>

                <div className="inline-block px-3 sm:px-4 sm:py-2 py-1.5 bg-gradient-to-r from-orange-100 to-orange-50 rounded-full mb-3 sm:mb-5 border border-orange-200/50 dark:from-orange-900/30 dark:to-orange-950/20 dark:border-orange-800/30">
                  <p className="text-[10px] sm:text-xs font-extrabold text-orange-600 dark:text-orange-400 tracking-widest">STEP 2</p>
                </div>

                <h3 className="text-foreground text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 tracking-tight">Bắt đầu bán hàng</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-[220px] sm:max-w-[260px] lg:max-w-[280px] mx-auto">
                  Tạo đơn đầu tiên, phần còn lại (tồn kho, báo cáo, tích điểm) được tự động hóa.
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div variants={itemVariants} className="text-center relative">
                <motion.div whileHover={{ scale: 1.05 }} className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 mx-auto mb-5 sm:mb-6 lg:mb-8 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21] via-[#FF9F45] to-[#19D6C8] rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] shadow-2xl shadow-[#FF7B21]/30 group-hover:shadow-[#FF7B21]/40 transition-all duration-500" />
                  <div className="absolute inset-0 rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] flex items-center justify-center">
                    <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-white" strokeWidth={2} />
                  </div>
                </motion.div>

                <div className="inline-block px-3 sm:px-4 sm:py-2 py-1.5 bg-gradient-to-r from-[#FF7B21]/10 to-[#19D6C8]/10 rounded-full mb-3 sm:mb-5 border border-[#FF7B21]/20">
                  <p className="text-[10px] sm:text-xs font-extrabold bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent tracking-widest">STEP 3</p>
                </div>

                <h3 className="text-foreground text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 tracking-tight">Xem cửa hàng tăng trưởng</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-[220px] sm:max-w-[260px] lg:max-w-[280px] mx-auto">
                  Nắm được mặt hàng bán chạy, khung giờ cao điểm để ra quyết định thông minh hơn.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-12 sm:py-16 md:py-24"
        style={{
          background: isDark
            ? "linear-gradient(to bottom, #0f172a, #1e293b, #0f172a)"
            : "linear-gradient(to bottom, #f1f5f9, #e2e8f0, #f8fafc)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-[clamp(22px,4vw,44px)] font-extrabold mb-3 sm:mb-4 md:mb-6 tracking-tight"
              style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
            >
              Đồng hành cùng sự phát triển bán lẻ Việt Nam
            </h2>
            <p
              className="text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 md:mb-10"
              style={{ color: isDark ? "#94a3b8" : "#475569" }}
            >
              Từ trung tâm thành phố đến tỉnh lẻ, 360 Retail giúp chủ shop theo dõi doanh thu và khách hàng theo khu vực, từ đó tối ưu chiến dịch và nguồn lực.
            </p>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid grid-cols-2 gap-6 sm:gap-8"
            >
              {[
                { value: "5,000+", label: "Cửa hàng sử dụng", color: "#FF7B21" },
                { value: "63", label: "Tỉnh thành có khách hàng", color: "#19D6C8" },
                { value: "12+", label: "Ngành hàng khác nhau", color: "#FF7B21" },
                { value: "24/7", label: "Hỗ trợ đội ngũ CSKH", color: "#19D6C8" },
              ].map((stat) => (
                <motion.div key={stat.label} variants={itemVariants}>
                  <p
                    className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: isDark ? "#94a3b8" : "#64748b" }}
                  >
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full"
          >
            <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] w-full max-w-3xl mx-auto">
              <div
                className="absolute inset-0 rounded-2xl sm:rounded-3xl shadow-2xl border overflow-hidden"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
                    : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  borderColor: isDark ? "rgba(51,65,85,0.5)" : "rgba(226,232,240,0.8)",
                  boxShadow: isDark
                    ? "0 25px 50px -12px rgba(0,0,0,0.5)"
                    : "0 25px 50px -12px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  className="absolute inset-0 z-0"
                  style={{
                    opacity: isDark ? 0.2 : 0.15,
                    background: isDark
                      ? "radial-gradient(circle_at_top,#22d3ee_0,transparent_55%),radial-gradient(circle_at_bottom,#fb923c_0,transparent_55%)"
                      : "radial-gradient(circle_at_top,#0ea5e9_0,transparent_50%),radial-gradient(circle_at_bottom,#FF7B21_0,transparent_50%)",
                  }}
                />
                <div className="absolute inset-0 z-10 flex items-center justify-center p-2 sm:p-4">
                  <GithubGlobe />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-[#19D6C8]/5 via-background to-emerald-50/40 dark:from-slate-900/60 dark:via-background dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-10"
          >
            <p className="text-[9px] sm:text-xs font-semibold tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] uppercase text-muted-foreground mb-3 sm:mb-4">Đánh giá từ khách hàng</p>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight">Chủ shop nói gì về 360 Retail</h2>
          </motion.div>

          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-12 sm:w-24 bg-gradient-to-r from-background to-transparent dark:from-slate-900 z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 sm:w-24 bg-gradient-to-l from-background to-transparent dark:from-slate-900 z-10" />

            <div className="review-marquee flex gap-4 sm:gap-6 w-[200%]">
              {[
                { initials: "MH", name: "Mai Hương", role: "Chủ shop thời trang local brand, Hà Nội", content: "Trước khi dùng 360 Retail, mình phải vừa ghi sổ tay, vừa nhập excel nên rất dễ sót đơn, nhầm tồn kho. Giờ mọi thứ tự động, đỡ stress hẳn." },
                { initials: "TN", name: "Tuấn Nguyễn", role: "Chuỗi cà phê 3 chi nhánh, TP.HCM", content: "Mình thích nhất là xem được doanh thu theo ca và theo chi nhánh trên cùng một màn hình, quyết định thay đổi menu hay khuyến mãi cũng tự tin hơn." },
                { initials: "LH", name: "Lan Hạnh", role: "Shop mẹ & bé, Đà Nẵng", content: "Nhân viên chỉ mất một buổi là quen hệ thống. Tính năng tích điểm tự động giúp khách quay lại nhiều, doanh thu ổn định hơn." },
                { initials: "QP", name: "Quốc Phong", role: "Cửa hàng điện thoại, Cần Thơ", content: "Trước đây hay bị nhầm tồn kho giữa online và cửa hàng. Từ khi dùng 360 Retail thì không còn cảnh xin lỗi khách vì hết hàng nữa." },
              ]
                .concat([
                  { initials: "MH", name: "Mai Hương", role: "Chủ shop thời trang local brand, Hà Nội", content: "Trước khi dùng 360 Retail, mình phải vừa ghi sổ tay, vừa nhập excel nên rất dễ sót đơn, nhầm tồn kho. Giờ mọi thứ tự động, đỡ stress hẳn." },
                  { initials: "TN", name: "Tuấn Nguyễn", role: "Chuỗi cà phê 3 chi nhánh, TP.HCM", content: "Mình thích nhất là xem được doanh thu theo ca và theo chi nhánh trên cùng một màn hình, quyết định thay đổi menu hay khuyến mãi cũng tự tin hơn." },
                  { initials: "LH", name: "Lan Hạnh", role: "Shop mẹ & bé, Đà Nẵng", content: "Nhân viên chỉ mất một buổi là quen hệ thống. Tính năng tích điểm tự động giúp khách quay lại nhiều, doanh thu ổn định hơn." },
                  { initials: "QP", name: "Quốc Phong", role: "Cửa hàng điện thoại, Cần Thơ", content: "Trước đây hay bị nhầm tồn kho giữa online và cửa hàng. Từ khi dùng 360 Retail thì không còn cảnh xin lỗi khách vì hết hàng nữa." },
                ])
                .map((review, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    className="min-w-[220px] sm:min-w-[260px] max-w-sm bg-card border border-border rounded-xl sm:rounded-2xl px-4 sm:px-5 py-4 sm:py-5 shadow-md flex flex-col gap-3 sm:gap-4 hover:shadow-xl hover:border-[#FF7B21]/20 transition-all duration-300"
                  >
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">"{review.content}"</p>
                    <div className="flex items-center gap-2 sm:gap-3 mt-auto">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center text-[10px] sm:text-xs font-semibold text-white">{review.initials}</div>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold">{review.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{review.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative px-4 sm:px-6 py-12 sm:py-16 md:py-24 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21] via-[#FF9F45] to-[#19D6C8]" />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-60 sm:w-72 sm:w-96 h-60 sm:h-72 sm:h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 left-0 w-48 sm:w-60 sm:w-80 h-48 sm:h-60 sm:h-80 bg-orange-500/20 rounded-full blur-3xl"
        />

        <div className="relative max-w-4xl mx-auto text-center px-2">
          <h2 className="text-[clamp(24px,5vw,56px)] font-extrabold text-white mb-3 sm:mb-4 md:mb-5 tracking-tight leading-[1.1]">
            Sẵn sàng tăng trưởng<br />với 360 Retail?
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-[20px] text-white/95 mb-6 sm:mb-8 md:mb-10 leading-relaxed px-2 sm:px-4">
            Gia nhập cộng đồng chủ shop đang vận hành cửa hàng hiệu quả, không còn phụ thuộc vào sổ sách.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block">
            <Link
              to="/dashboard"
              className="group bg-white text-[#FF7B21] px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl transition-all shadow-2xl hover:shadow-3xl inline-flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center"
              style={{ fontSize: "clamp(13px, 2vw, 19px)", fontWeight: "700" }}
            >
              Trải nghiệm 360 Retail ngay
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          <p className="text-[10px] sm:text-xs md:text-sm text-white/85 mt-3 sm:mt-4 md:mt-6">Miễn phí cho giai đoạn thử nghiệm · Không cần thẻ thanh toán</p>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-10 sm:py-12 md:py-16 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-12 mb-8 sm:mb-10 md:mb-12"
          >
            <motion.div variants={itemVariants} className="sm:col-span-2 md:col-span-2">
              <h4 className="text-lg sm:text-xl md:text-2xl font-extrabold mb-3 bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">360 Retail</h4>
              <p className="text-xs sm:text-sm opacity-70 leading-relaxed max-w-[320px]">
                Nền tảng quản lý bán hàng đa kênh cho cửa hàng vừa và nhỏ, dễ dùng như một ứng dụng điện thoại.
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h5 className="text-[9px] sm:text-[10px] md:text-xs font-bold mb-3 sm:mb-4 tracking-widest opacity-50">
                {t("footer.product")}
              </h5>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm opacity-80">
                {(t("footer.productItems", { returnObjects: true }) as string[]).map((item) => (
                  <li key={item}><a href="#" className="hover:text-[#19D6C8] transition-colors">{item}</a></li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h5 className="text-[9px] sm:text-[10px] md:text-xs font-bold mb-3 sm:mb-4 tracking-widest opacity-50">
                {t("footer.company")}
              </h5>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm opacity-80">
                {(t("footer.companyItems", { returnObjects: true }) as string[]).map((item) => (
                  <li key={item}><a href="#" className="hover:text-[#19D6C8] transition-colors">{item}</a></li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          <div className="pt-6 sm:pt-8 border-t border-white/10 text-center">
            <p className="text-xs sm:text-sm opacity-60 tracking-wide">
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export { HomeBody };
