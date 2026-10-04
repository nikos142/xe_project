import { Link } from "react-router-dom";

const NavChoice = ({ link, text, description }: NavChoiceProps) => {
  return (
    <div className="navChoiceContainer">
      <Link to={link}>
        <button className="navChoiceButton">{text}</button>
      </Link>
      <p>{description}</p>
    </div>
  );
};

export default NavChoice;

interface NavChoiceProps {
  link: string;
  text: string;
  description: string;
}
