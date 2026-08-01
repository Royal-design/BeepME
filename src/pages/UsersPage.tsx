import { MobileUsersPage } from "@/components/MobileUsersPage";
import { WelcomeMessage } from "@/components/WelcomeMessage";

export const UsersPage = () => {
  return (
    <>
      <section className="hidden h-full md:flex">
        <WelcomeMessage />
      </section>
      <div className="h-full md:hidden">
        <MobileUsersPage />
      </div>
    </>
  );
};
