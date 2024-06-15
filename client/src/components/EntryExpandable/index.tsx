import styled from "styled-components";
import { Entry, UpdateEntry } from "../../../../types";
import { useContext, useEffect, useState } from "react";
import ChevronUp from "../Icons/ChevronUp";
import { CebolaClient } from "../../CebolaClient";
import { MessageContext, UserContext } from "../../App";
import EditForm from "./EditForm";
import Fields from "./Fields";

interface Props {
  entry: Entry;
  onDelete: () => void;
  onSaveEdit: (editedData: Partial<UpdateEntry>) => void;
}

export default function EntryExpandable(props: Props) {
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
        if (entry && entry.iv && user.username && user.password) {
          const decrypted = await CebolaClient.decrypt(
            entry.password,
            entry.iv,
            `${user.username}+${user.password}`
          );
          setEntryInputsData({
            ...entryInputsData,
            ...entry,
            password: decrypted,
          });
          setDecryptedPassword(decrypted);
        }
      } catch {
        setMessage("Failed to decrypt.");
      }
    };

    handleAsyncDecrypt();
  }, [entry, user]);

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
      if (!entryInputsData.password || !entryInputsData.description) {
        setMessage("[description] and [password] fields are required.");
        return;
      }
      onSaveEdit(entryInputsData);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const id = e.target.id;
    const value = e.target.value;
    const inputsData = { ...entryInputsData } as Partial<UpdateEntry>;

    setEntryInputsData({ ...inputsData, [id]: value });
  }

  const upperBar = (
    <div className="date" onClick={() => setIsExpanded(!isExpanded)}>
      <small>
        {formattedDate.date}
        &nbsp;&nbsp;
        {formattedDate.time}
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
        {upperBar}

        {isEditing ? (
          <EditForm
            entry={entry}
            entryInputsData={entryInputsData}
            handleInputChange={handleInputChange}
            handleOnEditSave={handleOnEditSave}
            setIsEditing={setIsEditing}
            decryptedPassword={decryptedPassword}
          />
        ) : (
          <Fields
            decryptedPassword={decryptedPassword}
            entry={entry}
            entryInputsData={entryInputsData}
            handleInputChange={handleInputChange}
            handleOnEditSave={handleOnEditSave}
            isExpanded={isExpanded}
            setIsEditing={setIsEditing}
            handleDelete={handleDelete}
            setReveal={setReveal}
            reveal={reveal}
          />
        )}
      </div>
    </StyledEntry>
  );
}

const StyledEntry = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${(props) => props.theme.margin.default};
  margin-bottom: ${(props) => props.theme.margin.default};

  span {
    overflow-wrap: break-word;
  }

  .password-container {
    width: 100%;
    display: flex;
    justify-content: space-between;

    .password-actions {
      display: flex;
    }
  }

  .date {
    display: flex;
    width: 100%;
    justify-content: space-between;
    color: ${(props) => props.theme.color.label};
    text-shadow: ${(props) => props.theme.textShadow.subtle};
    align-items: center;
    cursor: pointer;
    font-size: 0.8em;
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
      text-shadow: ${(props) => props.theme.textShadow.subtle};
      max-width: 57%;
    }

    /* label {
      color: #8ca878;
      text-shadow: ${(props) => props.theme.textShadow.subtle};
      font-variant: all-petite-caps;
      font-size: 0.8em;
      margin-top: 5px;
    } */
  }

  #password {
    color: ${(props) => props.theme.color.bafgreen};
  }
`;
