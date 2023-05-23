/* eslint-enable @typescript-eslint/no-unused-vars */
import { useRef, useState } from "react"
import * as d3 from "d3"
import { useEffect } from "react"
import { geoPath } from "d3"



export default function Globe({data}:any): React.JSX.Element{
    const [rotation, setRotation] = useState(0)
    const svgRef:any = useRef(null)
    const projection = d3.geoOrthographic()

    
    useEffect(()=>{
        const svg = d3.select(svgRef.current)
        //const width = 800, height = 400 
        const speed = 0.004

        
        setRotation(speed * performance.now())
        

        projection.rotate([rotation,0,0])
        const pathGenerator:any = geoPath().projection(projection)

        svg.selectAll("*.country")
            .data(data.features)
            .join("path")
            .attr("class", "country")
            .attr("d", feature => pathGenerator(feature))
        
        

    },[data, projection, rotation])

    return(
        <>
        <div className="h-full w-fit mx-auto">
        <svg width="900px" height="500px" className="m-10 border-2 border-black" ref={svgRef}></svg>
        </div>
        </>
    )
}
/* eslint-enable @typescript-eslint/no-unused-vars */