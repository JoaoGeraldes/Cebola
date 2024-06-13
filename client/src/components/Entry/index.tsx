import styled from "styled-components";
import { Entry, UpdateEntry } from "../../../../types";
import Button from "../Button";
import { useContext, useEffect, useState } from "react";
import Input from "../Input";
import ChevronUp from "../Icons/ChevronUp";
import Pencil from "../Icons/Pencil";
import { theme } from "../../theme";
import Bin from "../Icons/Bin";
import Disk from "../Icons/Disk";
import Return from "../Icons/Return";
import { CebolaClient } from "../../CebolaClient";
import { MessageContext, UserContext } from "../../App";
import Horus from "../Icons/Horus";
import Clipboard from "../Icons/Clipboard";

interface Props {
  entry: Entry;
  onDelete: () => void;
  onSaveEdit: (editedData: Partial<UpdateEntry>) => void;
}

export default function EntryCard(props: Props) {
  const { entry, onDelete, onSaveEdit } = props;
  const user = useContext(UserContext);
  const { setMessage } = useContext(MessageContext);

  const [entryInputsData, setEntryInputsData] =
    useState<Partial<UpdateEntry> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [reveal, setReveal] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);

  const [decryptedPassword, setDecryptedPassword] = useState<string | null>(
    null
  );

  const date = new Date(entry.date);

  const formattedDate = {
    time: date.toLocaleTimeString(),
    date: date.toLocaleDateString(),
  };

  useEffect(() => {
    setIsEditing(false);

    const handleAsyncDecrypt = async () => {
      try {
        if (entry.password && entry.iv && user.username && user.password) {
          const decrypted = await CebolaClient.decrypt(
            entry.password,
            entry.iv,
            `${user.username}+${user.password}`
          );

          setDecryptedPassword(decrypted);
        }
      } catch {
        setMessage("Failed to decrypt.");
      }
    };

    handleAsyncDecrypt();
  }, [entry.id, user.username, user.password]);

  function handleDelete() {
    onDelete();
  }

  function handleOnEditSave(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    if (e) {
      e.preventDefault();
    }

    if (entryInputsData) {
      onSaveEdit(entryInputsData);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const id = e.target.id;
    const value = e.target.value;
    const inputsData = { ...entryInputsData } as Partial<UpdateEntry>;
    setEntryInputsData({ ...inputsData, [id]: value });
  }

  async function copyToClipboard(text: string) {
    try {
      const decrypted = await CebolaClient.decrypt(
        entry.password,
        entry.iv!,
        `${user.username}+${user.password}`
      );

      navigator.clipboard.writeText(decrypted);
      setMessage("Copied to clipboard!");
    } catch {
      setMessage("Failed to copy to clipboard.");
    }
  }

  const DateSection = (
    <div className="date" onClick={() => setIsExpanded(!isExpanded)}>
      <small>
        {/*   {formattedDate.time}  */}
        {formattedDate.date}
      </small>
      <div
        style={{
          transform: !isExpanded ? "rotate(180deg)" : "",
        }}
      >
        <ChevronUp fill="white" />
      </div>
    </div>
  );

  return (
    <StyledEntry key={entry.id}>
      <div className="card">
        <small>
          {JSON.stringify({
            entry: entry.password,
            username: user.username,
            password: user.password,
          })}
        </small>
        {DateSection}

        {isEditing ? (
          <DisplayEditForm
            entry={entry}
            entryInputsData={entryInputsData}
            handleInputChange={handleInputChange}
            handleOnEditSave={handleOnEditSave}
            setIsEditing={setIsEditing}
            decryptedPassword={decryptedPassword}
          />
        ) : (
          <DisplayEntry
            decryptedPassword={decryptedPassword}
            entry={entry}
            entryInputsData={entryInputsData}
            handleInputChange={handleInputChange}
            handleOnEditSave={handleOnEditSave}
            isExpanded={isExpanded}
            setIsEditing={setIsEditing}
            copyToClipboard={copyToClipboard}
            handleDelete={handleDelete}
            setReveal={setReveal}
            reveal={reveal}
          />
        )}
      </div>
    </StyledEntry>
  );
}

