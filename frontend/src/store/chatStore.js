import { create } from "zustand";

const useChatStore = create((set) => ({
  message: "",
  messages: [],
  isAwaitingResponse: false,
  conversationId: "",
  showFiles: false,
  conversation: null,
  requests: new Map(),

  setMessage: (message) => set({ message }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages) => set({ messages }),
  setIsAwaiting: (state) => set({ isAwaitingResponse: state }),

  setConversationId: (conversationId) => set({ conversationId }),

  setConversation: (conversation) => set({ conversation }),

  clearMessage: () => set({ message: "" }),

  setShowFiles: (state) => set({ showFiles: state }),

  addActiveRequest: ({conversationId,requestId}) =>
    set((state) => ({
      requests: new Map(state.requests).set(conversationId, requestId),
    })),

  deleteRequest: (conversationId) =>
    set((state) => {
      const newMap = new Map(state.requests);
      newMap.delete(conversationId);
      return { requests: newMap };
    }),
}));

export default useChatStore;
