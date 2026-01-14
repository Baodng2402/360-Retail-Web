import logo from "@/assets/logo.png";
import { CornerUpLeft } from "lucide-react";

const LoginHeader = () => {
  return (
    <>
      <div className="bg-gradient-to-r from-[#2efcef] to-[#FF7B21] flex justify-between text-white mx-6 mt-6 px-8 py-6 pb-100 rounded-2xl shadow-xl">
        <div className="flex items-start gap-2">
          <CornerUpLeft
            size={36}
            className="mt-2 text-[#57534E] hover:cursor-pointer hover:text-white transition-all duration-300"
          />
          <img
            src={logo}
            alt="logo"
            className="w-[200px] h-[100px] object-contain"
          />
        </div>

        <div className="flex flex-col pt-12 justify-center items-center">
          <h1 className="text-[52px] font-extrabold text-white leading-tight">
            Welcome!
          </h1>
          <p className="text-base text-[#57534E] font-medium mt-2">
            No tech expertise required. We promise.
          </p>
        </div>

        <div className="flex items-start gap-3 pt-2">
          <button className="px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white font-medium transition-all duration-300 hover:scale-105">
            Sign In
          </button>
          <button className="px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white font-medium transition-all duration-300 hover:scale-105">
            Sign Up
          </button>
          <button className="px-5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white font-semibold transition-all duration-300 hover:scale-105 border border-white/30">
            Get Started
          </button>
        </div>
      </div>
    </>
  );
};

export default LoginHeader;

