import { Entry, UpdateEntry } from "../../../../types";
import { theme } from "../../theme";
import Button from "../Button";
import Disk from "../Icons/Disk";
import Return from "../Icons/Return";
import Input from "../Input";
import Label from "../Label";

interface Props {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  entryInputsData: Partial<UpdateEntry> | null;
  entry: Entry;
  decryptedPassword: string | null;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  handleOnEditSave: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}

export default function EditForm(props: Props) {
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
      <Label htmlFor="description">description</Label>
      <Input
        required
        onChange={handleInputChange}
        id="description"
        type="text"
        value={entryInputsData?.description ?? entry.description}
      />

      <Label htmlFor="password">password</Label>
      <Input
        required
        onChange={handleInputChange}
        id="password"
        type="text"
        value={entryInputsData?.password ?? (decryptedPassword || "")}
      />

      <Label htmlFor="domain">domain</Label>
      <Input
        onChange={handleInputChange}
        id="domain"
        type="text"
        value={entryInputsData?.domain ?? entry.domain}
      />

      <Label htmlFor="username">username</Label>
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
}
