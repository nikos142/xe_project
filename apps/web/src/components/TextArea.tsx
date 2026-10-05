const TextArea = ({ ...props }) => {
  return (
    <textarea
      className="input"
      style={{ height: "60px", resize: "vertical" }}
      rows={3}
      {...props}
    ></textarea>
  );
};

export default TextArea;
