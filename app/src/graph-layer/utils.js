import GL from "@luma.gl/constants";
import { Texture2D } from "@luma.gl/core";
import {
  point,
  polygon,
  booleanPointInPolygon,
  wktToGeoJSON,
} from "@turf/turf";

const TEXTURE_WIDTH = 512;

const TEXTURE_FORMATS = {
  1: GL.R32F,
  2: GL.RG32F,
  3: GL.RGB32F,
  4: GL.RGBA32F,
};
const DATA_FORMATS = {
  1: GL.RED,
  2: GL.RG,
  3: GL.RGB,
  4: GL.RGBA,
};

function getNextPOT(x) {
  return Math.pow(2, Math.max(0, Math.ceil(Math.log2(x))));
}

export function getTexelCoord(index) {
  return {
    x: index % TEXTURE_WIDTH,
    y: Math.floor(index / TEXTURE_WIDTH),
  };
}

export function getTextureSize(nodeCount) {
  const width = TEXTURE_WIDTH;
  const height = getNextPOT(nodeCount / TEXTURE_WIDTH);
  return { width, height };
}

export function getFloatTexture(gl, size) {
  return new Texture2D(gl, {
    data: null,
    format: TEXTURE_FORMATS[size],
    type: GL.FLOAT,
    border: 0,
    mipmaps: false,
    parameters: {
      [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
      [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
    },
    dataFormat: DATA_FORMATS[size],
    width: 1,
    height: 1,
  });
}

export function walk(graph, startNode, maxDepth = 10, depth = 0) {
  if (startNode.visited || depth > maxDepth) {
    return;
  }
  startNode.visited = true;
  for (const edgeId in graph.edges) {
    const edge = graph.edges[edgeId];
    if (edge.hours[0] && edge.start_junction_id === startNode.id) {
      walk(graph, graph.nodesById[edge.end_junction_id], maxDepth, depth + 1);
    }
  }
}

export function filterGraph(graph) {
  const poly = polygon([
    [
      [-58.4699042, -34.6142805132],
      [-58.4022611572, -34.6142805132],
      [-58.4022611572, -34.574839915],
      [-58.4699042, -34.574839915],
      [-58.4699042, -34.6142805132],
    ],
  ]);
  const indexes = [];
  const filteredEdges = graph["edges"].filter((d) => {
    const start = graph["nodes"][d["start"]];
    const end = graph["nodes"][d["end"]];

    const start_p = point([start.lon, start.lat]);
    const end_p = point([end.lon, end.lat]);
    const is_within =
      booleanPointInPolygon(start_p, poly) &&
      booleanPointInPolygon(end_p, poly);
    /*
    if (is_within) {
      indexes.push(index);
      //graph["edges"]
    }
    */
    return is_within;
  });

  // console.log(indexes);
  return {
    nodes: graph["nodes"],
    edges: filteredEdges,
  };
}
