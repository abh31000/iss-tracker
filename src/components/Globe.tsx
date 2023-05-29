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
  const [location, setLocation] = useState("");
  const svgRef: any = useRef(null);
  const projection: any = d3.geoOrthographic();

  // Getting the ISS Coordinates
  function getIssData() {
    iss_api
      .get("/")
      .then((res) => {
        setIssCords([res.data["longitude"], res.data["latitude"]]);
        setAlt(Math.trunc(res.data["altitude"]));
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
          } else setLocation(res.data.results[0].components.country);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Background circle for earth
    const globe = svg
      .append("circle")
      .attr("fill", "#DDDDDD")
      .attr("stroke", "black")
      .attr("stroke-width", "1px")
      .attr("cx", 400)
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

    projection.translate([400, 330]);
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
      <h1 className="absolute ml-[40vw] bg-white">
        Prototype (Project still unfinished)
      </h1>
      <div className="h-2 w-2 rounded-full bg-red-600  mt-6 absolute ml-10"></div>
      <h1 className="mx-14 absolute bg-white text-2xl mt-3 ">
        Current position of the ISS
      </h1>
      <h1 className="text-lg absolute bg-white mx-10 mt-12">
        Latitude : {issCords[0]}
      </h1>
      <h1 className=" text-lg absolute bg-white mx-10 mt-[70px]">
        Longitude : {issCords[1]}
      </h1>
      <h1 className="mx-10 absolute text-lg bg-white mt-[110px]">
        {alt} Kilometers above : {location}
      </h1>
      <div className="h-full pt-3 w-fit mx-auto">
        <svg width="800px" height="650px" className="" ref={svgRef}></svg>
      </div>
    </>
  );
}