import { Endpoints, Entry, NewEntry, UpdateEntry } from "../../types";
import { CebolaCrypto } from "./CebolaCrypto";
import { objectToQueryString } from "./utils";
export class CebolaClient extends CebolaCrypto {
  static endpoint = {
    base: "http://192.168.0.170:9000",
    "/entries": "/entries",
    "/entry": "/entry",
    "/login": "/login",
    "/verify-token": "/verify-token",
    "/backup": "/backup",
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
    let queryString = objectToQueryString(queryParams);
    const url = `${this.endpoint.base}${this.endpoint["/entries"]}${queryString}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      const json = await response.json();
      return json;
    } catch (e) {
      return null;
    }
  }

  static async login(requestPayload: {
    username: string;
    password: string;
  }): Promise<{ token: string } | null> {
    const url = `${this.endpoint.base}${this.endpoint["/login"]}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(requestPayload),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await response.json();

      if (json) {
        localStorage.setItem("jwt", json.token);
        sessionStorage.setItem(
          "user",
          JSON.stringify({
            username: requestPayload.username,
            password: requestPayload.password,
          })
        );
      }
      return json;
    } catch (e) {
      return null;
    }
  }

  static async verifyToken(requestPayload: {
    token: string;
  }): Promise<{ valid: boolean } | null> {
    const url = `${this.endpoint.base}${this.endpoint["/verify-token"]}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(requestPayload),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      const json = await response.json();

      /*  if (json) {
        localStorage.setItem("jwt", json.token);
      } */
      return json;
    } catch (e) {
      return null;
    }
  }

  static async getBackup() {
    const url = `${this.endpoint.base}${this.endpoint["/backup"]}`;

    try {
      const response = await fetch(url, {
        headers: {
          mode: "cors",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          "Content-Type": "application/zip",
        },
      });

      const datetime = new Date();
      const date = datetime.toLocaleDateString().replaceAll("/", "-");
      const time = datetime.toLocaleTimeString().replaceAll(":", ".");
      const filename = `${date}_${time}_database.zip`;

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      return blob;
    } catch (e) {
      return null;
    }
  }
}
