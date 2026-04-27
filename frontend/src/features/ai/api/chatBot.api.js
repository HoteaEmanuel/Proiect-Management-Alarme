import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios.js";
import { useAuthStore } from "../../../store/authStore.js";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
const VITE_URL_APP = import.meta.env.VITE_API_URL;
export const useCreateChat = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message) => {
      const response = await api.post(`${VITE_URL_APP}/api/chatbot`, {
        new_chat: true,
        user_id: user.user_id,
        conversation_id: undefined,
        message,
      });
      return response.data;
    },
    mutationKey: ["conversations"],
    onError: () => {
      toast.error("Could not send the message");
    },
    onSuccess: (response) => {
      toast.success("Yey");
      queryClient.invalidateQueries({
        queryKey: ["conversations", user.user_id],
      });
      if (response.conversation_id) {
        return navigate(`/chat/${response.conversation_id}`);
      }
    },
  });
};

export const useSendMessage = ({ id }) => {
  const { user } = useAuthStore();
  // const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ message }) => {
      console.log("MESS HERE: ", message);
      console.log(id);
      await api.post(`${VITE_URL_APP}/api/chatbot`, {
        user_id: user.user_id,
        conversation_id: id,
        message,
      });
    },
    mutationKey: ["conversation", id, user.user_id],
    onError: () => {
      toast.error("Could not send the message!");
    },
    // onSuccess: () => {
    //   queryClient.invalidateQueries({
    //     queryKey: ["conversation", user.user_id, id],
    //   });
    // },
  });
};
export const useGetUserChats = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryFn: async () => {
      const response = await api.get(`${VITE_URL_APP}/api/conversations`);
      console.log("API CHATS");
      console.log(response);
      return response.data.conversations;
    },
    queryKey: ["conversations", user.user_id],
  });
};

export const useGetConversation = (chatId) => {
  const { user } = useAuthStore();
  return useQuery({
    queryFn: async () => {
      const response = await api.get(
        `${VITE_URL_APP}/api/conversations/${chatId}`,
      );
      return response.data;
    },
    queryKey: ["conversation", user.user_id, chatId],
  });
};
