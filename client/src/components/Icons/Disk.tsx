export default function Disk({ fill }: { fill?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      fill={fill ? fill : "#000000"}
      height="24px"
      width="24px"
      version="1.1"
      viewBox="0 0 24 24"
      enableBackground="new 0 0 24 24"
      xmlSpace="preserve"
    >
      <g id="save-filled">
        <path d="M19,0H1C0.448,0,0,0.448,0,1v22c0,0.552,0.448,1,1,1h22c0.552,0,1-0.448,1-1V5L19,0z M6,3c0-0.552,0.448-1,1-1h10   c0.552,0,1,0.448,1,1v6c0,0.552-0.448,1-1,1H7c-0.552,0-1-0.448-1-1V3z M20,22H4v-7c0-0.552,0.448-1,1-1h14c0.552,0,1,0.448,1,1V22   z" />
        <path d="M16,9h-4V3h4V9z" />
      </g>
    </svg>
  );
}
