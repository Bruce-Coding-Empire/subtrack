import { apiFetch } from "@/lib/api-client";
import type { ApiResponse, GmailConnectionStatus } from "@/types";

export async function getGmailStatus(): Promise<ApiResponse<GmailConnectionStatus>> {
  return apiFetch<GmailConnectionStatus>("/integrations/gmail/status");
}

export async function getGmailConnectUrl(): Promise<ApiResponse<{ url: string }>> {
  return apiFetch<{ url: string }>("/integrations/gmail/connect");
}

export async function disconnectGmail(): Promise<ApiResponse<null>> {
  return apiFetch<null>("/integrations/gmail/disconnect", { method: "DELETE" });
}
