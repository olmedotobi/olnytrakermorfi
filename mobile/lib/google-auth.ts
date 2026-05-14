import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const BASE = process.env.EXPO_PUBLIC_API_URL ?? "";

export function useGoogleAuth() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "onlytracker", path: "auth" });

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri,
    scopes: ["openid", "profile", "email"],
  });

  return { request, response, promptAsync, redirectUri };
}

export async function loginWithGoogleToken(accessToken: string) {
  const res = await fetch(`${BASE}/api/auth/mobile-google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
  });
  if (!res.ok) throw new Error("Error autenticando con Google");
  return res.json() as Promise<{ token: string; user: { id: string; name: string; email: string } }>;
}
