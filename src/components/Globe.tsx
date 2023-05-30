import React, { useRef, useState } from "react";
import * as d3 from "d3";
import { useEffect } from "react";
import { geoInterpolate, geoPath, path } from "d3";
import axios from "axios";

// ISS Coordinates API
const iss_api = axios.create({
  baseURL: "https://api.wheretheiss.at/v1/satellites/25544",
});

export default function Globe({ data }: any): React.JSX.Element {
  const [issCords, setIssCords] = useState<[number, number]>([0, 0]);
  const [alt, setAlt] = useState<number>(0);
  const [location, setLocation] = useState<string>("");
  const [copy, setCopy] = useState<string>("")
  const svgRef: any = useRef(null);
  const projection: any = d3.geoOrthographic();

  // Getting the ISS Coordinates
  function getIssData() {
    iss_api
      .get("/")
      .then((res) => {
        setIssCords([res.data["longitude"], res.data["latitude"]]);
        setAlt(Math.trunc(res.data["altitude"]));
        setCopy(`${res.data['latitude']}, ${res.data['longitude']}`)
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // GeoCoding API, get the ISS current location
  function getLocation(lat: number, long: number) {
    const API_ENDPOINT = `https://api.opencagedata.com/geocode/v1/json?key=${
      import.meta.env.VITE_OPEN_CAGE_API
    }&q=${lat}%2C${long}&pretty=1`;
    if (lat !== 0 && long && long !== 0) {
      const api = axios.get(API_ENDPOINT);
      api
        .then((res) => {
          if (res.data.results[0].components["_type"] === "body_of_water") {
            setLocation(res.data.results[0].components["body_of_water"]);
          } else{
              if (res.data.results[0].components.state){
                setLocation(`${res.data.results[0].components.state}, ${res.data.results[0].components.country}`);
              }
              else setLocation(res.data.results[0].components.country)
            }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  getIssData();
  getLocation(issCords[1], issCords[0]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Background circle for earth
    const globe = svg
      .append("circle")
      .attr("fill", "#DDDDDD")
      .attr("stroke", "black")
      .attr("stroke-width", "1px")
      .attr("cx", 350)
      .attr("cy", 330)
      .attr("r", 300);

    // Draw the red dot(ISS current position) on the map
    function updatePP() {
      const [x, y]: any = projection(issCords);
      const circleGenerator = d3.geoCircle().center(issCords).radius(3);

      const iss = svg
        .append("circle")
        .attr("id", "red-dot")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 4)
        .attr("fill", "red");
    }
    svg.select("#red-dot").remove()
    d3.timer(updatePP);

    // Put red dot in the center of the map
    const center = [issCords[0] * -1, issCords[1] * -1];

    projection.translate([350, 330]);
    projection.scale(300);

    // Rotate earth around that red dot
    projection.rotate(center);

    const pathGenerator: any = geoPath(projection);
    svg.selectAll("path").attr("d", pathGenerator);

    // Drawing the globe
    svg
      //.attr("class", "countries")
      .selectAll("path")
      //.style("","")
      .data(data.features)
      .enter()
      .append("path")
      //.attr("id", d => d.properties.name)
      .attr("d", pathGenerator)
      .style("fill", "white")
      .style("stroke", "black")
      .style("stroke-width", 0.5)
      .style("opacity", 0.6);

    // API calls every second
    const timer = setInterval(() => {
      getIssData();
      getLocation(issCords[1], issCords[0]);
    }, 1000);
    //console.log(location)
    return () => {
      clearInterval(timer);
    };
  }, [data, projection]);

  return (
    <>
      <h1 className="font-[Helvetica] text-lg -mb-10 select-none py-2 text-center ">ISS Tracker - By Abdelkhalek Boukli Hacene</h1>

      <div className="font-[Helvetica] grid grid-rows-2 grid-flow-col justify-items-center">
        <div className="w-full mt-4">
          <div className="py-8 -mb-2 mx-16 flex">
            <div className="h-2 w-2 mt-2 mr-2 my-auto rounded-full bg-red-600"></div>
            <h1 className="text-2xl">Current position of the ISS</h1>
          </div>

          <div className="flex-col mx-16 ">
            <div className="cursor-pointer group w-fit" onClick={()=> navigator.clipboard.writeText(copy)}>
              <div className="cursor-auto left-[340px] my-2 w-fit absolute flex select-none invisible group-hover:visible">
                  <div className="w-0 h-0 my-2 border-t-[5px] border-t-transparent border-r-[10px] border-r-black border-b-[5px] border-b-transparent "></div>
                  <h1 className="text-sm text-white bg-black w-fit py-1 px-2">Click to copy to clipboard</h1>
              </div>

              <h1 className="text-lg">Latitude : {issCords[1]}</h1>
              <h1 className="text-lg">Longitude : {issCords[0]}</h1>
            </div>

            <h1 className="mt-3 text-lg">{alt} Kilometers above : {location}</h1>
          </div>
        </div>

        <div className=" w-fit h-fit row-span-2 ">
          <svg width="700px" height="640px" className="" ref={svgRef}></svg>
        </div>
      </div>

      
    </>
  );
}