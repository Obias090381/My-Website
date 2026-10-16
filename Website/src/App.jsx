import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import FOEucharist from "./Pages/FOEucharist";
import Contact from "./Pages/Contact";
import Home from "./Pages/Home";
import PastoralVisitation from "./Pages/Pastoral Visitation";

function App() {
  return (
    <BrowserRouter>
      <h1>Friends of the Eucharist</h1>

      <nav>
        <Link to="/">Home</Link>
        <Link to="/FOEucharist">FOEucharist</Link>
        <Link to="/Pastoral Visitation">Pastoral Visitation</Link>
        <Link to="/Contact">Contact Us</Link>
      </nav>
      <hr />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/FOEucharist" element={<FOEucharist />} />
        <Route path="/Pastoral Visitation" element={<PastoralVisitation />} />
        <Route path="/Contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
