import styled from "styled-components";
import { Entry } from "../../../../types";

interface Props {
  entry: Entry;
  onDelete: () => void;
}

export default function EntryCard(props: Props) {
  const { entry, onDelete } = props;

  function handleDelete() {
    onDelete();
  }

  return (
    <StyledEntryCard key={entry.id}>
      <h3>{entry?.id}</h3>
      <span>
        <b>domain: {entry.domain}</b>{" "}
      </span>
      <span>
        <b>username: {entry.username}</b>{" "}
      </span>
      <span>
        <b>password:{entry.password} </b>{" "}
      </span>
      <span>
        <b>description: {entry.description}</b>{" "}
      </span>
      <span>
        <b>date: </b>
        {entry.date}
      </span>
      <button onClick={handleDelete}>delete</button>
    </StyledEntryCard>
  );
}

const StyledEntryCard = styled("div")`
  display: flex;
  flex-direction: column;
`;
