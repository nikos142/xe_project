const Error = ({ message, height = "100vh" }: ErrorProps) => {
  return (
    <div
      className="centeredColumn"
      style={{ height, justifyContent: "center" }}
    >
      <span className="errorBadge">X</span>
      <p style={{ color: "red" }}>{message}</p>
    </div>
  );
};

export default Error;

interface ErrorProps {
  message: string;
  height?: string;
}
