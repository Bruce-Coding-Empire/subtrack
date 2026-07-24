import { clearSession, getAccessToken, refreshAccessToken } from "@/lib/auth";
import type { ApiResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type ExportResource = "subscriptions" | "payment-history";
export type ExportFormat = "csv" | "pdf";

type DownloadResult = { success: true } | { success: false; error: string };

function filenameFromContentDisposition(header: string | null, fallback: string): string {
  const match = header?.match(/filename="([^"]+)"/);
  return match?.[1] ?? fallback;
}

async function fetchExport(resource: ExportResource, format: ExportFormat): Promise<Response> {
  const accessToken = getAccessToken();
  return fetch(`${API_BASE_URL}/export/${resource}?format=${format}`, {
    credentials: "include",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
}

export async function downloadExport(
  resource: ExportResource,
  format: ExportFormat,
): Promise<DownloadResult> {
  try {
    let res = await fetchExport(resource, format);

    if (res.status === 401) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        clearSession();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return { success: false, error: "Session expired — please log in again" };
      }
      res = await fetchExport(resource, format);
    }

    if (!res.ok) {
      const body = (await res.json()) as ApiResponse<unknown>;
      return { success: false, error: body.error ?? "Export failed — please try again" };
    }

    const blob = await res.blob();
    const filename = filenameFromContentDisposition(
      res.headers.get("Content-Disposition"),
      `${resource}-export.${format}`,
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("[downloadExport]", error);
    return { success: false, error: "Network error — please try again" };
  }
}
