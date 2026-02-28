// types/index.ts — scaffold, populated by BE-02
// Core domain types for LifePath path visualization

export type Difficulty = 'Low' | 'Medium' | 'High';
export type PathId = 'fast' | 'deep' | 'explorer';
export type TimeframeOption = '1y' | '3y' | '5y';

// Stub interfaces — full definition in BE-02
export interface PathNode {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: Difficulty;
  isMergePoint: boolean;
  tips: string[];
  monthsFromNow: number;
}

export interface Path {
  id: PathId;
  name: string;
  color: string;
  nodes: PathNode[];
}

export interface MergePoint {
  id: string;
  title: string;
  connectedPaths: string[];
  message: string;
}

export interface PathMap {
  startNode: PathNode;
  goalNode: PathNode;
  paths: Path[];
  mergePoints: MergePoint[];
}
