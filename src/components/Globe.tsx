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
    //const [issData, setIssData] = useState<any>()
    const svgRef:any = useRef(null)
    const projection:any = d3.geoOrthographic()
    const sensitivity = 75
    //const issCord:any = [-14.599413, -28.673147]
    //const [issLat, setIssLat] = useState()
    //const [issLong, setIssLong] = useState()
    const [issCords, setIssCords] = useState<[number, number]>([0,0])

    function getIssData() {
        client.get("/")
            .then((res) => {
                //console.log(res.data['latitude'], res.data['longitude'])
                setIssCords([res.data['longitude'], res.data['latitude']])
                //setIssData(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
    }


    useEffect(()=>{
        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()

        const globe = svg.append("circle")
            .attr("fill", "#DDDDDD")
            .attr("stroke", "black")
            .attr("stroke-width", "1px")
            .attr("cx", 400)
            .attr("cy", 330)
            .attr('r',300)
        
            
        
        function updatePP(){
            //const rot = projection.rotate()
            const [x, y]:any = projection(issCords)


            //console.log(pathGenerator.bounds())
            const circleGenerator = d3.geoCircle()
                .center(issCords)
                .radius(3)
            
            const circle = circleGenerator()
            const draw_circle = pathGenerator(circle)
            
            

            
            // Hides Tracker if it's behind earth's horizon
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
        svg.select("#red-dot").remove()
        
        //const map = svg.append("g")

        const center = [issCords[0] * -1, issCords[1] * -1]

        projection.translate([400,330])
        projection.scale(300)
        projection.rotate(center)
        const pathGenerator:any = geoPath(projection)
        svg.selectAll("path").attr("d", pathGenerator)

        // Drawing the globe        
        svg
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
            
        //svg.selectAll("*").remove()


            /*d3.timer(function(elapsed) {
                const rotate = projection.rotate()
                const k = sensitivity / projection.scale()
                projection.rotate([
                  rotate[0] - 1 * k,
                  0,
                ])
                pathGenerator = d3.geoPath(projection)
                svg.selectAll("path").attr("d", pathGenerator)
              },200)*/
              
              const timer = setInterval(() => { getIssData()}, 1000)
              //console.log(issCords)
              return () => {
                clearInterval(timer)
            }

    },[data, projection, rotation])

   
    return(
        <>
        <h1 className="mx-10 text-2xl mt-3 absolute">Current position of the ISS</h1>
        <h1 className="absolute text-lg mx-10 mt-12">Latitude :  {issCords[0]}</h1>
        <h1 className="absolute text-lg mx-10 mt-[70px]">Longitude :  {issCords[1]}</h1>
        <div className="h-full w-fit mx-auto">
        <svg width="800px" height="650px" className="" ref={svgRef}></svg>
        </div>

        </>
    )
}
/* eslint-enable @typescript-eslint/no-unused-vars */