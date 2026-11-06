export const getServerUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_GAME_SERVER_URL;
  if (!url) throw new Error("NEXT_PUBLIC_GAME_SERVER_URL is not set.");
  return url.replace(/\/+$/, "");
};

export const getServerHost = (): string => new URL(getServerUrl()).host;

export const isServerSecure = (): boolean =>
  new URL(getServerUrl()).protocol === "https:";
