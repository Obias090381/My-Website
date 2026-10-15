import Header from './Header.jsx'
import Body from './Body.jsx'
import Footer from './Footer.jsx'
import About from './About.jsx'

function App() {
  return (
    <>
      <h1>Friends of the Eucharist</h1>
      <nav>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#About.jsx">About Us</a></li>
          <li><a href="#Contact">Contact</a></li>
        </ul>
      </nav>
      <hr />
      <Header />
      <Body />
      <Footer />
    </>
  );
}

export default App
