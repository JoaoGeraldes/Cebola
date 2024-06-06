import React, { Fragment, useEffect, useState } from "react";
import "./App.css";
import { Entry, NewEntry } from "../../types";
import EntryCard from "./components/Entry";
import EntryForm from "./components/EntryForm";
import styled, { ThemeProvider } from "styled-components";
import Button from "./components/Button";
import { theme } from "./theme";

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

  async function loadEntries(_cursor?: string | null) {
    const result = await CebolaClient.getEntries({
      cursor: _cursor === null ? _cursor : cursor,
      length: 3,
    });

    if (!result) return;

    setEntries(result);

    if (result && result.length > 0) {
      setCursor(result[result.length - 1].previousEntryId);
    }
  }

  async function handleEntryDelete(entryId: string) {
    try {
      const deletedEntry = await CebolaClient.deleteEntry(entryId);

      if (deletedEntry) {
        loadEntries(deletedEntry.previousEntryId);
      }
    } catch {
      console.error("Failed to delete entry.");
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <StyledApp className="App">
        <h1>Current cursor: {cursor}</h1>
        {entries &&
          entries.map((entry) => (
            <Fragment key={entry.id}>
              <EntryCard
                entry={entry}
                onDelete={async () => {
                  await handleEntryDelete(entry.id);
                  /* const entries = await CebolaClient.getEntries({
                  cursor: cursor,
                  length: null,
                });
                if (entries) {
                  setEntries(entries);
                  setCursor(entries[entries?.length - 1].previousEntryId);
                } */
                  /*  loadEntries(entry.previousEntryId); */
                }}
              />
              <hr />
            </Fragment>
          ))}
        <EntryForm
          onSubmit={async (formData) => {
            await CebolaClient.createEntry(formData);
            loadEntries(null);
            /*   const entries = await CebolaClient.getEntries({
            cursor: cursor,
            length: null,
          });
          if (entries) {
            setEntries(entries);
            setCursor(entries[entries?.length - 1].previousEntryId);
          } */
          }}
        />
      </StyledApp>
    </ThemeProvider>
  );
}

export default App;

const StyledApp = styled("div")`
  background: ${(props) => props.theme.bg};
`;

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
      body: NewEntry;
    };
  };
}
class CebolaClient {
  static endpoint = {
    base: "http://localhost:9000",
    "/entries": "/entries",
    "/entry": "/entry",
  };

  static async deleteEntry(entryId: string): Promise<Entry | null> {
    const requestPayload: Endpoints["DELETE"]["entry"]["body"] = {
      id: entryId,
    };
    const url = `${this.endpoint.base}${this.endpoint["/entry"]}`;

    try {
      const response = await fetch(url, {
        method: "delete",
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
        method: "post",
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
