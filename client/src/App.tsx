import React, { Fragment, useEffect, useState } from "react";
import "./App.css";
import { Entry } from "../../types";
import EntryCard from "./components/Entry";
import EntryForm from "./components/EntryForm";
import styled, { ThemeProvider } from "styled-components";
import Button from "./components/Button";
import { theme } from "./theme";
import { CebolaClient } from "./CebolaClient";
import Plus from "./components/Icons/Plus";
import RightArrow from "./components/Icons/RightArrow";
import Login from "./components/Login";

function App() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [cursor, setCursor] = useState<string | null | "last">(null);
  const [openNewEntryModal, setOpenNewEntryModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasEntries = entries && entries[0]?.id;

  // Token verification for authentication
  useEffect(() => {
    async function verificationResult() {
      const verificationResult = await CebolaClient.verifyToken({
        token: localStorage.getItem("jwt") || "",
      });

      if (verificationResult?.valid) {
        setIsAuthenticated(true);
      }
    }
    verificationResult();
  }, []);

  // Download entries
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

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <StyledModal>
          <Login
            onSubmit={async (inputData) => {
              const respo = await CebolaClient.login({
                username: inputData.username,
                password: inputData.password,
              });

              if (respo?.token) {
                setIsAuthenticated(true);
                loadEntries(null);
              }
            }}
          />
        </StyledModal>
      </ThemeProvider>
    );
  }

  /*   if (openNewEntryModal) {
    return (
      <ThemeProvider theme={theme}>
        <StyledModal>
          <EntryForm
            onSubmit={async (formData) => {
              await CebolaClient.createEntry(formData);
              loadEntries(null);
              setOpenNewEntryModal(false);
            }}
            onCancel={() => setOpenNewEntryModal(false)}
          />
        </StyledModal>
      </ThemeProvider>
    );
  } */

  return (
    <ThemeProvider theme={theme}>
      <StyledApp className="App">
        {isAuthenticated && (
          <div className="new-entry-section">
            <Button onClick={() => setOpenNewEntryModal(true)}>
              New entry &nbsp; <Plus fill={theme.color.yellow} />
            </Button>
          </div>
        )}

        {hasEntries &&
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
          <Button onClick={() => loadEntries(cursor)}>
            <RightArrow fill={theme.color.yellow} />
            &nbsp; Next
          </Button>
        )}
      </StyledApp>

      {openNewEntryModal && (
        <StyledModal>
          <EntryForm
            onSubmit={async (formData) => {
              await CebolaClient.createEntry(formData);
              loadEntries(null);
              setOpenNewEntryModal(false);
            }}
            onCancel={() => setOpenNewEntryModal(false)}
          />
        </StyledModal>
      )}
    </ThemeProvider>
  );
}

export default App;

const StyledModal = styled("div")`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  z-index: 100;
  position: absolute;
  padding: ${(props) => props.theme.padding.default};
  top: 0;
  background: ${(props) => props.theme.color.daGreen};
`;

const StyledApp = styled("div")`
  background: ${(props) => props.theme.bg};
  padding: ${(props) => props.theme.padding.default};
  .new-entry-section {
    display: flex;
    justify-content: flex-end;
    margin: ${(props) => props.theme.margin.default} 0;
    z-index: 10;
  }
`;
