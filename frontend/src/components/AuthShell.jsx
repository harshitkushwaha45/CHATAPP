import { Link } from "react-router";
import {
  LanguagesIcon,
  MessageCircleMoreIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "lucide-react";

const features = [
  {
    title: "Smart Search",
    text: "Find messages instantly with AI",
    icon: SearchIcon,
  },
  {
    title: "Stay Connected",
    text: "See who's online and available to chat",
    icon: MessageCircleMoreIcon,
  },
  {
    title: "Secure & Private",
    text: "Your chats are encrypted end-to-end",
    icon: ShieldCheckIcon,
  },
];

function AuthShell({ children, headline, subheadline, navPrompt, navLabel, navTo }) {
  return (
    <main className="fixed inset-0 z-10 overflow-y-auto bg-[#f7faff] text-[#071334]">
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#ffffff_0%,#f6f9ff_46%,#eef5ff_100%)]" />
        <div className="absolute -left-44 -top-52 size-[680px] rounded-full border border-blue-100/60" />
        <div className="absolute bottom-[-310px] right-[14%] size-[560px] rounded-full border-[52px] border-white/35" />
        <div
          className="absolute bottom-10 left-10 hidden h-32 w-48 opacity-70 sm:block"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(37, 99, 235, 0.18) 2px, transparent 2px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
          <header className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-4">
              <MessageCircleMoreIcon className="size-14 text-blue-600" strokeWidth={2.5} />
              <span className="text-3xl font-bold text-[#071334]">ChatApp</span>
            </Link>

            <div className="flex items-center gap-4 text-base text-slate-600 sm:text-lg">
              <span className="hidden sm:inline">{navPrompt}</span>
              <Link
                to={navTo}
                className="rounded-full border border-blue-100 bg-white/55 px-6 py-3 font-semibold text-blue-600 shadow-sm shadow-blue-100/50 transition hover:border-blue-200 hover:bg-white"
              >
                {navLabel}
              </Link>
            </div>
          </header>

          <section className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1fr_0.95fr] lg:py-8">
            <div className="max-w-xl">
              <h1 className="text-5xl font-bold leading-tight text-[#071334] sm:text-6xl">
                {headline}
              </h1>
              <p className="mt-5 text-2xl text-slate-600">{subheadline}</p>

              <div className="mt-12 space-y-8">
                {features.map(({ title, text, icon: Icon }) => (
                  <div key={title} className="flex items-start gap-7">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm shadow-blue-100">
                      <Icon className="size-9" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#071334]">{title}</h2>
                      <p className="mt-2 max-w-[15rem] text-lg leading-relaxed text-slate-600">
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {children}
          </section>
        </div>
      </div>
    </main>
  );
}

export default AuthShell;
