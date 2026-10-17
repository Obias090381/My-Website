import blessedSacrament from "../assets/Blessed Sacrament.jpg";
import "./FOEucharist.css";

function FOEucharist() {
  return (
    <section id="FOEucharist">
        <h2>Friends of the Eucharist</h2>
        <p>This is the Friends of the Eucharist Page.</p>
      
        <div>
            <img 
            className="blessed-image"
            src={blessedSacrament} 
            alt="Blessed Sacrament" 
            />
        </div>
    
      <h2>
        To help our parish become a community that encounters Jesus in the
        Eucharist, grows through prayer and formation, celebrates Mass with
        greater faith and reverence, and carries Christ's love into daily life
        through service.
      </h2>

      <h2>
        Friends of the Eucharist exists to help people grow in love for Jesus
        Christ in the Blessed Sacrament through reverent participation in the
        Mass, regular Eucharistic adoration and Holy Hours, prayer, formation,
        and service to the parish. We welcome all who wish to deepen their faith
        and share the gifts of the Eucharist with the wider community.
      </h2>

      <ol>
        <li>
          Gather for prayer and adoration: Hold regular Holy Hours and spend time
          with Christ in the Eucharist.
        </li>
        <li>
          Grow in understanding: Offer talks, readings, and discussions on the
          Eucharist, the Mass, and Catholic prayer, with guidance from the
          pastor or a parish-approved speaker.
        </li>
        <li>
          Encourage reverent participation in the Mass: Help members deepen their
          preparation for Mass and give thanks after receiving Communion,
          witnessing to the central place of the Eucharist in parish life.
        </li>
        <li>
          Serve the parish in a Eucharistic spirit: Support adoration and
          Eucharistic celebrations, welcome participants, and assist with parish
          needs as requested by the pastor.
        </li>
        <li>
          Share Christ's love through service: Pray for and, where appropriate,
          support the sick, homebound, and others in need, coordinating with
          parish leadership.
        </li>
        <li>
          Build a welcoming community: Provide opportunities for fellowship and
          invite others to discover a deeper relationship with Christ through
          the Eucharist.
        </li>
      </ol>
    </section>
  );
}
export default FOEucharist;
