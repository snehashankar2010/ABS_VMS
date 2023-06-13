import { useState, useEffect } from "react";
import Dashboard from "../Dashboard/Dashboard";
import { useNavigate } from "react-router-dom";
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(
    localStorage.getItem("authenticated") === "true"
  );
  const users = [{ username: "", password: "" }];

  useEffect(() => {
    if (authenticated) {
      navigate("/dashboard");
    }
  }, [authenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const account = users.find((user) => user.username === username);
    if (account && account.password === password) {
      localStorage.setItem("authenticated", true);
      setAuthenticated(true);
    }
  };

  if (authenticated) {
    return <Dashboard />;
  }

  return (
      <div className="login-wrapper">
        <h1>Please Log In</h1>
        <form onSubmit={handleSubmit}>
        <label>
          <p>Username</p>
            <input type="text" name="Username" value={username} onChange={(e) => setUsername(e.target.value)}/>
          </label>
          <label>
            <p>Password</p>
            <input type="password" name="Password" onChange={(e) => setPassword(e.target.value)} />
          </label>
          <div>
            <input type="submit" value="Submit" />
          </div>
        </form>
    </div>
  );
};

export default Login;
