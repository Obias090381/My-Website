import Footer from './Footer.jsx';

function App() {
  return (
    <>
      <h1>Friends of the Eucharist</h1>

      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="#About">About Us</Link></li>
          <li><Link to="#Contact">Contact</Link></li>
        </ul>
      </nav>

      <Footer />
    </>
  );
}

export default App
