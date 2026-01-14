import LoginBody from "@/features/auth/components/LoginBody";
import LoginHeader from "@/features/auth/components/LoginHeader";

const LoginPage = () => {
  return (
    <div className="h-screen w-full overflow-hidden relative bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="relative h-full flex flex-col">
        <div className="h-[35vh] shrink-0">
          <LoginHeader />
        </div>

        <div className="flex-1 relative flex items-start justify-center -mt-40">
          <LoginBody />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

