export default function Pencil({ fill }: { fill?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill={fill ? fill : "#000000"}
      width="24px"
      height="24px"
      viewBox="0 0 32 32"
      version="1.1"
    >
      <path d="M0 32l12-4 20-20-8-8-20 20zM4 28l2.016-5.984 4 4zM8 20l12-12 4 4-12 12z" />
    </svg>
  );
}
