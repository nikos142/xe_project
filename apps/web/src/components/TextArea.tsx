const TextArea = ({ ...props }) => {
  return (
    <textarea
      className="input"
      style={{ height: "60px" }}
      rows={3}
      {...props}
    ></textarea>
  );
};

export default TextArea;
