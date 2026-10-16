import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import FOEucharist from "./Pages/FOEucharist";
import Contact from "./Pages/Contact";
import Home from "./Pages/Home";
import PastoralVisitation from "./Pages/Pastoral Visitation";
import Ministries from "./Pages/Ministries";

function App() {
  return (
    <BrowserRouter>
      <div>
        <header>
          <pre>
          <h1>A PASTOR'S JOURNEY: 
              Faith, Vision and Service</h1>
          </pre>
          <h4>
            This is an unofficial website created solely to help inform and support the
            parish community about the pastor's journey, vision and goals for the parish.
            It is not an official website of the Parishes of St. Mary's in Winneconne &
            Omro, Wisconsin, USA or any affiliated organization. The information provided
            is for general informational purposes only and may not represent official
            statements, policies or decisions of the parish. Visitors are responsible for
            how they use and interpret the information contained on this website. For
            official information, please consult the parish's authorized communication
            channel.
          </h4>
        </header>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/FOEucharist">FOEucharist</Link>
          <Link to="/Pastoral Visitation">Pastoral Visitation</Link>
          <Link to="/Ministries">Ministries</Link>
          <Link to="/Contact">Contact Us</Link>
        </nav>
        <hr />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/FOEucharist" element={<FOEucharist />} />
          <Route path="/Pastoral Visitation" element={<PastoralVisitation />} />
          <Route path="/Ministries" element={<Ministries />} />
          <Route path="/Contact" element={<Contact />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
