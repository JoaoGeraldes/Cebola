import { Endpoints, Entry, NewEntry, UpdateEntry } from "../../types";

export class CebolaClient {
  static endpoint = {
    base: "http://192.168.0.170:9000",
    "/entries": "/entries",
    "/entry": "/entry",
  };

  static async updateEntry(entryId: string, payload: Partial<UpdateEntry>) {
    const url = `${this.endpoint.base}${this.endpoint["/entry"]}`;

    try {
      const response = await fetch(url, {
        method: "PATCH",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: entryId,
          payload,
        }),
      });

      const json = await response.json();
      console.log("RESPOSNE,", json);
      return response;
    } catch {
      return null;
    }
  }

  static async deleteEntry(entryId: string): Promise<Entry | null> {
    const requestPayload: Endpoints["DELETE"]["entry"]["body"] = {
      id: entryId,
    };
    const url = `${this.endpoint.base}${this.endpoint["/entry"]}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      const json = await response.json();

      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  static async createEntry(payload: NewEntry) {
    const url = `${this.endpoint.base}${this.endpoint["/entry"]}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      return response;
    } catch {
      return null;
    }
  }

  static async getEntries(
    queryParams: Endpoints["GET"]["entries"]["params"]
  ): Promise<Entry[] | null> {
    let queryString = this.objectToQueryString(queryParams);
    const url = `${this.endpoint.base}${this.endpoint["/entries"]}${queryString}`;

    try {
      const response = await fetch(url);
      const json = await response.json();
      return json;
    } catch (e) {
      return null;
    }
  }

  private static objectToQueryString(object: Record<string, unknown>) {
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
}
