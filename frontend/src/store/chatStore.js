import { create } from "zustand";

const useChatStore = create((set) => ({
  message: "",
  messages: [],
  isAwaitingResponse:false,
  conversationId: "",

  setMessage: (message) => set({ message }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages) => set({ messages }),
  setIsAwaiting:(state)=>set({isAwaitingResponse:state}),
  
  setConversationId: (conversationId) => set({ conversationId }),

  clearMessage: () => set({ message: "" }),
}));

export default useChatStore;
