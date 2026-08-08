// How to make animated gradient border 👇
// https://cruip-tutorials.vercel.app/animated-gradient-border/
function BorderAnimatedContainer({ children }) {
  return (
    <div className="w-full h-full [background:linear-gradient(45deg,#ffffff,#f8fbff)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.blue.100)_80%,_theme(colors.blue.500)_86%,_theme(colors.blue.300)_90%,_theme(colors.blue.500)_94%,_theme(colors.blue.100))_border-box] rounded-[28px] border border-transparent animate-border flex overflow-hidden shadow-[0_24px_80px_rgba(37,99,235,0.12)]">
      {children}
    </div>
  );
}
export default BorderAnimatedContainer;
