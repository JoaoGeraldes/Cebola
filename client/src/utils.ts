export function objectToQueryString(object: Record<string, unknown>) {
  try {
    let queryString = "?";
    Object.keys(object).forEach((key) => {
      queryString = `${queryString}&${key}=${object[key] ? object[key] : ""}`;
    });
    return queryString;
  } catch (e) {
    return "?f";
  }
}

export async function copyToClipboard(
  text: string,
  onSuccess: () => void,
  onFailure: () => void
) {
  try {
    onSuccess();
  } catch {
    onFailure();
  }
}

export function secondsPassedSince(timestamp: number) {
  // Get the current time
  const now = Date.now();

  // Calculate the difference in milliseconds
  const elapsedMilliseconds = now - timestamp;

  // Convert milliseconds to seconds
  const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);

  return elapsedSeconds;
}

export function minutesPassedSince(seconds: number) {
  // Convert seconds to minutes
  const minutes = Math.floor(seconds / 60);

  return minutes;
}

export function getThemeFromLocalStorage() {
  const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;

  if (storedTheme) {
    return storedTheme;
  } else {
    return "light";
  }
}
