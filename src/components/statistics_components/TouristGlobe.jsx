import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import countries110m from "world-atlas/countries-110m.json";
import { Box, List, ListItemButton, ListItemText } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import {countriesData} from '../../assets/statMockData'

// Mapping for mismatched names
export const nameMapping = {
  "Antigua & Barbuda": "Antigua and Barbuda",
  "Bosnia & Herzegovina": "Bosnia and Herzegovina",
  "Brunei Darussalam": "Brunei",
  "Cote Divoire": "Ivory Coast",
  "Kosovar": "Kosovo",
  "Lao Peoples": "Laos",
  "Micronesia": "Federated States of Micronesia",
  "Palestinian Territories": "Palestine",
  "South Africa-Zuid Afrika": "South Africa",
  "TIMOR-LESTE": "Timor-Leste",
  "United States": "United States of America",
  "Russian Federation": "Russia",
  "Syrian Arab Republic": "Syria",
  "Republic Of Zimbabwe": "Zimbabwe",
  "Saint Kitts And Nevis": "Saint Kitts and Nevis",
  "Saint Lucia": "Saint Lucia",
  "Trinidad And Tobago": "Trinidad and Tobago",
  "Congo, Republic Of.": "Congo",
  "Czech Republic": "Czechia",
  "Ivory Coast": "Ivory Coast",
};

