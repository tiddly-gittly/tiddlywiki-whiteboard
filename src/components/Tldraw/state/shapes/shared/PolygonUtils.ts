import { intersectLineLine } from '@tldraw/intersect';
import Vec from '@tldraw/vec';

const PI2 = Math.PI * 2;

type Vert = number[];
type Edge = Vert[];
type Polygon = Vert[];

export const PolygonUtils = {
  inwardEdgeNormal(edge: Edge) {
    // Assuming that polygon vertices are in clockwise order
    const delta = Vec.sub(edge[1], edge[0]);
    const length_ = Vec.len2(delta);
    return [-delta[0] / length_, delta[1] / length_];
  },

  outwardEdgeNormal(edge: Edge) {
    return Vec.neg(PolygonUtils.inwardEdgeNormal(edge));
  },

  // If the slope of line v1,v2 greater than the slope of v1,p then p is on the left side of v1,v2 and the return value is > 0.
  // If p is colinear with v1,v2 then return 0, otherwise return a value < 0.

  leftSide: Vec.isLeft,

  isReflexVertex(polygon: Polygon, index: number) {
    const length_ = polygon.length;
    // Assuming that polygon vertices are in clockwise order
    const v0 = polygon[(index + length_ - 1) % length_];
    const v1 = polygon[index];
    const v2 = polygon[(index + 1) % length_];
    if (PolygonUtils.leftSide(v0, v2, v1) < 0) return true;
    return false;
  },

  getEdges(vertices: Vert[]) {
    return vertices.map((vert, index) => [vert, vertices[(index + 1) % vertices.length]]);
  },

  // based on http://local.wasp.uwa.edu.au/~pbourke/geometry/lineline2d/, A => "line a", B => "line b"
  edgesIntersection([A1, A2]: number[][], [B1, B2]: number[][]) {
    const den = (B2[1] - B1[1]) * (A2[0] - A1[0]) - (B2[0] - B1[0]) * (A2[1] - A1[1]);

    if (den == 0) return null; // lines are parallel or conincident

    const ua = ((B2[0] - B1[0]) * (A1[1] - B1[1]) - (B2[1] - B1[1]) * (A1[0] - B1[0])) / den;

    const ub = ((A2[0] - A1[0]) * (A1[1] - B1[1]) - (A2[1] - A1[1]) * (A1[0] - B1[0])) / den;

    if (ua < 0 || ub < 0 || ua > 1 || ub > 1) return null;

    return [A1[0] + ua * (A2[0] - A1[0]), A1[1] + ua * (A2[1] - A1[1])];
  },

  appendArc(polygon: number[][], center: number[], radius: number, startVertex: number[], endVertex: number[], isPaddingBoundary = false) {
    const vertices = [...polygon];
    let startAngle = Math.atan2(startVertex[1] - center[1], startVertex[0] - center[0]);
    let endAngle = Math.atan2(endVertex[1] - center[1], endVertex[0] - center[0]);
    if (startAngle < 0) startAngle += PI2;
    if (endAngle < 0) endAngle += PI2;
    const arcSegmentCount = 5; // An odd number so that one arc vertex will be eactly arcRadius from center.
    const angle = startAngle > endAngle ? startAngle - endAngle : startAngle + PI2 - endAngle;
    const angle5 = (isPaddingBoundary ? -angle : PI2 - angle) / arcSegmentCount;

    vertices.push(startVertex);
    for (let index = 1; index < arcSegmentCount; ++index) {
      const angle = startAngle + angle5 * index;
      vertices.push([center[0] + Math.cos(angle) * radius, center[1] + Math.sin(angle) * radius]);
    }
    vertices.push(endVertex);

    return vertices;
  },

  createOffsetEdge(edge: Edge, offset: number[]) {
    return edge.map((vert) => Vec.add(vert, offset));
  },

  getOffsetPolygon(polygon: Polygon, offset = 0) {
    const edges = PolygonUtils.getEdges(polygon);

    const offsetEdges = edges.map((edge) => PolygonUtils.createOffsetEdge(edge, Vec.mul(PolygonUtils.outwardEdgeNormal(edge), offset)));

    const vertices = [];

    for (let index = 0; index < offsetEdges.length; index++) {
      const thisEdge = offsetEdges[index];
      const previousEdge = offsetEdges[(index + offsetEdges.length - 1) % offsetEdges.length];
      const vertex = PolygonUtils.edgesIntersection(previousEdge, thisEdge);
      if (vertex == undefined) {
        PolygonUtils.appendArc(vertices, edges[index][0], offset, previousEdge[1], thisEdge[0], false);
      } else {
        vertices.push(vertex);
      }
    }

    // var marginPolygon = PolygonUtils.createPolygon(vertices)
    // marginPolygon.offsetEdges = offsetEdges
    return vertices;
  },

  createPaddingPolygon(polygon: number[][][], shapePadding = 0) {
    const offsetEdges = polygon.map((edge) => PolygonUtils.createOffsetEdge(edge, PolygonUtils.inwardEdgeNormal(edge)));

    const vertices = [];
    for (let index = 0; index < offsetEdges.length; index++) {
      const thisEdge = offsetEdges[index];
      const previousEdge = offsetEdges[(index + offsetEdges.length - 1) % offsetEdges.length];
      const vertex = PolygonUtils.edgesIntersection(previousEdge, thisEdge);
      if (vertex == undefined) {
        PolygonUtils.appendArc(vertices, polygon[index][0], shapePadding, previousEdge[1], thisEdge[0], true);
      } else {
        vertices.push(vertex);
      }
    }

    return vertices;
  },
};

export function getOffsetPolygon(points: number[][], offset: number) {
  if (points.length < 3) throw new Error('Polygon must have at least 3 points');
  const length_ = points.length;
  return points
    .map((point, index) => [point, points[(index + 1) % length_]])
    .map(([A, B]) => {
      const offsetVector = Vec.mul(Vec.per(Vec.uni(Vec.sub(B, A))), offset);
      return [Vec.add(A, offsetVector), Vec.add(B, offsetVector)];
    })
    .map((edge, index, edges) => {
      const intersection = intersectLineLine(edge, edges[(index + 1) % edges.length]);
      if (intersection === undefined) throw new Error('Expected an intersection');
      return intersection;
    });
}
