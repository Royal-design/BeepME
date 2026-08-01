import { useAppSelector } from "@/redux/store";
import { Avatar } from "./Avatar";
import { ProfileMenu } from "./ProfileMenu";
import { SearchBar } from "./SearchBar";
import { UserList } from "./UserList";

export const MobileUsersPage = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5">
          <Avatar src={user?.photo} name={user?.name} size="sm" />
          <p className="text-sm font-semibold">People</p>
        </div>
        <ProfileMenu align="end" />
      </header>

      <div className="px-4 pb-3">
        <SearchBar />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        <UserList />
      </div>
    </div>
  );
};
