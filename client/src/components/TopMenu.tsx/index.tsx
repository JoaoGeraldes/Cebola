import { useTheme } from "styled-components";
import { CebolaClient } from "../../models/CebolaClient";
import Button from "../Button";
import Download from "../Icons/Download";
import Plus from "../Icons/Plus";

interface Props {
  setOpenNewEntryModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function TopMenu(props: Props) {
  const { setOpenNewEntryModal } = props;

  const theme = useTheme();

  return (
    <div className="top-menu">
      <Button onClick={() => CebolaClient.getBackup()}>
        <Download fill={theme.color.b} />
        &nbsp;Download
      </Button>

      <Button onClick={() => setOpenNewEntryModal(true)}>
        <Plus fill={theme.color.b} />
        &nbsp;New entry
      </Button>
    </div>
  );
}
