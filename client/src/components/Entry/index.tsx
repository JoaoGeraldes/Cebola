import styled from "styled-components";
import { Entry } from "../../../../types";
import Button from "../Button";

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
    <StyledEntry key={entry.id}>
      <div className="card">
        <h3>{entry?.id}</h3>
        <label htmlFor="description">description</label>
        <span id="description">{entry.description}</span>

        <label htmlFor="password">password</label>
        <span id="password">{entry.password}</span>

        <label htmlFor="domain">domain</label>
        <span id="domain">{entry.domain}</span>

        <label htmlFor="username">username</label>
        <span id="username">{entry.username}</span>

        <small>{entry.date}</small>
        <Button onClick={handleDelete}>Delete</Button>
      </div>
    </StyledEntry>
  );
}

const StyledEntry = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid green;
  margin: ${(props) => props.theme.margin.default};

  .card {
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    
    span {
      color: white;
    }
  }
`;
