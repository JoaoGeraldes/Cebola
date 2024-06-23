import { useTheme } from "styled-components";
import Button from "../Button";
import RightArrow from "../Icons/RightArrow";

interface Props {
  onClickNext: () => void;
}

export default function Pagination({ onClickNext }: Props) {
  const theme = useTheme();
  return (
    <Button onClick={onClickNext}>
      <RightArrow fill={theme.color.b} />
      &nbsp; Next
    </Button>
  );
}
