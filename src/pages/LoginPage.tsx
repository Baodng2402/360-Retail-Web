import BodyComponent from "../components/login/bodyComponent";
import HeaderComponet from "../components/login/headerComponet";

const LoginPage = () => {
  return (
    <div className="h-screen w-full overflow-hidden relative bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Decorative background blur circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      {/* Main content container */}
      <div className="relative h-full flex flex-col">
        {/* Header Section - Takes 35% of viewport */}
        <div className="h-[35vh] shrink-0">
          <HeaderComponet />
        </div>

        {/* Body Section - Remaining space */}
        <div className="flex-1 relative flex items-start justify-center -mt-40">
          <BodyComponent />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
