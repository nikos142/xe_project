const InputContainer = ({ children, label, type }: InputContainerProps) => {
  return (
    <div className="inputContainer">
      <label htmlFor={type}>{label}</label>
      {children}
    </div>
  );
};

export default InputContainer;

interface InputContainerProps {
  children: React.ReactNode;
  label: string;
  type: string;
}
