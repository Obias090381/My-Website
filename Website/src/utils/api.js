export function getApiBaseUrl() {
  const configuredApiUrl = import.meta.env.VITE_API_HOST?.trim();

  if (configuredApiUrl) {
    const apiUrl = /^https?:\/\//i.test(configuredApiUrl)
      ? configuredApiUrl
      : `https://${configuredApiUrl}`;
    return apiUrl.replace(/\/+$/, "");
  }

  if (import.meta.env.DEV) {
    return "";
  }

  throw new Error(
    "The API URL is not configured. Set VITE_API_HOST in Vercel to your Render API service URL, then redeploy."
  );
}

export async function readApiResponse(response) {
  if (response.status === 405) {
    throw new Error(
      "The API returned HTTP 405 (method not allowed). The request may be reaching Vercel instead of the Render API. Set VITE_API_HOST in Vercel to your Render API service URL, then redeploy."
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();

  if (!body.trim()) {
    throw new Error(
      `The API returned an empty response (HTTP ${response.status}). Check the API service and try again.`
    );
  }

  if (!contentType.includes("application/json")) {
    throw new Error(
      `The API returned a non-JSON response (HTTP ${response.status}). Check the Render API service and the VITE_API_HOST setting.`
    );
  }

  let result;
  try {
    result = JSON.parse(body);
  } catch {
    throw new Error(
      `The API returned invalid JSON (HTTP ${response.status}). Check the API service logs.`
    );
  }

  if (!response.ok) {
    throw new Error(
      typeof result?.message === "string"
        ? result.message
        : `The request could not be completed (HTTP ${response.status}).`
    );
  }

  return result;
}
