import { MobileChatsPage } from "@/components/MobileChatsPage";
import { WelcomeMessage } from "@/components/WelcomeMessage";

export const ChatsPage = () => {
  return (
    <>
      <section className="hidden h-full md:flex">
        <WelcomeMessage />
      </section>
      <div className="h-full md:hidden">
        <MobileChatsPage />
      </div>
    </>
  );
};
