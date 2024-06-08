import React, { Fragment, useEffect, useState } from "react";
import "./App.css";
import { Entry } from "../../types";
import EntryCard from "./components/Entry";
import EntryForm from "./components/EntryForm";
import styled, { ThemeProvider } from "styled-components";
import Button from "./components/Button";
import { theme } from "./theme";
import { CebolaClient } from "./CebolaClient";

function App() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [cursor, setCursor] = useState<string | null | "last">(null);

  const hasEntries = entries && entries[0]?.id;

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
        {/* <h1>Current cursor: {cursor}</h1> */}
        {entries &&
          entries.map((entry) => (
            <Fragment key={entry.id}>
              <EntryCard
                entry={entry}
                onDelete={async () => {
                  await handleEntryDelete(entry.id);
                  loadEntries(entry.nextEntryId);
                }}
                onSaveEdit={async (editedData) => {
                  await CebolaClient.updateEntry(entry.id, editedData);
                  loadEntries(cursor);
                }}
              />
            </Fragment>
          ))}

        {hasEntries && (
          <Button onClick={() => loadEntries(cursor)}>Load more</Button>
        )}

        <EntryForm
          onSubmit={async (formData) => {
            await CebolaClient.createEntry(formData);
            loadEntries(null);
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
