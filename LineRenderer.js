const wayQuadGeometry = [
  [0, -0.5],
  [1, -0.5],
  [1, 0.5],
  [0, -0.5],
  [1, 0.5],
  [0, 0.5]
];

export const LineRenderer = (regl) => regl({
  vert: `
    precision highp float;
    
    attribute vec2 position;
    attribute vec2 pointA, pointB;

    uniform float width;
    uniform mat4 projection;
    uniform mat4 view;

    void main() {
      vec2 xBasis = pointB - pointA;
      vec2 yBasis = normalize(vec2(-xBasis.y, xBasis.x));
      vec2 point = pointA + xBasis * position.x + yBasis * width * position.y;
      gl_Position = projection * view * vec4(point.xy, 0, 1);
    }`,

  frag: `
    precision highp float;
    uniform vec3 color;
    void main() {
      gl_FragColor = vec4(color.xyz, 1);
    }`,

  attributes: {
    position: {
      buffer: regl.buffer(wayQuadGeometry),
      divisor: 0
    },
    pointA: {
      buffer: regl.prop("points"),
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 0
    },
    pointB: {
      buffer: regl.prop("points"),
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 2
    }
  },

  uniforms: {
    width: regl.prop("width"),
    color: regl.prop("color"),
    projection: regl.prop("projection"),
    view: regl.prop("view")
  },

  cull: {
    enable: true,
    face: "back"
  },

  depth: {
    enable: false
  },

  count: wayQuadGeometry.length,
  instances: regl.prop("instances"),
  viewport: regl.prop("viewport")
});

export const wayWidth = (way) => {
  if(["primary"].includes(way.tags.highway)) {
      return 18;
  }

  if(["residential", "secondary", "tertiary", "secondary_link", "tertiary_link", "living_street", "primary_link"].includes(way.tags.highway)) {
      return 12;
  }

  if(["footway", "steps", "path", "track"].includes(way.tags.highway)) {
      return 2;
  }

  if(["service", "pedestrian", "unclassified", "cycleway"].includes(way.tags.highway)) {
      return 7;
  }

  return 7;
}

export const wayColor = (way) => {
  if(["primary", "primary_link"].includes(way.tags.highway)) {
      return [0.98823529, 0.83921569, 0.64313725];
  }

  if(["residential", "secondary", "secondary_link", "tertiary", "tertiary_link", "living_street", "unclassified", "pedestrian"].includes(way.tags.highway)) {
      return [0.9, 0.9, 0.9];
  }

  if(["footway", "steps", "cycleway", "path", "track"].includes(way.tags.highway)) {
      return [0.95294118, 0.60392157, 0.54117647];
  }

  if(way.tags.highway === "service") {
      return [0.85, 0.85, 0.85];
  }

  console.log("uncolored", way.tags);

  return [0, 0, 0];
}