function Globe({ selectedCountry, onCountryClick }) {
  const ref = useRef();
  const projectionRef = useRef();
  const pathRef = useRef();
  const countriesRef = useRef();
  const [pinPosition, setPinPosition] = useState(null);
  const [offGlobe, setOffGlobe] = useState(false);

  // NEW: control popup timing
  const [showCard, setShowCard] = useState(false);

  // Use ref to hold the latest selectedCountry for D3 drag
  const selectedCountryRef = useRef(selectedCountry);
  useEffect(() => {
    selectedCountryRef.current = selectedCountry;
  }, [selectedCountry]);

  const updatePinPosition = () => {
    const countryName = selectedCountryRef.current;
    if (!countryName) return;

    const projection = projectionRef.current;
    const countries = countriesRef.current;
    const normalized = nameMapping[countryName] || countryName;
    const country = countries.find(d => d.properties.name === normalized);

    if (!country) {
      setOffGlobe(true);
      setPinPosition(null);
      return;
    }

    const centroid = d3.geoCentroid(country);
    const [x, y] = projection(centroid);

    // visibility check using angular distance
    const rotate = projection.rotate();
    const center = [-rotate[0], -rotate[1]];
    const dist = d3.geoDistance(center, centroid);

    if (dist > Math.PI / 2) {
      setOffGlobe(true);
      setPinPosition(null);
      return;
    }

    setOffGlobe(false);
    setPinPosition([x, y]);
  };

  useEffect(() => {
    const width = 600;
    const height = 600;

    const projection = d3.geoOrthographic()
      .scale(250)
      .translate([width / 2, height / 2]);
    projectionRef.current = projection;

    const path = d3.geoPath(projection);
    pathRef.current = path;

    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    // Sphere
    svg.append("path")
      .datum({ type: "Sphere" })
      .attr("d", path)
      .attr("fill", "#dbeafe")
      .attr("stroke", "#333");

    // Countries
    const countries = feature(countries110m, countries110m.objects.countries).features;
    countriesRef.current = countries;

    svg.append("g")
      .selectAll("path")
      .data(countries)
      .join("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", "#9ca3af")
      .attr("stroke", "#111");

    // Drag behavior
    const drag = d3.drag()
      .on("drag", (event) => {
        const rotate = projection.rotate();
        const k = 0.25;
        projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);

        svg.selectAll("path.country").attr("d", path);
        svg.select("path").attr("d", path);

        updatePinPosition();
      });

    svg.call(drag);

    // Click on globe
    svg.on("click", (event) => {
      const [mx, my] = d3.pointer(event);
      const clicked = countries.find(c => d3.geoContains(c, projection.invert([mx, my])));
      if (clicked) {
        const name = Object.keys(nameMapping).find(k => nameMapping[k] === clicked.properties.name) || clicked.properties.name;
        onCountryClick(name);
      }
    });
  }, []);

  // Update highlight when selectedCountry changes
  useEffect(() => {
    const svg = d3.select(ref.current);
    const path = pathRef.current;
    const countries = countriesRef.current;
    const normalized = selectedCountry
      ? (nameMapping[selectedCountry] || selectedCountry)
      : null;

    svg.selectAll("path.country")
      .attr("d", path)
      .attr("fill", d =>
        normalized && d.properties.name === normalized
          ? "#69261fff"
          : "#9ca3af"
      );
  }, [selectedCountry]);

  // Rotate globe when country selected
  useEffect(() => {
    if (!selectedCountry) return;

    const svg = d3.select(ref.current);
    const projection = projectionRef.current;
    const path = pathRef.current;
    const countries = countriesRef.current;

    const normalized = nameMapping[selectedCountry] || selectedCountry;
    const country = countries.find(d => d.properties.name === normalized);
    if (!country) {
      setOffGlobe(true);
      setPinPosition(null);
      return;
    }

    const centroid = d3.geoCentroid(country);

    // hide card while rotating
    setShowCard(false);

    d3.transition()
      .duration(1250)
      .tween("rotate", () => {
        const r = d3.interpolate(projection.rotate(), [-centroid[0], -centroid[1]]);
        return t => {
          projection.rotate(r(t));
          svg.selectAll("path.country")
            .attr("d", path)
            .attr("fill", d => d.properties.name === normalized ? "#69261fff" : "#9ca3af");
          svg.select("path").attr("d", path);

          updatePinPosition();
        };
      })
      .on("end", () => {
        setShowCard(true); // only show after rotation ends
      });
  }, [selectedCountry]);

  return (
    <Box sx={{ position: "relative" }}>
      <svg ref={ref}></svg>

      {/* Floating pinned card */}
      {showCard && selectedCountry && pinPosition && !offGlobe && (
        <Box
          sx={{
            position: "absolute",
            left: pinPosition[0] + 30,
            top: pinPosition[1] - 30,
            width: 180,
            p: 1.5,
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: "white",
            pointerEvents: "auto",
          }}
        >
          <IconButton
            size="small"
            onClick={() => onCountryClick(null)}
            sx={{ position: "absolute", top: 4, right: 4, padding: "2px" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Box sx={{ fontWeight: "bold", mt: 1 }}>{selectedCountry}</Box>
          <Box>
            {`Tourists: ${countriesData.find(([n]) => n === selectedCountry)?.[1] ?? "Unknown"}`}
          </Box>
        </Box>
      )}

      {showCard && selectedCountry && !pinPosition && offGlobe && (
        <Box
          sx={{
            position: "absolute",
            right: -220,
            top: 50,
            width: 200,
            p: 1.5,
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: "white",
            pointerEvents: "auto",
          }}
        >
          <IconButton
            size="small"
            onClick={() => onCountryClick(null)}
            sx={{ position: "absolute", top: 4, right: 4, padding: "2px" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Box sx={{ fontWeight: "bold", mt: 1 }}>{selectedCountry}</Box>
          <Box>
            {`Tourists: ${countriesData.find(([n]) => n === selectedCountry)?.[1] ?? "Unknown"}`}
          </Box>
        </Box>
      )}

      {/* Connector line */}
      {showCard && selectedCountry && pinPosition && !offGlobe && (
        <svg
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 600,
            height: 600,
            pointerEvents: "none",
          }}
        >
          <line
            x1={pinPosition[0]}
            y1={pinPosition[1]}
            x2={pinPosition[0] + 30}
            y2={pinPosition[1] - 30}
            stroke="#333"
            strokeWidth={2}
          />
        </svg>
      )}
    </Box>
  );
}


export default function TouristGlobe() {
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleCountryClick = (name) => setSelectedCountry(name);

  return (
    <Box sx={{ display: "flex", gap: 2, height: "100vh", p: 2 }}>
      {/* Left sidebar */}
      <Box sx={{ width: 250, overflowY: "auto", borderRight: "1px solid #ddd" }}>
        <List>
          {countriesData.map(([name, val]) => (
            <ListItemButton
              key={name}
              selected={name === selectedCountry}
              onClick={() => handleCountryClick(name)}
            >
              <ListItemText primary={name} secondary={`${val} tourists`} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Globe */}
      <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Globe selectedCountry={selectedCountry} onCountryClick={handleCountryClick} />
      </Box>
    </Box>
  );
}