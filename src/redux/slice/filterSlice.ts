import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserType } from "./authSlice";

export interface Chat {
  chatId: string;
  isSeen: boolean;
  lastMessage: string;
  receiverId: string;
  user: UserType;
  updatedAt: number | any;
  typingBy?: string | null;
}

interface FilterState {
  chats: Chat[];
  originalChats: Chat[];
  users: UserType[];
  originalUsers: UserType[];
  loading: boolean;
}

const initialState: FilterState = {
  chats: [],
  originalChats: [],
  users: [],
  originalUsers: [],
  loading: false
};

export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setOriginalChats: (state, action: PayloadAction<Chat[]>) => {
      state.originalChats = action.payload;
      state.chats = action.payload;
    },
    setOriginalUsers: (state, action: PayloadAction<UserType[]>) => {
      state.originalUsers = action.payload;
      state.users = action.payload;
    },
    setFilteredChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
      state.loading = false;
    },
    setFilteredUsers: (state, action: PayloadAction<UserType[]>) => {
      state.users = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateChatUsers: (
      state,
      action: PayloadAction<Record<string, UserType>>
    ) => {
      const map = action.payload;
      const merge = (list: Chat[]) =>
        list.map((chat) =>
          map[chat.receiverId] ? { ...chat, user: map[chat.receiverId] } : chat
        );
      state.originalChats = merge(state.originalChats);
      state.chats = merge(state.chats);
    },
    updateChatTyping: (
      state,
      action: PayloadAction<Record<string, string | null>>
    ) => {
      const map = action.payload;
      const merge = (list: Chat[]) =>
        list.map((chat) =>
          map[chat.chatId] !== undefined
            ? { ...chat, typingBy: map[chat.chatId] }
            : chat
        );
      state.originalChats = merge(state.originalChats);
      state.chats = merge(state.chats);
    }
  }
});

export const {
  setOriginalChats,
  setOriginalUsers,
  setFilteredChats,
  setFilteredUsers,
  setLoading,
  updateChatUsers,
  updateChatTyping
} = filterSlice.actions;

export const filterData = (query: string) => (dispatch: any, getState: any) => {
  const { originalChats, originalUsers } = getState().filter;

  if (!query.trim()) {
    dispatch(setFilteredChats(originalChats));
    dispatch(setFilteredUsers(originalUsers));
    return;
  }

  dispatch(setLoading(true));

  setTimeout(() => {
    const filteredChats = originalChats.filter((chat: Chat) =>
      chat.user?.name?.toLowerCase().includes(query.toLowerCase())
    );

    const filteredUsers = originalUsers.filter((user: UserType) =>
      user.name.toLowerCase().includes(query.toLowerCase())
    );

    dispatch(setFilteredChats(filteredChats));
    dispatch(setFilteredUsers(filteredUsers));
  }, 200);
};

export default filterSlice.reducer;
