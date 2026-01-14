import { SignupForm } from "@/shared/components/ui/SignupForm";

const SignupPage = () => {
  return (
    <div className="min-h-screen w-full relative bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="relative container mx-auto px-4 py-16 flex items-center justify-center">
        <SignupForm heading="Create your account" />
      </div>
    </div>
  );
};

export default SignupPage;

