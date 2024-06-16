import { Fragment, useEffect, useState } from "react";
import { Entry, NewEntry, User } from "../../types";
import EntryCard from "./components/EntryExpandable";
import EntryForm from "./components/EntryForm";
import styled, { ThemeProvider } from "styled-components";
import Button from "./components/Button";
import { theme } from "./theme";
import { CebolaClient } from "./models/CebolaClient";
import RightArrow from "./components/Icons/RightArrow";
import Login from "./components/Login";
import Message from "./components/Message";
import Modal from "./components/Modal";
import TopMenu from "./components/TopMenu.tsx";
import { UserContext } from "./contexts/UserContext";
import { MessageContext } from "./contexts/MessageContext";

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
        <Modal>
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
        </Modal>
      </ThemeProvider>
    );
  }

  return (
    <UserContext.Provider value={user}>
      <MessageContext.Provider value={{ message, setMessage }}>
        <ThemeProvider theme={theme}>
          {/* ---------------------------  */}
          {/* -------- MESSENGER --------  */}
          {/* ---------------------------  */}
          {message && (
            <Message
              message={message}
              onDismiss={
                !user.username || !user.password
                  ? () => setIsAuthenticated(false)
                  : null
              }
            />
          )}

          <StyledApp className="App">
            {/* --------------------------  */}
            {/* -------- TOP MENU --------  */}
            {/* --------------------------  */}
            {isAuthenticated && (
              <TopMenu setOpenNewEntryModal={setOpenNewEntryModal} />
            )}

            {/* -------------------------  */}
            {/* -------- ENTRIES --------  */}
            {/* -------------------------  */}
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

                      const trimmmedPassword = data?.password?.trim();

                      const encrypted = await CebolaClient.encrypt(
                        trimmmedPassword,
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

            {/* ----------------------------  */}
            {/* -------- PAGINATION --------  */}
            {/* ----------------------------  */}
            {hasEntries && (
              <Button onClick={() => loadEntries(cursor)}>
                <RightArrow fill={theme.color.yellow} />
                &nbsp; Next
              </Button>
            )}
          </StyledApp>

          {/* -----------------------  */}
          {/* -------- MODAL --------  */}
          {/* -----------------------  */}
          {openNewEntryModal && (
            <Modal>
              <img className="cebola-guy" src="cebola_logo.png" alt="" />
              <EntryForm
                onSubmit={async (formData) => {
                  if (!user) return;

                  const trimmmedPassword = formData?.password?.trim();

                  const encrypted = await CebolaClient.encrypt(
                    trimmmedPassword,
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
            </Modal>
          )}
        </ThemeProvider>
      </MessageContext.Provider>
    </UserContext.Provider>
  );
}

export default App;

const StyledApp = styled("div")`
  background: ${(props) => props.theme.bg};
  padding: ${(props) => props.theme.padding.default};
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 700px;

  .top-menu {
    display: flex;
    justify-content: space-between;
    z-index: 10;
  }
`;
