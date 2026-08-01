import { motion } from "framer-motion";
import { BEEPME } from "@/assets/logo";

export const Loading = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-background">
      <motion.img
        src={BEEPME}
        alt="BeepME logo"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="size-16 rounded-2xl object-contain"
      />
      <div className="flex items-center gap-1.5" aria-hidden>
        <span className="typing-dot size-1.5 rounded-full bg-accent" />
        <span className="typing-dot size-1.5 rounded-full bg-accent" />
        <span className="typing-dot size-1.5 rounded-full bg-accent" />
      </div>
    </div>
  );
};
