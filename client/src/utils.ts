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
