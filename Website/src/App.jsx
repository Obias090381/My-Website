import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import FOEucharist from "./Pages/FOEucharist";
import Contact from "./Pages/Contact";
import Home from "./Pages/Home";

function App() {
  return (
    <BrowserRouter>
      <h1>Friends of the Eucharist</h1>

      <nav>
        <Link to="/">Home</Link>
        <Link to="/FOEucharist">FOEucharist</Link>
        <Link to="/Contact">Contact Us</Link>
      </nav>
      <hr />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/FOEucharist" element={<FOEucharist />} />
        <Route path="/Contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
