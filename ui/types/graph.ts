import type { Edge, Node } from "vis-network";

export interface WeightedEdge extends Edge {
  value?: number;
}

export interface Graph {
  nodes: Node[];
  edges: WeightedEdge[];
  maxLevel: number;
}
