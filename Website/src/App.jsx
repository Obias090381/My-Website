import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import About from "./Pages/About";

function App() {
  return (
    <BrowserRouter>
      <h1>Friends of the Eucharist</h1>

      <nav>
        <Link to="/About">About Us</Link>
      </nav>

      <hr />

      <Routes>
        <Route path="/About" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
