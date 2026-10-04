import * as routes from "../app/routes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((timer) => timer - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer === 0) navigate(routes.INDEX);
  }, [timer, navigate]);

  return (
    <div
      className="centeredColumn"
      style={{ height: "100vh", justifyContent: "center" }}
    >
      <h1>404!</h1>
      <p>
        The page you are looking for does not exist.
        <br />
        Redirecting in {timer} seconds.
      </p>
    </div>
  );
};

export default NotFound;
