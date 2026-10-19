"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./api";
import type { CurrentUser } from "@/lib/api/types";

export const sessionKey = ["session"] as const;
export const sessionChannel = "fullstack-session";
function notifySessionChange() {
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(sessionChannel);
    channel.postMessage("changed");
    channel.close();
  }
}
export function useSession() {
  return useQuery({
    queryKey: sessionKey,
    queryFn: ({ signal }) => authApi.session(signal),
    staleTime: 30_000,
    retry: false,
  });
}

/** Purger les données privées lors d’un changement de compte et synchroniser les onglets. */
export function useAuthenticate(mode: "login" | "register") {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      username: string;
      password: string;
      telephone?: string;
    }) =>
      mode === "login"
        ? authApi.login(input)
        : authApi.register({ ...input, telephone: input.telephone || "" }),
    onSuccess: async (user: CurrentUser) => {
      await client.cancelQueries();
      client.removeQueries({
        predicate: (query) => query.queryKey[0] !== "session",
      });
      client.setQueryData(sessionKey, user);
      notifySessionChange();
    },
  });
}
export function useLogout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      await client.cancelQueries();
      client.removeQueries({
        predicate: (query) => query.queryKey[0] !== "session",
      });
      client.setQueryData(sessionKey, null);
      notifySessionChange();
    },
  });
}
export function useUpdateProfile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (user) => {
      client.setQueryData(sessionKey, user);
      notifySessionChange();
    },
  });
}
export function useUploadPhoto() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: authApi.uploadPhoto,
    onSuccess: (user) => {
      client.setQueryData(sessionKey, user);
      notifySessionChange();
    },
  });
}
