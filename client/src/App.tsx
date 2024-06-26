import { Fragment, useEffect, useState } from "react";
import { Entry, NewEntry, User } from "../../types";
import EntryCard from "./components/EntryExpandable";
import EntryForm from "./components/EntryForm";
import styled, { ThemeProvider } from "styled-components";
import { CebolaClient } from "./models/CebolaClient";
import Login from "./components/Login";
import Message from "./components/Message";
import Modal from "./components/Modal";
import TopMenu from "./components/TopMenu.tsx";
import { UserContext } from "./contexts/UserContext";
import { MessageContext } from "./contexts/MessageContext";
import { theme } from "./theme";
import Pagination from "./components/Pagination";
import ThemeToggle from "./components/ThemeToggle";
import { ThemeContext } from "./contexts/ThemeContext";
import { getThemeFromLocalStorage } from "./utils";

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
  const [currentTheme, setCurrentTheme] = useState<keyof typeof theme>(
    getThemeFromLocalStorage()
  );

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
      <ThemeProvider theme={theme[currentTheme]}>
        <Modal>
          <Login
            onSubmit={async (inputData) => {
              const response = await CebolaClient.login(inputData);

              if (response?.token) {
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
        <ThemeProvider theme={theme[currentTheme]}>
          <ThemeContext.Provider
            value={{ setTheme: setCurrentTheme, currentTheme: currentTheme }}
          >
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
              <section className="Background">
                {/* --------------------------  */}
                {/* -------- TOP MENU --------  */}
                {/* --------------------------  */}
                {isAuthenticated && (
                  <>
                    <ThemeToggle />
                    <TopMenu setOpenNewEntryModal={setOpenNewEntryModal} />
                  </>
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
                  <Pagination onClickNext={() => loadEntries(cursor)} />
                )}
              </section>
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
          </ThemeContext.Provider>
        </ThemeProvider>
      </MessageContext.Provider>
    </UserContext.Provider>
  );
}

export default App;

const StyledApp = styled("div")`
  background: ${(props) => props.theme.background.c};
  padding: ${(props) => props.theme.padding.default};
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;

  .top-menu {
    display: flex;
    justify-content: space-between;
    z-index: 10;
  }
`;
