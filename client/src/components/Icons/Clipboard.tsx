export default function Clipboard({ fill }: { fill?: string }) {
  return (
    <svg
      fill={fill ? fill : "#000000"}
      width="24px"
      height="24px"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 12V2H4V0h12v12h-2zM0 4h12v12H0V4zm2 2v8h8V6H2z"
        fillRule="evenodd"
      />
    </svg>
  );
}
