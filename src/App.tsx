import Globe from "./components/Globe";
import globeData from './assets/custom.geo.json'
import { Analytics } from '@vercel/analytics/react';

export default function App() {
   return (
      <>
         <Globe data={globeData}></Globe>
         <Analytics></Analytics>
      </>
      
   );
}