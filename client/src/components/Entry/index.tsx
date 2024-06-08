import styled from "styled-components";
import { Entry, UpdateEntry } from "../../../../types";
import Button from "../Button";
import { useEffect, useState } from "react";
import Input from "../Input";

interface Props {
  entry: Entry;
  onDelete: () => void;
  onSaveEdit: (editedData: Partial<UpdateEntry>) => void;
}

export default function EntryCard(props: Props) {
  const { entry, onDelete, onSaveEdit } = props;
  const [entryInputsData, setEntryInputsData] = useState<Partial<UpdateEntry>>(
    {}
  );
  const [isEditing, setIsEditing] = useState(false);

  const [showPasswordMenu, setShowPasswordMenu] = useState(false);

  const [reveal, setReveal] = useState(false);

  const date = new Date(entry.date);

  const formattedDate = {
    time: date.toLocaleTimeString(),
    date: date.toLocaleDateString(),
  };

  useEffect(() => {
    setIsEditing(false);
  }, [entry]);

  function handleDelete() {
    onDelete();
  }

  function handleOnEditSave() {
    onSaveEdit(entryInputsData);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const id = e.target.id;
    const value = e.target.value;

    setEntryInputsData({ ...entryInputsData, [id]: value });
  }

  function copyToClipboard(text: string) {
    try {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard ✅");
    } catch {
      alert("Failed to copy to clipboard.");
    }
  }

  return (
    <StyledEntry key={entry.id}>
      <div className="card">
        <div className="date">
          <small>
            {/*   {formattedDate.time}  */}
            {formattedDate.date}
          </small>
        </div>
        <label htmlFor="description">description</label>
        {isEditing ? (
          <Input
            onChange={handleInputChange}
            id="description"
            type="text"
            value={entryInputsData.description ?? entry.description}
          />
        ) : (
          <span id="description">{entry.description}</span>
        )}

        <label htmlFor="password">password</label>
        {isEditing ? (
          <Input
            onChange={handleInputChange}
            id="password"
            type="text"
            value={entryInputsData.password ?? entry.password}
          />
        ) : (
          <span
            id="password"
            style={{ filter: reveal ? "unset" : "blur(3px)" }}
          >
            {entry.password}
          </span>
        )}

        <label htmlFor="domain">domain</label>
        {isEditing ? (
          <Input
            onChange={handleInputChange}
            id="domain"
            type="text"
            value={entryInputsData.domain ?? entry.domain}
          />
        ) : (
          <>
            <span id="domain">{entry.domain}</span>
            <div className="copyreveal">
              {showPasswordMenu ? (
                <>
                  <Button id="password" onClick={() => setReveal(!reveal)}>
                    🔑 Reveal
                  </Button>
                  <Button onClick={() => copyToClipboard(entry.password)}>
                    📋 Copy
                  </Button>
                </>
              ) : (
                <Button onClick={() => setShowPasswordMenu(!showPasswordMenu)}>
                  ...
                </Button>
              )}
            </div>
          </>
        )}

        <label htmlFor="username">username</label>
        {isEditing ? (
          <Input
            onChange={handleInputChange}
            id="username"
            type="text"
            value={entryInputsData.username ?? entry.username}
          />
        ) : (
          <span id="username">{entry.username}</span>
        )}

        <div className="actions">
          {isEditing ? (
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          )}

          {isEditing ? (
            <Button onClick={handleOnEditSave}>Save</Button>
          ) : (
            <Button onClick={handleDelete}>Delete</Button>
          )}
        </div>
      </div>
    </StyledEntry>
  );
}

const StyledEntry = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;

  margin: ${(props) => props.theme.margin.default};

  .date {
    display: flex;
    width: 100%;
    justify-content: flex-end;
  }

  .actions {
    margin-top: 1em;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }

  .copyreveal {
    background: linear-gradient(
      90deg,
      #485440d1,
      ${(props) => props.theme.color.darkerBg}
    );
    position: absolute;
    right: 0;
    top: 37%;
  }

  .card {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background: ${(props) => props.theme.color.darkerBg};
    padding: ${(props) => props.theme.padding.default};
    box-shadow: 1px 1px 0px 0px #3e4b35;
    position: relative;

    span {
      color: ${(props) => props.theme.color.fg};
      max-width: 57%;
    }

    label {
      color: #1e251a;
      font-size: 0.8em;
      font-style: italic;
      margin-top: 5px;
      left: 0;
    }
  }
`;
