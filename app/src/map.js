import React from "react";
import DeckGL from "deck.gl";
import GraphLayer from "./graph-layer/graph-layer.js";
import { ScatterplotLayer } from "@deck.gl/layers";

const Map = ({
  viewState,
  data,
  mode,
  setSourceIndex,
  setViewState,
  minutes,
  sourceIndex,
}) => (
  <div>
    <DeckGL
      viewState={viewState}
      pickingRadius={5}
      controller={true}
      onViewStateChange={({ viewState }) => {
        setViewState(viewState);
      }}
      style={{
        left: "280px",
        width: "calc(100vw - 280px)",
      }}
      layers={[
        new GraphLayer({
          data: data.filteredGraph,
          sourceIndex,
          onClick: ({ index }) => {
            setSourceIndex(index);
          },
          getNodePosition: (d) => [d.lon, d.lat],
          getNodeIndex: (d, { index }) => index,
          getEdgeSource: (d) => d.start,
          getEdgeTarget: (d) => d.end,
          // get polygon from here
          getEdgeValue: (d) => [d.times_by_hour[minutes] || 1e6, d.distance, 1],
          mode,
          transition: true,
          updateTriggers: {
            getEdgeValue: minutes,
          },
        }),
        new ScatterplotLayer({
          id: "scatterplot-layer",
          data: data.graph.nodes,
          pickable: true,
          // get polygon from here get polygon from here!
          onClick: ({ index }) => {
            setSourceIndex(index);
          },
          opacity: 0.01,
          stroked: false,
          filled: true,
          lineWidthMinPixels: 1,
          getPosition: (d) => [d.lon, d.lat],
          getRadius: (d) => 30,
          getFillColor: (d) => [255, 140, 0],
        }),
      ]}
    />
  </div>
);

export default Map;
