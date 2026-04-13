import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      error: null,
      isLoading: false,

      setAuth: (user, token) => set({
        user,
        accessToken: token,
        isAuthenticated: true,
      }),
      setAccessToken:(token)=>{
        set({accessToken:token})
      },

      setLoading: (val) => set({ isLoading: val }),
      setError: (err) => set({ error: err }),

      clearAuth: () => set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        error: null,
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)