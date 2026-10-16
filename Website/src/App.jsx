import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import FOEucharist from "./Pages/FOEucharist";
import Contact from "./Pages/Contact";
import Home from "./Pages/Home";
import PastoralVisitation from "./Pages/Pastoral Visitation";
import Ministries from "./Pages/Ministries";

function App() {
  return (
    <BrowserRouter>
      <h1>ST. MARY'S CATHOLIC CHURCH
          Winneconne and Omro, Wisconsin, 
          USA      
      </h1>

      <h2>This is a website for St. Mary's Catholic Church in Winneconne and Omro, Wisconsin, USA. 
          It provides information about the church's services, ministries, and contact details.</h2>


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
    </BrowserRouter>
  );
}

export default App;
