import styled from "styled-components";

export default function Label(
  props: React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  >
) {
  return <StyledLabel {...props} />;
}

const StyledLabel = styled.label`
  color: ${(props) => props.theme.color.dullGreen};
  text-align: left;
  margin-top: 10px;
  font-variant: small-caps;
`;
