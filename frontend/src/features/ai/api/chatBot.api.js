import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { api } from "@lib/axios.js";
import useAuthStore from "@store/authStore.js";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import removeMarkdown from "remove-markdown";
const VITE_URL_APP = import.meta.env.VITE_API_URL;
export const useCreateConversation = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message) => {
      const formData = new FormData();
      formData.append("message", message.message);
      formData.append("new_chat", "true");

      message.files.forEach((file) => {
        formData.append("files", file);
      });

      message.file_preserve_flags.forEach((persist) => {
        formData.append("file_preserve_flags", String(persist === true));
      });

      formData.append("request_id", message?.request_id);
      const response = await api.post(`${VITE_URL_APP}/api/chatbot`, formData, {
        headers: {
          "Content-Type": "multipart/formdata",
        },
      });
      return response.data;
    },
    mutationKey: ["conversations"],
    onError: (error) => {
      if (error?.response?.status === 429) return;
      toast.error("Could not send the message");
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", user.user_id],
      });

      return response;
    },
  });
};

export const useSendMessage = ({ id }) => {
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async ({ message }) => {
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
  });
};
export const useGetUserConversations = () => {
  const { user } = useAuthStore();
  return useSuspenseQuery({
    queryFn: async () => {
      const response = await api.get(`${VITE_URL_APP}/api/conversations`);
      return response.data.conversations;
    },
    queryKey: ["conversations", user.user_id],
  });
};

export const useGetConversationBaseData = (chatId) => {
  return useQuery({
    queryFn: async () => {
      const response = await api.get(
        `${VITE_URL_APP}/api/conversations/${chatId}/info`,
      );
      return response.data;
    },
    enabled: !!chatId,
    queryKey: ["conversation", chatId],
  });
};

export const useGetConversation = (chatId) => {
  const { user } = useAuthStore();
  return useQuery({
    queryFn: async () => {
      const response = await api.get(
        `${VITE_URL_APP}/api/conversations/${chatId}`,
      );
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      await delay(1000);
      return response.data;
    },
    queryKey: ["conversation", user.user_id, chatId],
  });
};

export const useRenameConversation = (conversationId) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, new_title }) => {
      console.log("DATA HERE FOR RENAMING: ");
      console.log(conversationId, new_title);
      await api.patch(`${VITE_URL_APP}/api/conversations/${conversationId}`, {
        new_title: new_title,
      });
    },
    mutationKey: ["conversation", conversationId],
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", user.user_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.conversationId],
      });
    },
  });
};

export const useDeleteConversation = (conversationId) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversation_id = conversationId) => {
      await api.delete(`${VITE_URL_APP}/api/conversations/${conversation_id}`);
    },
    mutationKey: ["conversations", user.user_id],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", user.user_id],
      });
      // toast.success("Conversation was deleted");
      navigate("/chat/new");
    },
  });
};

export const useGetConversationFiles = (conversationId, options = {}) => {
  return useQuery({
    queryFn: async () => {
      try {
        const response = await api.get(
          `${VITE_URL_APP}/api/conversations/${conversationId}/files`,
        );

        return response.data;
      } catch (error) {
        toast.error(error?.message || "Could not get the attached files");
      }
    },
    queryKey: ["conversationFiles", conversationId],
    enabled: !!conversationId && (options.enabled ?? true),
  });
};

export const useGetLibraryFiles = (filters = {}) => {
  return useQuery({
    queryFn: async () => {
      const response = await api.get(`${VITE_URL_APP}/api/files`, {
        params: filters,
      });
      return response.data.files;
    },
    queryKey: ["libraryFiles", filters],
  });
};

export const useReadChatResponse = () => {
  return useMutation({
    mutationFn: async ({ text }) => {
      const cleanText = removeMarkdown(text);
      const response = await api.post(
        `${VITE_URL_APP}/audio/speak`,
        {
          text: cleanText,
        },
        {
          responseType: "arraybuffer",
        },
      );
      return response;
    },
    mutationKey: ["read-chat-response"],
  });
};

export const stopRequest = async (requestId) => {
  const response = await api.post(
    `${VITE_URL_APP}/api/chatbot/cancel/${requestId}`,
  );
  return response.data;
};
