import React, { useEffect, useState } from "react";
import Highcharts from "highcharts/highmaps";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography } from "@mui/material";

const DistrictMap = ({ values = [], title = "Sri Lanka Districts Map", seriesName = "Value" }) => {
  const [mapData, setMapData] = useState(null);

  useEffect(() => {
    fetch("https://code.highcharts.com/mapdata/countries/lk/lk-all.topo.json")
      .then((res) => res.json())
      .then((topo) => {
        const objKey = Object.keys(topo.objects)[0];
        const geometries = topo.objects[objKey].geometries;

        // Fuzzy match district alt-names with dataset
        geometries.forEach((f) => {
          if (f.properties["alt-name"]) {
            const names = f.properties["alt-name"].split("|").map((n) => n.trim());
            // const { bestMatch } = stringSimilarity.findBestMatch(
            //   names.join(" "),
            //   values.map((r) => r[0])
            // );
            // f.properties.name = bestMatch.target;
          }
        });

        topo.objects[objKey].geometries = geometries;
        setMapData(topo);
      });
  }, [values]);

  const mapSeriesData = values.map(([district, value]) => ({ name: district, value }));

  const options = mapData
    ? {
        chart: { map: mapData },
        title: { text: title },
        colorAxis: {
          min: 0,
          stops: [
            [0, "#E0F7FA"],
            [0.5, "#26C6DA"],
            [1, "#006064"],
          ],
        },
        tooltip: { pointFormat: "{point.name}: <b>{point.value}</b>" },
        series: [
          {
            mapData,
            name: seriesName,
            data: mapSeriesData,
            joinBy: ["name", "name"],
            states: { hover: { color: "#FF7043" } },
            dataLabels: {
              enabled: true,
              format: "{point.name}",
              allowOverlap: true,
              style: { fontSize: "11px" },
            },
          },
        ],
      }
    : null;

  return (
    <Card sx={{ width: "100%", height: "700px", mt: 2 }}>
      <CardContent sx={{ height: "100%" }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <div style={{ height: "90%" }}>
          {options ? (
            <HighchartsReact
              constructorType="mapChart"
              highcharts={Highcharts}
              options={options}
              containerProps={{ style: { height: "100%" } }}
            />
          ) : (
            <Typography>Loading map…</Typography>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DistrictMap;
