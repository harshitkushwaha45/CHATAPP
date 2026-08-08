import { useState } from "react";
import { Link } from "react-router";
import {
  EyeIcon,
  EyeOffIcon,
  LoaderIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";
import AuthShell from "../components/AuthShell";
import { useAuthStore } from "../store/useAuthStore";

const inputClass =
  "auth-light-input h-16 w-full rounded-xl border border-slate-200 bg-white/90 pl-16 pr-14 text-lg font-medium text-[#071334] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100";
const labelClass = "mb-3 block text-lg font-bold text-[#071334]";
const iconClass = "absolute left-5 top-1/2 size-6 -translate-y-1/2 text-slate-500";

function SignUpPage() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  return (
    <AuthShell
      headline="Join ChatApp"
      subheadline="Start secure conversations"
      navPrompt="Already here?"
      navLabel="Sign in"
      navTo="/login"
    >
      <div className="w-full max-w-xl rounded-[24px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(37,99,235,0.12)] backdrop-blur sm:p-12 lg:justify-self-end">
        <h2 className="text-3xl font-bold text-[#071334]">Create your account</h2>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label className={labelClass}>Full Name</label>
            <div className="relative">
              <UserIcon className={iconClass} />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={inputClass}
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <div className="relative">
              <MailIcon className={iconClass} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
                placeholder="johndoe@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <div className="relative">
              <LockIcon className={iconClass} />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={inputClass}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-blue-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon className="size-6" /> : <EyeIcon className="size-6" />}
              </button>
            </div>
          </div>

          <button
            className="flex h-16 w-full items-center justify-center rounded-xl bg-blue-600 text-2xl font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={isSigningUp}
          >
            {isSigningUp ? <LoaderIcon className="size-6 animate-spin" /> : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-600 sm:hidden">
          Already here?{" "}
          <Link to="/login" className="font-semibold text-blue-600">
            Sign in
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

export default SignUpPage;
