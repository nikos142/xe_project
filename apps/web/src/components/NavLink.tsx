import { Link } from "react-router-dom";

const NavLink = ({ link, text }: NavLinkProps) => {
  return (
    <Link style={{ textDecoration: "none", color: "black" }} to={link}>
      {text}
    </Link>
  );
};

export default NavLink;

interface NavLinkProps {
  text: string;
  link: string;
}
