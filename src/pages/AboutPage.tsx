import {
  MessageSquareText,
  ShieldCheck,
  Smartphone,
  UsersRound,
  Zap
} from "lucide-react";
import { BEEPME } from "@/assets/logo";

const features = [
  {
    icon: MessageSquareText,
    title: "Real-time messaging",
    desc: "Messages land the moment they're sent — no refresh required."
  },
  {
    icon: ShieldCheck,
    title: "Secure history",
    desc: "Your conversations live safely in a Firebase-backed cloud."
  },
  {
    icon: UsersRound,
    title: "Personal profiles",
    desc: "Avatars, bios and presence status for everyone in the hive."
  },
  {
    icon: Smartphone,
    title: "Every screen",
    desc: "A responsive shell that feels native from phone to desktop."
  },
  {
    icon: Zap,
    title: "Lightning fast",
    desc: "A lean, focused bundle that stays out of your way."
  }
];

export const AboutPage = () => {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-12">
        <img
          src={BEEPME}
          alt=""
          className="size-16 rounded-2xl object-contain ring-1 ring-border"
        />
        <p className="mt-6 text-[11px] font-semibold tracking-[0.22em] text-accent uppercase">
          About
        </p>
        <h1 className="mt-2 text-center font-display text-3xl font-medium tracking-tight">
          BeepME
        </h1>
        <p className="mt-4 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
          A real-time chat application built with React and Firebase. BeepME
          keeps conversations fast, private and beautifully simple — so you can
          focus on the people you&apos;re talking to, not the app in between.
        </p>

        <ul className="mt-10 grid w-full gap-3 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className="flex gap-3 rounded-2xl border border-border-soft bg-surface p-4"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
