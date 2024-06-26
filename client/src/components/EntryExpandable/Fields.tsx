import { useContext } from "react";
import { Entry, UpdateEntry } from "../../../../types";
import { CebolaClient } from "../../models/CebolaClient";
import { copyToClipboard } from "../../utils";
import Button from "../Button";
import Bin from "../Icons/Bin";
import Clipboard from "../Icons/Clipboard";
import Horus from "../Icons/Horus";
import Pencil from "../Icons/Pencil";
import Label from "../Label";
import { UserContext } from "../../contexts/UserContext";
import { MessageContext } from "../../contexts/MessageContext";
import { useTheme } from "styled-components";

interface Props {
  reveal: boolean;
  setReveal: React.Dispatch<React.SetStateAction<boolean>>;
  isExpanded: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDelete: () => void;
  entryInputsData: Partial<UpdateEntry> | null;
  entry: Entry;
  decryptedPassword: string | null;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  handleOnEditSave: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}

type ExpandedProps = Pick<
  Props,
  | "entry"
  | "reveal"
  | "setReveal"
  | "handleDelete"
  | "setIsEditing"
  | "decryptedPassword"
>;

type CollapsedProps = Pick<Props, "entry">;

export default function Fields(props: Props) {
  const {
    entry,
    reveal,
    isExpanded,
    decryptedPassword,
    setReveal,
    setIsEditing,
    handleDelete,
  } = props;

  

  return isExpanded ? (
    <Expanded
      entry={entry}
      reveal={reveal}
      decryptedPassword={decryptedPassword}
      setReveal={setReveal}
      handleDelete={handleDelete}
      setIsEditing={setIsEditing}
    />
  ) : (
    <Collapsed entry={entry} />
  );
}

const Expanded = (props: ExpandedProps) => {
  const {
    decryptedPassword,
    entry,
    reveal,
    setReveal,
    handleDelete,
    setIsEditing,
  } = props;
  const theme = useTheme();
  const user = useContext(UserContext);
  const { setMessage } = useContext(MessageContext);

  return (
    <>
      <Label htmlFor="description">description</Label>
      <span id="description">{entry.description}</span>

      <Label htmlFor="password">password</Label>
      <div className="password-container">
        <span id="password" style={{ filter: reveal ? "unset" : "blur(2px)" }}>
          {(reveal && decryptedPassword) || (
            <small>
              &#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;
            </small>
          )}
        </span>

        <div className="password-actions">
          <Button id="password-btn" onClick={() => setReveal(!reveal)}>
            <Horus fill={theme.color.b} />
          </Button>
          <Button
            onClick={async () => {
              copyToClipboard(
                entry.password,
                async () => {
                  const decrypted = await CebolaClient.decrypt(
                    entry.password,
                    entry.iv!,
                    `${user.username}+${user.password}`
                  );
                  navigator.clipboard.writeText(decrypted);
                  setMessage("Copied to clipboard!");
                },
                () => {
                  setMessage("Failed to copy to clipboard.");
                }
              );
            }}
          >
            <Clipboard fill={theme.color.b} />
          </Button>
        </div>
      </div>

      {entry?.domain && <Label htmlFor="domain">domain</Label>}
      <span id="domain">{entry.domain}</span>

      {entry?.username && <Label htmlFor="username">username</Label>}
      <span id="username">{entry.username}</span>

      <div className="actions">
        <Button onClick={handleDelete}>
          <Bin fill={theme.color.b} />
          &nbsp;Delete
        </Button>

        <Button onClick={() => setIsEditing(true)}>
          <Pencil fill={theme.color.b} />
          &nbsp; Edit
        </Button>
      </div>
    </>
  );
};

const Collapsed = (props: CollapsedProps) => {
  const { entry } = props;

  return (
    <>
      <Label htmlFor="description">description</Label>
      <span id="description">{entry.description}</span>
    </>
  );
};
