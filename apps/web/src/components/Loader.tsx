const Loader = ({ height = "100vh" }: LoaderProps) => {
  return (
    <div
      className="centeredColumn"
      style={{ height, justifyContent: "center" }}
    >
      Loading...
    </div>
  );
};

export default Loader;

interface LoaderProps {
  height?: string;
}
