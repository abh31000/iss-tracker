import Globe from "./components/Globe";
import globeData from './assets/custom.geo.json'


export default function App() {
   return (
      <>
         <Globe data={globeData}></Globe>
      </>
      
   );
}