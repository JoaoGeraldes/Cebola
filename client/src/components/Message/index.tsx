import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { MessageContext } from "../../contexts/MessageContext";
import { minutesPassedSince, secondsPassedSince } from "../../utils";

interface Props {
  message?: string | null;
  onDismiss?: (() => void) | null;
}
export default function Message(props: Props) {
  const { message, onDismiss } = props;
  const [messageDate, setMessageDate] = useState("Just now");
  const { setMessage } = useContext(MessageContext);

  useEffect(() => {
    const now = Date.now();

    let interval = setInterval(() => {
      const secondsPassed = secondsPassedSince(now);
      const minutesPassed = minutesPassedSince(secondsPassed);

      if (secondsPassed < 10) {
        console.log("Just now");
        setMessageDate("Just now");
      }

      if (secondsPassed > 10 && secondsPassed < 60) {
        console.log(`${secondsPassed} seconds ago`);
        setMessageDate(`${secondsPassed} seconds ago`);
      }

      if (secondsPassed >= 60) {
        console.log(`${minutesPassed} minute(s) ago`);
        setMessageDate(`${minutesPassed} minutes ago`);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
        <b>{message}</b>
        <small>{messageDate}</small>
      </div>
    </MessageWrapper>
  );
}

const MessageWrapper = styled("div")`
  box-shadow: ${(props) => props.theme.boxShadow.subtle};
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  cursor: pointer;

  .message {
    background: ${(props) => props.theme.color.yellow};
    display: flex;
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