const DisplayEditForm = (props: {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  entryInputsData: Partial<UpdateEntry> | null;
  entry: Entry;
  decryptedPassword: string | null;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  handleOnEditSave: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}) => {
  const {
    entry,
    setIsEditing,
    entryInputsData,
    decryptedPassword,
    handleOnEditSave,
    handleInputChange,
  } = props;

  return (
    <form>
      <label htmlFor="description">description</label>
      <Input
        onChange={handleInputChange}
        id="description"
        type="text"
        value={entryInputsData?.description ?? entry.description}
      />

      <label htmlFor="password">password</label>
      <Input
        onChange={handleInputChange}
        id="password"
        type="text"
        value={entryInputsData?.password ?? (decryptedPassword || "")}
      />

      <label htmlFor="domain">domain</label>
      <Input
        onChange={handleInputChange}
        id="domain"
        type="text"
        value={entryInputsData?.domain ?? entry.domain}
      />

      <label htmlFor="username">username</label>
      <Input
        onChange={handleInputChange}
        id="username"
        type="text"
        value={entryInputsData?.username ?? entry.username}
      />

      <div className="actions">
        <Button onClick={handleOnEditSave}>
          <Disk fill={theme.color.yellow} />
          &nbsp;Save
        </Button>
        <Button onClick={() => setIsEditing(false)}>
          <Return fill={theme.color.yellow} />
          &nbsp; Cancel
        </Button>
      </div>
    </form>
  );
};

const DisplayEntry = (props: {
  reveal: boolean;
  setReveal: React.Dispatch<React.SetStateAction<boolean>>;
  isExpanded: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDelete: () => void;
  copyToClipboard: (text: string) => Promise<void>;
  entryInputsData: Partial<UpdateEntry> | null;
  entry: Entry;
  decryptedPassword: string | null;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  handleOnEditSave: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}) => {
  const {
    entry,
    setIsEditing,
    decryptedPassword,
    copyToClipboard,
    handleDelete,
    setReveal,
    reveal,
    isExpanded,
  } = props;

  return isExpanded ? (
    <>
      <label htmlFor="description">description</label>
      <span id="description">{entry.description}</span>

      <label htmlFor="password">password</label>
      <div className="password-container">
        <span id="password" style={{ filter: reveal ? "unset" : "blur(3px)" }}>
          {(reveal && decryptedPassword) || entry.password}
        </span>

        <div className="password-actions">
          <Button id="password-btn" onClick={() => setReveal(!reveal)}>
            <Horus fill={theme.color.yellow} />
          </Button>
          <Button onClick={() => copyToClipboard(entry.password)}>
            <Clipboard fill={theme.color.yellow} />
          </Button>
        </div>
      </div>

      {entry?.domain && <label htmlFor="domain">domain</label>}
      <span id="domain">{entry.domain}</span>

      {entry?.username && <label htmlFor="username">username</label>}
      <span id="username">{entry.username}</span>

      <div className="actions">
        <Button onClick={handleDelete}>
          <Bin fill={theme.color.yellow} />
          &nbsp;Delete
        </Button>

        <Button onClick={() => setIsEditing(true)}>
          <Pencil fill={theme.color.yellow} />
          &nbsp; Edit
        </Button>
      </div>
    </>
  ) : (
    <>
      <label htmlFor="description">description</label>
      <span id="description">{entry.description}</span>
    </>
  );
};

const StyledEntry = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${(props) => props.theme.margin.default};
  margin-bottom: ${(props) => props.theme.margin.default};
  .password-container {
    width: 100%;
    display: flex;
    justify-content: space-between;

    .password-actions {
      display: flex;
    }
  }

  span {
    overflow-wrap: break-word;
  }

  #password {
    color: ${(props) => props.theme.color.bafgreen};
  }

  .date {
    display: flex;
    width: 100%;
    justify-content: space-between;
    color: #9a9e97;
    text-shadow: 1px 1px #25301e;
    align-items: center;
    cursor: pointer;
    padding: ${(props) => props.theme.padding.default};
  }

  .actions {
    margin-top: 1em;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }

  .card {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background: ${(props) => props.theme.color.darkerBg};
    padding: ${(props) => props.theme.padding.default};
    box-shadow: ${(props) => props.theme.boxShadow.subtle};
    position: relative;

    span {
      color: ${(props) => props.theme.color.fg};
      text-shadow: 1px 1px #000000;
      max-width: 57%;
    }

    label {
      color: #8ca878;
      text-shadow: 1px 1px #25301e;
      font-variant: all-petite-caps;
      font-size: 0.8em;
      margin-top: 5px;
      left: 0;
    }
  }
`;
