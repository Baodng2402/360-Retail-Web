import logo from "@/assets/logo.png";
import { CornerUpLeft } from "lucide-react";
import { Link } from "react-router-dom";

const LoginHeader = () => {
  return (
    <>
      <div className="bg-gradient-to-r from-[#2efcef] to-[#FF7B21] flex flex-col sm:flex-row justify-between items-center sm:items-start text-white mx-4 sm:mx-6 mt-4 sm:mt-6 px-6 sm:px-8 py-5 sm:py-6 rounded-2xl shadow-xl gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
          <Link to="/" className="flex items-center gap-2">
            <CornerUpLeft
              size={28}
              className="text-[#57534E] hover:text-white transition-all duration-300"
            />
            <img
              src={logo}
              alt="logo"
              className="w-36 sm:w-48 md:w-56 h-auto object-contain"
            />
          </Link>
        </div>

        <div className="flex flex-col pt-0 sm:pt-12 justify-center items-center text-center order-first sm:order-none mb-2 sm:mb-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-white leading-tight">
            Welcome!
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#57534E] font-medium mt-2">
            No tech expertise required. We promise.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-end flex-wrap">
          <button className="px-3 sm:px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105">
            Sign In
          </button>
          <button className="px-3 sm:px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105">
            Sign Up
          </button>
          <button className="px-3 sm:px-5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105 border border-white/30">
            Get Started
          </button>
        </div>
      </div>
    </>
  );
};

export default LoginHeader;

