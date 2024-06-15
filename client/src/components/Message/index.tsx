import { useContext, useEffect } from "react";
import styled from "styled-components";
import { MessageContext } from "../../App";

interface Props {
  message?: string | null;
  onDismiss?: (() => void) | null;
}
export default function Message(props: Props) {
  const { message, onDismiss } = props;

  const { setMessage } = useContext(MessageContext);

  if (!message) return null;

  return (
    <MessageWrapper>
      <div
        className="message"
        onClick={() => {
          if (onDismiss) {
            onDismiss();
          }

          setMessage(null);
        }}
      >
        <small>{message}</small>
        {/* <Button
          onClick={() => {
            if (onDismiss) {
              onDismiss();
            }

            setMessage(null);
          }}
        >
          ok
        </Button> */}
      </div>
    </MessageWrapper>
  );
}

const MessageWrapper = styled("div")`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  cursor: pointer;
  box-shadow: ${(props) => props.theme.boxShadow.subtle};

  .message {
    display: flex;
    background: #c3b44f;
    padding: 8px;
    width: 100%;
    text-align: center;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    animation: slideDown 0.2s;
    top: 0;
    position: fixed;
    z-index: 100;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0%);
    }
  }
`;