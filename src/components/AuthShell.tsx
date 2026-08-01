import { MessageSquareText, ShieldCheck, Sparkles } from "lucide-react";
import { BEEPME } from "@/assets/logo";

const highlights = [
  { icon: MessageSquareText, text: "Real-time chats that arrive instantly" },
  { icon: ShieldCheck, text: "Private, secure conversation history" },
  { icon: Sparkles, text: "A calm, focused messaging experience" }
];

interface AuthShellProps {
  children: React.ReactNode;
}

export const AuthShell = ({ children }: AuthShellProps) => {
  return (
    <div className="flex min-h-dvh w-full bg-background text-foreground">
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden border-r border-border-soft bg-surface p-10 lg:flex">
        <div className="hex-wall absolute inset-0 opacity-60" aria-hidden />
        <div className="relative flex items-center gap-2.5">
          <img
            src={BEEPME}
            alt=""
            className="size-9 rounded-xl object-contain ring-1 ring-border"
          />
          <span className="font-display text-lg font-semibold tracking-tight">
            BeepME
          </span>
        </div>

        <div className="relative max-w-sm">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-accent uppercase">
            Messaging for the hive
          </p>
          <h2 className="mt-3 font-display text-3xl leading-tight font-medium tracking-tight">
            Conversations that feel fast, private and human.
          </h2>
        </div>

        <ul className="relative flex flex-col gap-3">
          {highlights.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 text-sm text-muted-foreground"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                <Icon size={16} strokeWidth={1.8} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
        {children}
      </main>
    </div>
  );
};
