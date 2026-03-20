export interface PronunciationScore {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  prosodyScore: number;
  overallScore: number;
}

export interface WordScore {
  word: string;
  accuracyScore: number;
  errorType: "None" | "Omission" | "Insertion" | "Mispronunciation";
}

export interface AssessmentResult {
  scores: PronunciationScore;
  words: WordScore[];
  recognizedText: string;
  referenceText: string;
  timestamp: number;
}

export type AssessmentStatus =
  | "idle"
  | "requesting-mic"
  | "ready"
  | "recording"
  | "processing"
  | "done"
  | "error";

export interface AssessmentError {
  code:
    | "mic-denied"
    | "mic-unavailable"
    | "token-failed"
    | "recognition-failed"
    | "timeout";
  message: string;
}
