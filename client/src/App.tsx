import React, { useEffect, useState } from "react";
import "./App.css";
import { Entry } from "../../types";

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await CebolaClient.getEntries({ cursor: cursor, length: 5 });

    if (!result) return;

    setEntries(result);

    setCursor(result[result.length - 1].previousEntryId);
  }

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="cursor id" />
        <input type="number" placeholder="results per page" />
        <button>ok</button>
      </form>
      <h1>Current cursor: {cursor}</h1>
      {entries &&
        entries.map((entry) => (
          <div>
            <h3>{entry?.description}</h3> {entry?.date} <br />{" "}
            <b>id: {entry?.id}</b>
          </div>
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
}
class CebolaClient {
  /*  endpoints: { base: string; GET: { entries: string } }; */
  /* static endpoints: { base: string; GET: { entries: string } }; */

  static endpoints: Endpoints = {
    base: "http://localhost:9000",
    GET: {
      entries: {
        path: "/entries",
        params: {
          cursor: null,
          length: null,
        },
      },
    },
  };

  static async getEntries(
    queryParams: Endpoints["GET"]["entries"]["params"] = this.endpoints.GET
      .entries.params
  ): Promise<Entry[] | null> {
    const { base, GET } = this.endpoints;

    /*  Object.keys(this.endpoints.GET.entries.params).forEach((key) => {
      url += this.endpoints.GET.entries.params[key];
    }); */

    let queryString = this.objectToQueryString(queryParams);
    const url = `${base}${GET.entries.path}${queryString}`;

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
