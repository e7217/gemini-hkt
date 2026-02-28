/**
 * TrackType represents the three predefined life path tracks.
 * Values match the path IDs used in the Gemini prompt schema.
 */
export enum TrackType {
  Fast = "fast",   // Fast Track: 빠른 성과, 4~5개 노드 (#F59E0B gold)
  Deep = "deep",   // Deep Dive: 깊이 있는 학습, 5~6개 노드 (#3B82F6 blue)
  Risk = "risk",   // Risk Path: 창의적 탐험/위험 고려, 4~5개 노드 (#8B5CF6 purple)
}

/**
 * PathNode represents a single step or milestone in a life/career path.
 * When isMergePoint is true, this node is accessible from multiple paths.
 */
export interface PathNode {
  id: string;
  title: string;
  description: string;
  duration: string;                        // e.g., "1-3개월"
  timeEstimate?: string;                   // e.g., "주 10시간"
  opportunityCost?: string;                // e.g., "여가 시간 포기"
  difficulty: "Low" | "Medium" | "High";
  isMergePoint: boolean;
  tips: string[];
  monthsFromNow: number;                   // used for timeline slider filtering
  subNodes?: PathNode[];                   // for node expansion (C9)
}

/**
 * Path represents a single track (Fast/Deep/Risk) with an ordered sequence of nodes.
 * id is string (not literal union) to support dynamically generated branch sub-paths.
 */
export interface Path {
  id: string;         // e.g., "fast", "deep", "risk", or dynamic branch IDs
  name: string;       // display name, e.g., "Fast Track"
  color: string;      // hex color, e.g., "#F59E0B"
  successProbability?: number; // e.g., 85 for 85%
  difficulty?: "Low" | "Medium" | "High";
  nodes: PathNode[];
}

/**
 * StartGoalNode is a simplified node for startNode and goalNode in PathMap.
 * It does not carry timeline or difficulty metadata.
 */
export interface StartGoalNode {
  id: string;
  title: string;
  description: string;
}

/**
 * MergePoint represents a convergence point where multiple paths meet.
 */
export interface MergePoint {
  id: string;
  title: string;
  connectedPaths: string[];   // path IDs that converge at this point
  message: string;            // motivational message displayed in UI
}

/**
 * PathMap is the top-level container for a complete Gemini AI path simulation response.
 */
export interface PathMap {
  startNode: StartGoalNode;
  goalNode: StartGoalNode;
  paths: Path[];
  mergePoints: MergePoint[];
}

/**
 * TimelineMetadata captures temporal information for a node.
 * Corresponds to B34 (타임라인 데이터 구조).
 */
export interface TimelineMetadata {
  duration: string;
  monthsFromNow: number;
  estimatedEndDate?: Date;
}

/**
 * AnonymousSession represents an anonymous user session.
 * Corresponds to B22 (익명 세션 관리).
 */
export interface AnonymousSession {
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
  pathHistory: string[];
}

/**
 * SimulateRequest — POST /api/paths/simulate request body
 */
export type SimulateRequest = {
  goal: string;
  timeframe?: "1y" | "3y" | "5y";
  isReverse?: boolean;
};

/**
 * SimulateResponse — POST /api/paths/simulate response body
 */
export type SimulateResponse = PathMap;

/**
 * BranchRequest — POST /api/paths/branch request body
 * Includes currentPathMap because the server is stateless.
 */
export type BranchRequest = {
  pathId: string;
  currentNodeId: string;
  choice?: string;
  currentPathMap: PathMap;
};

/**
 * BranchResponse — POST /api/paths/branch response body
 */
export type BranchResponse = {
  paths: Path[];
  mergePoints?: MergePoint[];
};
