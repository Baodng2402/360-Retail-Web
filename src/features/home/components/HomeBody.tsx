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
} from "lucide-react";
import { motion } from "motion/react";
import TrueFocus from "@/shared/components/TrueFocus";
import { GithubGlobe } from "@/shared/components/configs/GithubGlobe";

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
  return (
    <motion.div
      className="min-h-screen bg-background transition-colors duration-300"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {/* Floating background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#FF7B21]/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#19D6C8]/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* hero Section */}
      <section className="relative px-6 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-12 gap-16 items-center">
          <motion.div
            variants={itemVariants}
            className="md:col-span-7 space-y-8 relative z-10"
          >
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
              <span className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text flex justify-start pt-3">
                <TrueFocus
                  sentence="Cùng 360 Retail"
                  manualMode
                  blurAmount={5}
                  borderColor="#FF7B21"
                  animationDuration={0.5}
                  pauseBetweenAnimations={1}
                />
              </span>
            </h1>

            <motion.p
              variants={itemVariants}
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
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <Link
                to="/dashboard"
                className="group relative bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-white px-8 py-4 rounded-2xl transition-all shadow-lg shadow-[#FF7B21]/25 hover:shadow-xl hover:shadow-[#FF7B21]/30 hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
                style={{ fontSize: "17px", fontWeight: "600" }}
              >
                Bắt đầu dùng thử miễn phí
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                className="group px-8 py-4 rounded-2xl transition-all backdrop-blur-sm bg-card/60 dark:bg-card/40 border border-border hover:bg-card hover:shadow-md hover:border-[#FF7B21]/30 flex items-center justify-center gap-2 text-muted-foreground"
                style={{
                  fontSize: "17px",
                  fontWeight: "600",
                }}
              >
                Xem demo nhanh
              </button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-center gap-6 pt-4 text-muted-foreground"
              style={{ fontSize: "14px" }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#19D6C8]" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#19D6C8]" />
                <span>5-min setup</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="md:col-span-5 relative"
          >
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-[32px] overflow-hidden shadow-2xl shadow-[#FF7B21]/10 border border-border backdrop-blur-xl bg-gradient-to-br from-card/90 to-card/70 dark:from-card/70 dark:to-card/50 p-4"
              >
                <img
                  src="https://images.unsplash.com/photo-1705909773171-4ba952b9c0af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtaW5pbWFsJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2NjgyNTQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Clean dashboard interface"
                  className="w-full rounded-[24px]"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-gradient-to-br from-card to-card/90 dark:from-card/90 dark:to-card/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/10 p-6 border border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF7B21] to-[#FF9F45] flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-foreground text-2xl font-extrabold">+142%</p>
                    <p className="text-muted-foreground text-[13px]">Tăng trưởng trung bình</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="border-y border-border bg-gradient-to-r from-[#FF7B21]/5 via-[#19D6C8]/5 to-[#FF7B21]/5 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900"
      >
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-center text-xs font-semibold tracking-[0.3em] uppercase text-muted-foreground mb-6">
            Được tin dùng bởi các thương hiệu bán lẻ tại Việt Nam
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-8 lg:gap-16 hover:opacity-100 transition-opacity duration-500"
          >
            {[
              { color: "from-[#FF7B21] to-[#FF9F45]", name: "Urban Style" },
              { color: "from-orange-500 to-amber-500", name: "Coffee Corner" },
              { color: "from-sky-500 to-indigo-500", name: "Mobile Hub" },
              { color: "from-emerald-500 to-[#19D6C8]", name: "Green Mart" },
            ].map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                className="h-8 flex items-center gap-2 font-semibold text-sm md:text-base text-foreground"
              >
                <span className={`inline-block h-6 w-6 rounded-lg bg-gradient-to-br ${brand.color}`} />
                {brand.name}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="relative px-6 py-24 bg-gradient-to-b from-background via-[#19D6C8]/5 to-emerald-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20 max-w-2xl mx-auto"
          >
            <h2 className="text-foreground text-[clamp(32px,4vw,48px)] font-extrabold mb-4 tracking-tight">
              Một nền tảng,
              <br />
              <span className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">bao trùm mọi quy trình</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Bộ tính năng gọn nhẹ thay thế hàng giờ nhập liệu và tổng hợp thủ công
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Feature 1: Staff Management */}
            <motion.div variants={itemVariants} whileHover={{ y: -8 }}>
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] rounded-[28px] opacity-0 group-hover:opacity-100 blur transition-all duration-500" />

                <div className="relative bg-card p-10 rounded-[28px] shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-[#FF7B21]/10 transition-all duration-500 border border-border">
                  <div className="relative w-20 h-20 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] rounded-[20px] opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] rounded-[20px] flex items-center justify-center">
                      <UserCheck className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  <h3 className="text-foreground text-[22px] font-bold mb-3 tracking-tight">
                    Chấm công & ca làm
                    <span className="block text-muted-foreground text-base font-normal mt-1">(Nhân viên)</span>
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Điểm danh nhanh, lịch làm rõ ràng, không còn file excel hay sổ chấm công rời rạc.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 2: Sales */}
            <motion.div variants={itemVariants} whileHover={{ y: -8 }}>
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[28px] opacity-0 group-hover:opacity-100 blur transition-all duration-500" />

                <div className="relative bg-card p-10 rounded-[28px] shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-orange-600/10 transition-all duration-500 border border-border">
                  <div className="relative w-20 h-20 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[20px] opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[20px] flex items-center justify-center">
                      <ShoppingCart className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  <h3 className="text-foreground text-[22px] font-bold mb-3 tracking-tight">
                    Bán hàng cực nhanh
                    <span className="block text-muted-foreground text-base font-normal mt-1">(Tại quầy & online)</span>
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Hoàn tất đơn chỉ với vài thao tác, tự động trừ tồn kho và đồng bộ dữ liệu giữa các kênh.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 3: Loyalty */}
            <motion.div variants={itemVariants} whileHover={{ y: -8 }}>
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-[#FF7B21] via-[#FF9F45] to-[#19D6C8] rounded-[28px] opacity-0 group-hover:opacity-100 blur transition-all duration-500" />

                <div className="relative bg-card p-10 rounded-[28px] shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-[#FF7B21]/10 transition-all duration-500 border border-border">
                  <div className="relative w-20 h-20 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] rounded-[20px] opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] rounded-[20px] flex items-center justify-center">
                      <Users className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  <h3 className="text-foreground text-[22px] font-bold mb-3 tracking-tight">
                    Tích điểm & chăm sóc tự động
                    <span className="block text-muted-foreground text-base font-normal mt-1">(Khách hàng)</span>
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Khách mua là có điểm, có ưu đãi. Hệ thống tự ghi nhận, bạn chỉ việc chăm sóc và bán hàng.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="relative px-6 py-24 bg-gradient-to-b from-emerald-50/60 via-background to-[#19D6C8]/5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20 max-w-2xl mx-auto"
          >
            <h2 className="text-foreground text-[clamp(32px,4vw,48px)] font-extrabold mb-4 tracking-tight">
              Bắt đầu trong <span className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">3 bước</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Không cần am hiểu công nghệ, chỉ cần bạn đang vận hành cửa hàng.
            </p>
          </motion.div>

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
              className="grid md:grid-cols-3 gap-12 relative"
            >
              {/* Step 1 */}
              <motion.div variants={itemVariants} className="text-center relative">
                <motion.div whileHover={{ scale: 1.05 }} className="relative w-44 h-44 mx-auto mb-8 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21] to-[#FF9F45] rounded-[32px] shadow-2xl shadow-[#FF7B21]/30 group-hover:shadow-[#FF7B21]/40 transition-all duration-500" />
                  <div className="absolute inset-0 rounded-[32px] flex items-center justify-center">
                    <Settings className="w-20 h-20 text-white" strokeWidth={2} />
                  </div>
                </motion.div>

                <div className="inline-block px-5 py-2 bg-gradient-to-r from-[#FF7B21]/10 to-[#FF9F45]/10 rounded-full mb-5 border border-[#FF7B21]/20">
                  <p className="text-xs font-extrabold text-[#FF7B21] tracking-widest">STEP 1</p>
                </div>

                <h3 className="text-foreground text-2xl font-bold mb-3 tracking-tight">Thiết lập nhanh</h3>
                <p className="text-muted-foreground text-base leading-relaxed max-w-[280px] mx-auto">
                  Nhập sản phẩm, nhân viên, ca làm theo hướng dẫn trực quan trong vài phút.
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div variants={itemVariants} className="text-center relative">
                <motion.div whileHover={{ scale: 1.05 }} className="relative w-44 h-44 mx-auto mb-8 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[32px] shadow-2xl shadow-orange-600/30 group-hover:shadow-orange-600/40 transition-all duration-500" />
                  <div className="absolute inset-0 rounded-[32px] flex items-center justify-center">
                    <Zap className="w-20 h-20 text-white" strokeWidth={2} />
                  </div>
                </motion.div>

                <div className="inline-block px-5 py-2 bg-gradient-to-r from-orange-100 to-orange-50 rounded-full mb-5 border border-orange-200/50">
                  <p className="text-xs font-extrabold text-orange-600 tracking-widest">STEP 2</p>
                </div>

                <h3 className="text-foreground text-2xl font-bold mb-3 tracking-tight">Bắt đầu bán hàng</h3>
                <p className="text-muted-foreground text-base leading-relaxed max-w-[280px] mx-auto">
                  Tạo đơn đầu tiên, phần còn lại (tồn kho, báo cáo, tích điểm) được tự động hóa.
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div variants={itemVariants} className="text-center relative">
                <motion.div whileHover={{ scale: 1.05 }} className="relative w-44 h-44 mx-auto mb-8 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21] via-[#FF9F45] to-[#19D6C8] rounded-[32px] shadow-2xl shadow-[#FF7B21]/30 group-hover:shadow-[#FF7B21]/40 transition-all duration-500" />
                  <div className="absolute inset-0 rounded-[32px] flex items-center justify-center">
                    <TrendingUp className="w-20 h-20 text-white" strokeWidth={2} />
                  </div>
                </motion.div>

                <div className="inline-block px-5 py-2 bg-gradient-to-r from-[#FF7B21]/10 to-[#19D6C8]/10 rounded-full mb-5 border border-[#FF7B21]/20">
                  <p className="text-xs font-extrabold bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent tracking-widest">STEP 3</p>
                </div>

                <h3 className="text-foreground text-2xl font-bold mb-3 tracking-tight">Xem cửa hàng tăng trưởng</h3>
                <p className="text-muted-foreground text-base leading-relaxed max-w-[280px] mx-auto">
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
        className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white"
      >
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-[clamp(32px,4vw,44px)] font-extrabold mb-6 tracking-tight">
              Đồng hành cùng sự phát triển bán lẻ Việt Nam
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-10">
              Từ trung tâm thành phố đến tỉnh lẻ, 360 Retail giúp chủ shop theo dõi doanh thu và khách hàng theo khu vực, từ đó tối ưu chiến dịch và nguồn lực.
            </p>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid grid-cols-2 gap-8"
            >
              {[
                { value: "5,000+", label: "Cửa hàng sử dụng", color: "text-[#FF7B21]" },
                { value: "63", label: "Tỉnh thành có khách hàng", color: "text-[#19D6C8]" },
                { value: "12+", label: "Ngành hàng khác nhau", color: "text-[#FF7B21]" },
                { value: "24/7", label: "Hỗ trợ đội ngũ CSKH", color: "text-[#19D6C8]" },
              ].map((stat) => (
                <motion.div key={stat.label} variants={itemVariants}>
                  <p className={`text-3xl md:text-4xl font-extrabold ${stat.color} mb-1`}>{stat.value}</p>
                  <p className="text-sm font-medium text-slate-300">{stat.label}</p>
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
            <div className="relative h-[500px] md:h-[600px] w-full max-w-3xl mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl border border-border/40 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,#22d3ee_0,transparent_55%),radial-gradient(circle_at_bottom,#fb923c_0,transparent_55%)] z-0" />
                <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
                  <GithubGlobe />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-[#19D6C8]/5 via-background to-emerald-50/40 dark:from-slate-900/60 dark:via-background dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-muted-foreground mb-4">Đánh giá từ khách hàng</p>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Chủ shop nói gì về 360 Retail</h2>
          </motion.div>

          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-background to-transparent dark:from-slate-900 z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-background to-transparent dark:from-slate-900 z-10" />

            <div className="review-marquee flex gap-4 w-[200%]">
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
                    className="min-w-[260px] max-w-sm bg-card border border-border rounded-2xl px-5 py-5 shadow-md flex flex-col gap-4 hover:shadow-xl hover:border-[#FF7B21]/20 transition-all duration-300"
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed">"{review.content}"</p>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center text-xs font-semibold text-white">{review.initials}</div>
                      <div className="text-left">
                        <p className="text-sm font-semibold">{review.name}</p>
                        <p className="text-xs text-muted-foreground">{review.role}</p>
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
        className="relative px-6 py-24 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21] via-[#FF9F45] to-[#19D6C8]" />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl"
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-[clamp(36px,5vw,56px)] font-extrabold text-white mb-5 tracking-tight leading-[1.1]">
            Sẵn sàng tăng trưởng<br />với 360 Retail?
          </h2>
          <p className="text-[20px] text-white/95 mb-10 leading-relaxed">
            Gia nhập cộng đồng chủ shop đang vận hành cửa hàng hiệu quả, không còn phụ thuộc vào sổ sách.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/dashboard"
              className="group bg-white text-[#FF7B21] px-12 py-5 rounded-2xl transition-all shadow-2xl hover:shadow-3xl inline-flex items-center gap-3"
              style={{ fontSize: "19px", fontWeight: "700" }}
            >
              Trải nghiệm 360 Retail ngay
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          <p className="text-sm text-white/85 mt-6">Miễn phí cho giai đoạn thử nghiệm · Không cần thẻ thanh toán</p>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="px-6 py-16 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-4 gap-12 mb-12"
          >
            <motion.div variants={itemVariants} className="md:col-span-2">
              <h4 className="text-2xl font-extrabold mb-3 bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">360 Retail</h4>
              <p className="text-sm opacity-70 leading-relaxed max-w-[320px]">
                Nền tảng quản lý bán hàng đa kênh cho cửa hàng vừa và nhỏ, dễ dùng như một ứng dụng điện thoại.
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h5 className="text-xs font-bold mb-4 tracking-widest opacity-50">PRODUCT</h5>
              <ul className="space-y-3 text-sm opacity-80">
                {["Features", "Pricing", "Security"].map((item) => (
                  <li key={item}><a href="#" className="hover:text-[#19D6C8] transition-colors">{item}</a></li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h5 className="text-xs font-bold mb-4 tracking-widest opacity-50">COMPANY</h5>
              <ul className="space-y-3 text-sm opacity-80">
                {["About", "Blog", "Contact"].map((item) => (
                  <li key={item}><a href="#" className="hover:text-[#19D6C8] transition-colors">{item}</a></li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-sm opacity-60 tracking-wide">© 2025 360 Retail. Built for shop owners, by shop owners.</p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export { HomeBody };
