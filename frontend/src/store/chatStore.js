import { create } from "zustand";

const useChatStore = create((set) => ({
  message: "",
  messages: [],
  isAwaitingResponse:false,
  conversationId: "",
  showFiles:false,
  conversation:null,

  setMessage: (message) => set({ message }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages) => set({ messages }),
  setIsAwaiting:(state)=>set({isAwaitingResponse:state}),
  
  setConversationId: (conversationId) => set({ conversationId }),

  setConversation:(conversation)=>set({conversation}),

  clearMessage: () => set({ message: "" }),


  setShowFiles:(state)=>set({showFiles:state})
}));

export default useChatStore;
