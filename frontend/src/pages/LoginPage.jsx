import { useState } from "react";
import { Link } from "react-router";
import {
  EyeIcon,
  EyeOffIcon,
  LoaderIcon,
  LockIcon,
  MailIcon,
} from "lucide-react";
import AuthShell from "../components/AuthShell";
import { useAuthStore } from "../store/useAuthStore";

const inputClass =
  "auth-light-input h-16 w-full rounded-xl border border-slate-200 bg-white/90 pl-16 pr-14 text-lg font-medium text-[#071334] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100";
const labelClass = "mb-3 block text-lg font-bold text-[#071334]";
const iconClass = "absolute left-5 top-1/2 size-6 -translate-y-1/2 text-slate-500";

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <AuthShell
      headline="Welcome back"
      subheadline="Continue your conversations"
      navPrompt="New here?"
      navLabel="Sign up"
      navTo="/signup"
    >
      <div className="w-full max-w-xl rounded-[24px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(37,99,235,0.12)] backdrop-blur sm:p-12 lg:justify-self-end">
        <h2 className="text-3xl font-bold text-[#071334]">Sign in to your account</h2>

        <form onSubmit={handleSubmit} className="mt-12 space-y-7">
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

          <label className="flex w-fit items-center gap-3 text-lg text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Remember me
          </label>

          <button
            className="flex h-16 w-full items-center justify-center rounded-xl bg-blue-600 text-2xl font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? <LoaderIcon className="size-6 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-600 sm:hidden">
          New here?{" "}
          <Link to="/signup" className="font-semibold text-blue-600">
            Sign up
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

export default LoginPage;
