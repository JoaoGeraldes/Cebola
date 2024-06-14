import React, { Fragment, createContext, useEffect, useState } from "react";
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
import Message from "./components/Message";

export const UserContext = createContext<User>({
  username: null,
  password: null,
});
export const MessageContext = createContext<{
  message: string | null;
  setMessage: React.Dispatch<React.SetStateAction<string | null>>;
}>({
  message: null,
  setMessage: () => null,
});

function App() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [cursor, setCursor] = useState<string | null | "last">(null);
  const [openNewEntryModal, setOpenNewEntryModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User>({
    username: null,
    password: null,
  });
  const [message, setMessage] = useState<string | null>(null);

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

  // First attempt to load entries
  useEffect(() => {
    loadEntries();
  }, []);

  // get stored user (session storage)
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const userObject: User = JSON.parse(storedUser);

      setUser({
        username: userObject.username,
        password: userObject.password,
      });
    }
  }, []);

  // Verify if authenticated but without local user
  useEffect(() => {
    if (isAuthenticated && !user.username && !user.password) {
      setMessage("You need to re-authenticate to decrypt the passwords.");
    }
  }, [isAuthenticated, user]);

  async function loadEntries(_cursor?: string | null) {
    const result = await CebolaClient.getEntries({
      cursor: _cursor as string,
      length: 3,
    });

    console.log("Starting on cursor: ", _cursor);

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

  return (
    <UserContext.Provider value={user}>
      <MessageContext.Provider value={{ message, setMessage }}>
        <ThemeProvider theme={theme}>
          <Message
            message={message}
            onDismiss={
              !user.username || !user.password
                ? () => setIsAuthenticated(false)
                : null
            }
          />

          {!user.username ||
            (!user.password && (
              <h1>
                User is not set. Even though you are logged in, you can't add
                entries. Fix me! -{" "}
                <button onClick={() => setIsAuthenticated(false)}>
                  Logout
                </button>
              </h1>
            ))}
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
                    entry={entry}
                    onDelete={async () => {
                      await handleEntryDelete(entry.id);
                      loadEntries(entry.nextEntryId);
                    }}
                    onSaveEdit={async (editedData) => {
                      if (!user.username || !user.password) return;
                      const data = editedData as Entry;

                      const encrypted = await CebolaClient.encrypt(
                        data.password,
                        `${user?.username}+${user?.password}`
                      );

                      const dataWithEncryptedPassword: NewEntry = {
                        ...entry,
                        ...data,
                        password: encrypted.cipherText,
                        iv: encrypted.ivText,
                      };

                      await CebolaClient.updateEntry(
                        entry.id,
                        dataWithEncryptedPassword
                      );

                      loadEntries(entries[0].id);
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

                  console.log("Will encrypt: ", formData.password);
                  const encrypted = await CebolaClient.encrypt(
                    formData.password,
                    `${user?.username}+${user?.password}`
                  );

                  const updatedFormData: NewEntry = {
                    ...formData,
                    password: encrypted.cipherText,
                    iv: encrypted.ivText,
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
      </MessageContext.Provider>
    </UserContext.Provider>
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
    z-index: 10;
  }
`;
