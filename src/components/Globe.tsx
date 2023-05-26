import React, { useRef, useState } from "react"
import * as d3 from "d3"
import { useEffect } from "react"
import { geoInterpolate, geoPath, path } from "d3"
import axios from "axios"

const client = axios.create({
    baseURL: "https://api.wheretheiss.at/v1/satellites/25544"
})


export default function Globe({data}:any): React.JSX.Element{
    const [rotation, setRotation] = useState(0)
    const svgRef:any = useRef(null)
    const projection:any = d3.geoOrthographic()
    const sensitivity = 75
    const issCord:any = [-14.599413, -28.673147]

    useEffect(()=>{
        const svg = d3.select(svgRef.current).append("svg")
        

        const globe = svg.append("circle")
            .attr("fill", "#DDDDDD")
            .attr("stroke", "black")
            .attr("stroke-width", "1px")
            .attr("cx", 400)
            .attr("cy", 330)
            .attr('r',300)
        
        
        function updatePP(){
            //const rot = projection.rotate()
            const [x, y]:any = projection(issCord)


            //console.log(pathGenerator.bounds())
            const circleGenerator = d3.geoCircle()
                .center(issCord)
                .radius(3)
            
            const circle = circleGenerator()
            const draw_circle = pathGenerator(circle)
            svg.select("#red-dot").remove()
            
            
            //console.log(draw_circle)
            //console.log(visible)
            if (draw_circle !== null){
            const iss = svg.append("circle")
                .attr('id', "red-dot")
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 3)
                .attr('fill', 'red')
            }
        }

        d3.timer(updatePP)

        
        const map = svg.append("g")

        projection.translate([400,330])
        projection.scale(300)
        let pathGenerator:any = geoPath(projection)
        svg.selectAll("path").attr("d", pathGenerator)

        // Drawing the globe        
        map
            //.attr("class", "countries")
            .selectAll("path")
            //.style("","")
            .data(data.features)
            .enter().append("path")
            //.attr("class", d => "country_" + d.properties.name.replace(" ","_"))
            .attr("d", pathGenerator)
            .style("fill", "white")
            .style('stroke', 'black')
            .style('stroke-width', 0.5)
            .style("opacity",0.6)
            

            d3.timer(function(elapsed) {
                const rotate = projection.rotate()
                const k = sensitivity / projection.scale()
                projection.rotate([
                  rotate[0] - 1 * k,
                  0,
                ])
                pathGenerator = d3.geoPath(projection)
                svg.selectAll("path").attr("d", pathGenerator)
              },200)
        

    },[data, projection, rotation])

   
    return(
        <>
        <div className="h-full w-fit mx-auto">
        <svg width="800px" height="650px" className="" ref={svgRef}></svg>
        </div>
        </>
    )
}
/* eslint-enable @typescript-eslint/no-unused-vars */