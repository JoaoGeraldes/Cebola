import React, { Fragment, useEffect, useState } from "react";
import "./App.css";
import { Entry, NewEntry, User } from "../../types";
import EntryCard from "./components/Entry";
import EntryForm from "./components/EntryForm";
import styled, { ThemeProvider } from "styled-components";
import Button from "./components/Button";
import { theme } from "./theme";
import { CebolaClient } from "./CebolaClient";
import Plus from "./components/Icons/Plus";
import RightArrow from "./components/Icons/RightArrow";
import Login from "./components/Login";
import Download from "./components/Icons/Download";

function App() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [cursor, setCursor] = useState<string | null | "last">(null);
  const [openNewEntryModal, setOpenNewEntryModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

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
              const respo = await CebolaClient.login(inputData);

              if (respo?.token) {
                setIsAuthenticated(true);
                loadEntries(null);
                setUser(inputData);
              }
            }}
          />
        </StyledModal>
      </ThemeProvider>
    );
  }

  console.log("user", user);

  return (
    <ThemeProvider theme={theme}>
      {!user && (
        <h1>
          User is not set. Even though you are logged in, you can't add entries.
          Fix me! -{" "}
          <button onClick={() => setIsAuthenticated(false)}>Logout</button>
        </h1>
      )}
      <StyledApp className="App">
        {isAuthenticated && (
          <div className="top-menu">
            <Button onClick={() => CebolaClient.getBackup()}>
              <Download fill={theme.color.yellow} />
              &nbsp;Download
            </Button>

            <Button onClick={() => setOpenNewEntryModal(true)}>
              <Plus fill={theme.color.yellow} />
              &nbsp;New entry
            </Button>
          </div>
        )}

        {hasEntries &&
          entries.map((entry) => (
            <Fragment key={entry.id}>
              <EntryCard
                user={user}
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
              if (!user) return;

              const cipher = await CebolaClient.encrypt(
                formData.password,
                `${user?.username}${user?.password}`
              );

              const updatedFormData: NewEntry = {
                ...formData,
                password: cipher.cipherText,
                iv: cipher.ivText,
              };

              await CebolaClient.createEntry(updatedFormData);
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
  .top-menu {
    display: flex;
    justify-content: space-between;
    margin: ${(props) => props.theme.margin.default} 0;
    z-index: 10;
  }
`;
