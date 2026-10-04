const Input = ({ error, errorText, ...props }: InputProps) => {
  return (
    <>
      <input className="input" {...props} />
      {error && <span className="errorText">{errorText}</span>}
    </>
  );
};

export default Input;

interface InputProps extends React.ComponentProps<"input"> {
  error: boolean;
  errorText?: string;
}
