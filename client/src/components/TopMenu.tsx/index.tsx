import { CebolaClient } from "../../models/CebolaClient";
import { theme } from "../../theme";
import Button from "../Button";
import Download from "../Icons/Download";
import Plus from "../Icons/Plus";

interface Props {
  setOpenNewEntryModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function TopMenu(props: Props) {
  const { setOpenNewEntryModal } = props;

  return (
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
  );
}
