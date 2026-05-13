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
const VITE_URL_APP = import.meta.env.VITE_API_URL;
export const useCreateConversation = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message) => {
      console.log("MESSAGE TO SENT HERE");
      console.log(message);
      const formData = new FormData();
      formData.append("message", message.message);
      formData.append("new_chat", "true");

      message.files.forEach((file) => {
        formData.append("files", file);
      });

      message.file_preserve_flags.forEach((persist) => {
        formData.append("file_preserve_flags", String(persist === true));
      });

      console.log("FORM DATA NEW");
      console.log(...formData.entries());
      const response = await api.post(`${VITE_URL_APP}/api/chatbot`, formData, {
        headers: {
          "Content-Type": "multipart/formdata",
        },
      });
      return response.data;
    },
    mutationKey: ["conversations"],
    onError: () => {
      toast.error("Could not send the message");
    },
    onSuccess: (response) => {
      // toast.success("Yey");
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
export const useGetUserConversations = () => {
  const { user } = useAuthStore();
  return useSuspenseQuery({
    queryFn: async () => {
      const response = await api.get(`${VITE_URL_APP}/api/conversations`);
      console.log("API CHATS");
      console.log(response);
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      await delay(1000);
      return response.data.conversations;
    },
    queryKey: ["conversations", user.user_id],
  });
};

export const useGetConversationBaseData = (chatId) => {
  const { user } = useAuthStore();
  return useQuery({
    queryFn: async () => {
      const response = await api.get(
        `${VITE_URL_APP}/api/conversations/${chatId}/info`,
      );
      console.log("CADOUL PRIMIT");
      console.log(response.data);
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
  console.log("DELETING HERE");
  console.log(conversationId);
  return useMutation({
    mutationFn: async () => {
      console.log("CONV ID HEREE:");
      console.log(conversationId);
      await api.delete(`${VITE_URL_APP}/api/conversations/${conversationId}`);
    },
    mutationKey: ["conversations", user.user_id],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", user.user_id],
      });
      toast.success("Conversation was deleted");
      navigate("/chat/new");
    },
  });
};

export const useGetConversationFiles = (conversationId) => {
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
  });
};

// export const useReadResponse=()=>{
//   return useMutation({
//     mutationFn:async()=>{
//       const res = await fetch("https://api.elevenlabs.io/v1/text-to-speech/VOICE_ID", {
//   method: "POST",
//   headers: {
//     "xi-api-key": პროცეს.env.ELEVENLABS_API_KEY,
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({
//     text: "Hello, this sounds very human.",
//     model_id: "eleven_multilingual_v2",
//   }),
// });
//     }
//   })
// }
