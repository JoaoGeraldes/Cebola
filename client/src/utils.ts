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
