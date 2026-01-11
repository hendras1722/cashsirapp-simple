"use client";

import { useHttp } from "@/hooks/useHttp";

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export interface CreatePostBody {
  title: string;
  body: string;
  userId: number;
}

export interface UpdatePostBody {
  title: string;
  body: string;
  userId: number;
}

export interface PatchPostBody {
  title?: string;
  body?: string;
}

// ==================== CRUD HOOKS ====================

export function useGetPosts() {
  const url = `/api/v1/posts`;

  return useHttp<Post[]>(url, {
    method: "GET",
    showSuccessToast: false,
    showErrorToast: true,
  });
}

export function useCreatePost() {
  return useHttp<Post, CreatePostBody>("/v1/posts", {
    method: "POST",
  });
}

export function useUpdatePost(id: string) {
  return useHttp<Post, UpdatePostBody>(`/v1/posts/${id}`, {
    method: "PUT",
  });
}

export function usePatchPost(id: string) {
  return useHttp<Post, PatchPostBody>(`/v1/posts/${id}`, {
    method: "PATCH",
  });
}

export function useDeletePost(id: string) {
  return useHttp<{}, void>(`/v1/posts/${id}`, {
    method: "DELETE",
  });
}
