import SignupForm from "../components/signup/SignupForm";

const SignUp = () => {
  return (
    <div  className="min-h-[calc(100vh-80px)] w-full bg-[var(--bg)] font-mono text-white flex items-center justify-center ">
      <SignupForm />
    </div>
  );
};

export default SignUp;
