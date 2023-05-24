/* eslint-enable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from "react"
import * as d3 from "d3"
import { useEffect } from "react"
import { geoPath } from "d3"
// import ocean from "../assets/ne_110m_ocean.json"



export default function Globe({data}:any): React.JSX.Element{
    const [rotation, setRotation] = useState(0)
    const svgRef:any = useRef(null)
    const projection = d3.geoOrthographic()
    //const topology = ocean.json()
    //const [data, setData]:any = useState(null)
    //const speed = 0.006
    const sensitivity = 50

    useEffect(()=>{
        const svg = d3.select(svgRef.current).append("svg")
        //const width = 800, height = 400 
        
        

        const globe = svg.append("circle")
            .attr("fill", "#EEE")
            .attr("stroke", "#000")
            .attr("stroke-width", "1px")
            .attr("cx", 400)
            .attr("cy", 330)
            .attr('r',projection.scale())
        const map = svg.append("g")
        
            /*svg.append("path")
            .datum(graticule)
            .attr("class", "graticule")
            .attr("d", pathGenerator)*/

        
        //setRotation(speed * performance.now())
        //if(rotation === 360){setRotation(0)}
        projection.translate([400,330])
        projection.scale(300)
        //projection.rotate([rotation,0,0])
        let pathGenerator:any = geoPath(projection)
        svg.selectAll("path").attr("d", pathGenerator)
        const graticule = d3.geoGraticule10()

        
        map
            .attr("class", "countries")
            .selectAll("path")
            .style("","")
            .data(data.features)
            .enter().append("path")
            .attr("class", d => "country_" + d.properties.name.replace(" ","_"))
            .attr("d", pathGenerator)
            .style("fill", "white")
            .style('stroke', 'black')
            .style('stroke-width', 0.7)
            //.style("opacity",1)
            

            d3.timer(function(elapsed) {
                const rotate = projection.rotate()
                const k = sensitivity / projection.scale()
                projection.rotate([
                  rotate[0] - 1 * k,
                  rotate[1]
                ])
                pathGenerator = d3.geoPath(projection)
                svg.selectAll("path").attr("d", pathGenerator)
              },200)
            
            

        /*svg.selectAll("path") //path.featires
            .data(data.features)
            //.enter()
            .join("path")
            //.append("path")
            //.attr("class", "continent")
            .attr("d", feature => pathGenerator(feature))
            //.attr("d", pathGenerator)
            .attr("fill","#34A56F")
            //.style('outline', 'thin solid black')*/

        

    },[data, projection, rotation])

   
    return(
        <>
        <div className="h-full w-fit mx-auto">
        <svg width="800px" height="650px" className="border-2  border-black" ref={svgRef}></svg>
        </div>
        </>
    )
}
/* eslint-enable @typescript-eslint/no-unused-vars */