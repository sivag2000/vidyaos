import { ClassDef } from './types';

export const CLASS_11: ClassDef = {
  classLevel: 11,
  subjects: [
    {
      id: 'physics',
      name: 'Physics',
      chapters: [
        { id: 'units-and-measurements', name: 'Units and Measurements', topics: ['SI units', 'Dimensional analysis', 'Significant figures', 'Errors in measurement'] },
        { id: 'motion-in-a-straight-line', name: 'Motion in a Straight Line', topics: ['Displacement and velocity', 'Acceleration', 'Equations of motion', 'Relative velocity'] },
        { id: 'motion-in-a-plane', name: 'Motion in a Plane', topics: [] },
        { id: 'laws-of-motion', name: 'Laws of Motion', topics: [] },
        { id: 'work-energy-and-power', name: 'Work, Energy and Power', topics: [] },
        { id: 'rotational-motion', name: 'System of Particles and Rotational Motion', topics: [] },
        { id: 'gravitation', name: 'Gravitation', topics: [] },
        { id: 'mechanical-properties-of-solids', name: 'Mechanical Properties of Solids', topics: [] },
        { id: 'mechanical-properties-of-fluids', name: 'Mechanical Properties of Fluids', topics: [] },
        { id: 'thermal-properties-of-matter', name: 'Thermal Properties of Matter', topics: [] },
        { id: 'thermodynamics-phy', name: 'Thermodynamics', topics: [] },
        { id: 'kinetic-theory', name: 'Kinetic Theory', topics: [] },
        { id: 'oscillations', name: 'Oscillations', topics: [] },
        { id: 'waves', name: 'Waves', topics: [] },
      ],
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      chapters: [
        { id: 'basic-concepts-of-chemistry', name: 'Some Basic Concepts of Chemistry', topics: ['Mole concept', 'Stoichiometry', 'Empirical and molecular formula', 'Concentration terms'] },
        { id: 'structure-of-atom', name: 'Structure of Atom', topics: ['Bohr model', 'Quantum numbers', 'Electronic configuration', 'Dual nature of matter'] },
        { id: 'classification-and-periodicity', name: 'Classification of Elements and Periodicity in Properties', topics: [] },
        { id: 'chemical-bonding', name: 'Chemical Bonding and Molecular Structure', topics: [] },
        { id: 'thermodynamics-chem', name: 'Thermodynamics', topics: [] },
        { id: 'equilibrium', name: 'Equilibrium', topics: [] },
        { id: 'redox-reactions', name: 'Redox Reactions', topics: [] },
        { id: 'organic-basic-principles', name: 'Organic Chemistry: Some Basic Principles and Techniques', topics: [] },
        { id: 'hydrocarbons', name: 'Hydrocarbons', topics: [] },
      ],
    },
    {
      id: 'mathematics',
      name: 'Mathematics',
      chapters: [
        { id: 'sets', name: 'Sets', topics: ['Types of sets', 'Venn diagrams', 'Operations on sets', 'De Morgan laws'] },
        { id: 'relations-and-functions', name: 'Relations and Functions', topics: ['Cartesian product', 'Domain and range', 'Types of functions'] },
        { id: 'trigonometric-functions', name: 'Trigonometric Functions', topics: [] },
        { id: 'complex-numbers', name: 'Complex Numbers and Quadratic Equations', topics: [] },
        { id: 'linear-inequalities', name: 'Linear Inequalities', topics: [] },
        { id: 'permutations-and-combinations', name: 'Permutations and Combinations', topics: [] },
        { id: 'binomial-theorem', name: 'Binomial Theorem', topics: [] },
        { id: 'sequences-and-series', name: 'Sequences and Series', topics: [] },
        { id: 'straight-lines', name: 'Straight Lines', topics: [] },
        { id: 'conic-sections', name: 'Conic Sections', topics: [] },
        { id: 'three-dimensional-geometry', name: 'Introduction to Three-Dimensional Geometry', topics: [] },
        { id: 'limits-and-derivatives', name: 'Limits and Derivatives', topics: [] },
        { id: 'statistics', name: 'Statistics', topics: [] },
        { id: 'probability', name: 'Probability', topics: [] },
      ],
    },
    {
      id: 'biology',
      name: 'Biology',
      chapters: [
        { id: 'the-living-world', name: 'The Living World', topics: ['Taxonomic categories', 'Nomenclature', 'Diversity of living organisms'] },
        { id: 'biological-classification', name: 'Biological Classification', topics: ['Five kingdom classification', 'Monera', 'Protista', 'Fungi'] },
        { id: 'plant-kingdom', name: 'Plant Kingdom', topics: [] },
        { id: 'animal-kingdom', name: 'Animal Kingdom', topics: [] },
        { id: 'cell-unit-of-life', name: 'Cell: The Unit of Life', topics: [] },
        { id: 'biomolecules', name: 'Biomolecules', topics: [] },
        { id: 'cell-cycle-and-division', name: 'Cell Cycle and Cell Division', topics: [] },
        { id: 'breathing-and-exchange-of-gases', name: 'Breathing and Exchange of Gases', topics: [] },
        { id: 'body-fluids-and-circulation', name: 'Body Fluids and Circulation', topics: [] },
        { id: 'neural-control-and-coordination', name: 'Neural Control and Coordination', topics: [] },
      ],
    },
  ],
};

export interface ChapterLookup {
  subjectId: string;
  subjectName: string;
  chapter: { id: string; name: string; topics: string[] };
}

export function getChapter(chapterId: string): ChapterLookup | null {
  for (const s of CLASS_11.subjects) {
    const chapter = s.chapters.find(c => c.id === chapterId);
    if (chapter) return { subjectId: s.id, subjectName: s.name, chapter };
  }
  return null;
}
