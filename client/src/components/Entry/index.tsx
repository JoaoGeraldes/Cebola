import styled from "styled-components";
import { Entry, UpdateEntry } from "../../../../types";
import Button from "../Button";
import { useEffect, useState } from "react";
import Input from "../Input";
import ChevronUp from "../Icons/ChevronUp";
import Pencil from "../Icons/Pencil";
import { theme } from "../../theme";
import Bin from "../Icons/Bin";
import Disk from "../Icons/Disk";
import Return from "../Icons/Return";

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

  const [isExpanded, setIsExpanded] = useState(false);

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

  const dateSection = (
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

  if (!isExpanded) {
    return (
      <StyledEntry key={entry.id}>
        <div className="card">
          {dateSection}
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
        </div>
      </StyledEntry>
    );
  }

  return (
    <StyledEntry key={entry.id}>
      <div className="card">
        {dateSection}
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

        {entry?.password && <label htmlFor="password">password</label>}
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

        {entry?.domain && <label htmlFor="domain">domain</label>}
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

        {entry?.username && <label htmlFor="username">username</label>}
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
            <Button onClick={() => setIsEditing(false)}>
              <Return fill={theme.color.yellow} />
              &nbsp; Cancel
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Pencil fill={theme.color.yellow} />
              &nbsp; Edit
            </Button>
          )}

          {isEditing ? (
            <Button onClick={handleOnEditSave}>
              <Disk fill={theme.color.yellow} />
              &nbsp;Save
            </Button>
          ) : (
            <Button onClick={handleDelete}>
              <Bin fill={theme.color.yellow} />
              &nbsp;Delete
            </Button>
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
  margin-top: ${(props) => props.theme.margin.default};
  margin-bottom: ${(props) => props.theme.margin.default};

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
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background: ${(props) => props.theme.color.darkerBg};
    padding: ${(props) => props.theme.padding.default};
    box-shadow: 1px 1px 0px 0px #37442e;
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
