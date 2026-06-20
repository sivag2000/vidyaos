export interface ChapterDef {
  id: string;
  name: string;
  topics: string[];
}

export interface SubjectDef {
  id: string;
  name: string;
  chapters: ChapterDef[];
}

export interface ClassDef {
  classLevel: number;
  subjects: SubjectDef[];
}
