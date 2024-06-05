import React, { Fragment, useEffect, useState } from "react";
import "./App.css";
import { Entry } from "../../types";
import EntryCard from "./components/Entry";

function App() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [cursor, setCursor] = useState<string | null | "last">(null);

  /*   useEffect(() => {
    if (!entries) return;

    if (cursor === "last") {
      return;
    }

    setCursor(entries[entries.length - 1].id);
  }, [entries]); */

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    const result = await CebolaClient.getEntries({ cursor: cursor, length: 5 });

    if (!result) return;

    setEntries(result);

    if (result && result.length > 0) {
      setCursor(result[result.length - 1].previousEntryId);
    }
  }

  async function handleEntryDelete(entryId: string) {
    try {
      console.log(entryId);
      await CebolaClient.deleteEntry(entryId);

      if (entryId === cursor) {
      }
    } catch {
      console.error("Failed to delete entry.");
    }
  }

  return (
    <div className="App">
      <button onClick={loadEntries}>load</button>
      <h1>Current cursor: {cursor}</h1>
      {entries &&
        entries.map((entry) => (
          <Fragment key={entry.id}>
            <EntryCard
              entry={entry}
              onDelete={() => handleEntryDelete(entry.id)}
            />
            <hr />
          </Fragment>
        ))}
    </div>
  );
}

export default App;

interface Endpoints {
  base: string;
  GET: {
    entries: {
      path: string;
      params: {
        cursor: string | null;
        length: number | null;
      };
    };
  };
  DELETE: {
    entry: {
      path: string;
      body: {
        id: string | null;
      };
    };
  };
  POST: {
    entry: {
      path: string;
      body: Pick<Entry, "username" | "description" | "domain" | "password">;
    };
  };
}
class CebolaClient {
  static endpoint = {
    base: "http://localhost:9000",
    "/entries": "/entries",
    "/entry": "/entry",
  };

  static async deleteEntry(entryId: string) {
    const requestPayload: Endpoints["DELETE"]["entry"]["body"] = {
      id: entryId,
    };
    const url = `${this.endpoint.base}${this.endpoint["/entry"]}`;

    try {
      console.log("requestPayload ", requestPayload);
      const response = await fetch(url, {
        method: "delete",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      console.log("response", response);
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
