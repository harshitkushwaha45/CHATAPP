import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import PageLoader from "./components/PageLoader";

import { Toaster } from "react-hot-toast";

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div className="chat-app-shell relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f7fb] px-3 py-4 sm:px-6">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#ffffff_0%,#f3f7ff_54%,#f7f3ff_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0)_100%)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-44 w-[42rem] opacity-10 [background-image:radial-gradient(#8ea3c1_1px,transparent_1px)] [background-size:14px_14px] [mask-image:linear-gradient(90deg,#000_0%,transparent_88%)]" />

      <Routes>
        <Route path="/" element={authUser ? <ChatPage /> : <Navigate to={"/login"} />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
      </Routes>

      <Toaster />
    </div>
  );
}
export default App;
