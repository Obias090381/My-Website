export async function readApiResponse(response) {
  if (response.status === 405) {
    throw new Error(
      "The Vercel API route rejected this request (HTTP 405). Confirm the latest deployment includes the API functions."
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
      `The API returned a non-JSON response (HTTP ${response.status}). Check the Vercel function deployment and logs.`
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
