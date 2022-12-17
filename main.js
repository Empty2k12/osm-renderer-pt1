import REGL from "regl";
import { mat4 } from "gl-matrix";

import { LineRenderer, wayColor, wayWidth } from "./LineRenderer";

import json from "./aachen.json";

const SCALE_FACTOR = 200000;
const CENTER_LAT = 50.78153 * SCALE_FACTOR;
const CENTER_LON = 6.08226 * SCALE_FACTOR;

const ways = json.elements.filter(el => el.type === "way");
const nodes = json.elements.filter(el => el.type === "node");

const wayCoords = ways.filter(way => way.tags.highway !== undefined).map(way => ({
  ...way,
  node_locations: way.nodes.map(node_id => nodes.find(node => node.id === node_id)).map(node => [node.lon * SCALE_FACTOR, node.lat * SCALE_FACTOR])
}));

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const regl = REGL({
  canvas,
  attributes: {
    antialias: true
  },
  extensions: ["ANGLE_instanced_arrays"]
});

const projection = mat4.ortho(
  mat4.create(),
  0, canvas.width,
  0, canvas.height,
  1, -1
);

const view = mat4.lookAt(mat4.create(), [CENTER_LON - canvas.width/2, CENTER_LAT - canvas.height/2, 1], [CENTER_LON - canvas.width/2, CENTER_LAT - canvas.height/2, 0], [0,1,0]);

const renderWays = LineRenderer(regl);

regl.clear({
  color: [0, 0, 0, 0],
  depth: 1
})

wayCoords.forEach(way => {
    const buffer = regl.buffer(way.node_locations);
    buffer({
      data: way.node_locations
    });
    renderWays({
      points: buffer,
      projection,
      view,
      viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
      pointData: way.node_locations,
      color: wayColor(way),
      width: wayWidth(way),
      instances: way.node_locations.length - 1
    });
})