export default function Plus({ fill }: { fill?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      fill="none"
    >
      <g stroke={fill ? fill : "#000000"} strokeWidth="2">
        <path strokeLinecap="round" d="M12 16L12 8M16 12L8 12" />
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />
      </g>
    </svg>
  );
}
