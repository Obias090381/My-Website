import blessedSacrament from "../assets/Blessed Sacrament.jpg";
import "./Home.css";

function Home() {
  return (
    <section id="Home">
        <h2>Welcome to Our Site</h2>
        <p>This is the Home page.</p>

        <div>
            <img src={blessedSacrament} alt="Blessed Sacrament" />
        </div>
    

    </section>
  );
}
export default Home;