import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { readApiResponse } from "./utils/api";

import FOEucharist from "./Pages/FOEucharist";
import Contact from "./Pages/Contact";
import Home from "./Pages/Home";
import PastoralVisitation from "./Pages/Pastoral Visitation";
import Ministries from "./Pages/Ministries";
import ResetPassword from "./Pages/ResetPassword";
import Account from "./Pages/Account";

function RequireSignIn() {
  const location = useLocation();
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session", {
          signal: controller.signal,
        });
        const result = await readApiResponse(response);
        setStatus(result.authenticated ? "authenticated" : "unauthenticated");
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
          setStatus("error");
        }
      }
    }

    checkSession();
    return () => controller.abort();
  }, []);

  if (status === "checking") {
    return <main role="status">Checking your sign-in…</main>;
  }

  if (status === "error") {
    return <main role="alert">Unable to verify your sign-in: {error}</main>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/account" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <div>
        <header>
        <section className="intro">
      <h1 className="main-title"> 
        <span>A PRIEST'S JOURNEY: </span>
        <br /> 
        Faith, Vision and Service</h1>
        </section>
          <p className="subtitle">
            An unofficial website for the Parishes of St. Mary's in Winneconne & Omro, Wisconsin, USA.
            This is an unofficial website created solely to help inform and support the
            parish community about the pastor's journey, vision and goals for the parish.
            It is not an official website of the Parishes of St. Mary's in Winneconne &
            Omro, Wisconsin, USA or any affiliated organization. The information provided
            is for general informational purposes only and may not represent official
            statements, policies or decisions of the parish. Visitors are responsible for
            how they use and interpret the information contained on this website. For
            official information, please consult the parish's authorized communication
            channel.
            </p>
        </header>

        <nav className="navbar">
          <Link to="/">Home</Link>
          <Link to="/FOEucharist">FOEucharist</Link>
          <Link to="/Pastoral Visitation">Pastoral Visitation</Link>
          <Link to="/Ministries">Ministries</Link>
          <Link to="/Contact">Contact Us</Link>
          <Link to="/account">Sign in</Link>
          <Link to="/reset-password">Reset Password</Link>
        </nav>
        <hr />

        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/account" element={<Account />} />
          <Route element={<RequireSignIn />}>
            <Route path="/" element={<Home />} />
            <Route path="/FOEucharist" element={<FOEucharist />} />
            <Route path="/Pastoral Visitation" element={<PastoralVisitation />} />
            <Route path="/Ministries" element={<Ministries />} />
            <Route path="/Contact" element={<Contact />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
