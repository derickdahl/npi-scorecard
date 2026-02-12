// Dynamic Scoring Engine for Patent Invalidity Analysis
// Computes confidence scores based on prior art coverage of claim elements

import { PRIOR_ART_DB, PATENT_PRIOR_ART_MAP, PriorArtReference } from './prior-art-db'

// Claim element types that appear across NPI patents
export const ELEMENT_TYPES = {
  // Protective cover/case elements
  'protective_cover': { weight: 1.0, description: 'Protective cover/case/shell for electronic device' },
  'panel_exterior': { weight: 0.9, description: 'Panel with exterior surface' },
  'skirt_perimeter': { weight: 0.9, description: 'Skirt surrounding panel perimeter' },
  'interior_cavity': { weight: 0.8, description: 'Interior cavity formed by panel and skirt' },
  'flexible_shell': { weight: 0.85, description: 'Flexible/elastomeric shell material' },
  
  // Adapter/connector elements
  'adapter': { weight: 1.0, description: 'Adapter supported by shell' },
  'male_plug': { weight: 0.95, description: 'Male plug with connectors' },
  'first_contactors': { weight: 0.9, description: 'First contactors on male plug' },
  'second_contactors': { weight: 0.9, description: 'Second contactors exposed on exterior' },
  'female_nest': { weight: 0.85, description: 'Female nest/socket' },
  
  // Docking system elements
  'docking_system': { weight: 1.0, description: 'Docking system comprising cover and dock' },
  'docking_station': { weight: 0.9, description: 'Docking station/cradle with base' },
  'docking_connector': { weight: 0.9, description: 'Docking connector to mate with contactors' },
  
  // Special features
  'locator_dam': { weight: 0.8, description: 'Locator dam surrounding contactor' },
  'magnetic_coupling': { weight: 0.8, description: 'Magnetic element for coupling' },
  'hard_shell': { weight: 0.85, description: 'Hard shell around flexible cover' },
  'transparent_window': { weight: 0.75, description: 'Transparent window panel' },
  'ring_contacts': { weight: 0.85, description: 'Ring-shaped contactor contacts' },
  'internal_conductors': { weight: 0.8, description: 'Internal electrical conductors/wires' },
  'alignment_features': { weight: 0.8, description: 'Alignment pins/holes/features' },
  'nesting_appendage': { weight: 0.75, description: 'Male nesting appendage' },
}

// Map prior art to element types they cover (with coverage strength 0-100)
export const PRIOR_ART_ELEMENT_COVERAGE: Record<string, Record<string, number>> = {
  'thiers': {
    'protective_cover': 95,
    'panel_exterior': 92,
    'skirt_perimeter': 90,
    'interior_cavity': 88,
    'adapter': 85,
    'male_plug': 90,
    'first_contactors': 88,
    'second_contactors': 82,
    'female_nest': 85,
    'docking_system': 92,
    'docking_station': 90,
    'docking_connector': 88,
    'internal_conductors': 90,
    'magnetic_coupling': 85,
    'alignment_features': 80,
  },
  'supran-408': {
    'protective_cover': 90,
    'panel_exterior': 85,
    'skirt_perimeter': 85,
    'interior_cavity': 88,
    'flexible_shell': 92,
    'male_plug': 82,
    'first_contactors': 80,
    'second_contactors': 88,
    'ring_contacts': 95,
    'docking_system': 88,
    'docking_connector': 85,
    'locator_dam': 90,
    'alignment_features': 90,
    'nesting_appendage': 88,
    'magnetic_coupling': 90,
  },
  'supran-416': {
    // Divisional of '408 - specifically claims conductive charging + central magnetic mount
    'protective_cover': 88,
    'flexible_shell': 90,
    'magnetic_coupling': 95,  // Central magnetic mount interface - claim 1, 3, 4
    'docking_system': 90,
    'docking_connector': 92,  // Exposed electrical contacts for conductive charging - claim 9
    'docking_station': 90,
    'alignment_features': 92, // Indexing members/protrusions - claim 6
    'nesting_appendage': 92,  // Circular mounting portion - claim 2
    'ring_contacts': 90,
    'locator_dam': 88,
  },
  'hoellwarth-850': {
    'protective_cover': 96,
    'panel_exterior': 95,
    'skirt_perimeter': 95,
    'interior_cavity': 94,
    'flexible_shell': 90,
    'adapter': 96,
    'male_plug': 95,
    'first_contactors': 94,
    'second_contactors': 95,
    'female_nest': 92,
    'docking_system': 90,
    'internal_conductors': 92,
  },
  'hoellwarth-343': {
    'docking_system': 92,
    'docking_station': 94,
    'docking_connector': 95,
  },
  'kim-781': {
    'protective_cover': 90,
    'panel_exterior': 85,
    'adapter': 82,
    'male_plug': 85,
    'first_contactors': 88,
    'second_contactors': 90,
    'ring_contacts': 92,
    'docking_system': 85,
    'docking_station': 88,
    'internal_conductors': 85,
  },
  'kim-099': {
    'protective_cover': 88,
    'flexible_shell': 90,
    'adapter': 85,
    'male_plug': 90,
    'first_contactors': 82,
  },
  'rayner-494': {
    'protective_cover': 88,
    'panel_exterior': 85,
    'interior_cavity': 82,
    'hard_shell': 90,
    'alignment_features': 92,
    'second_contactors': 80,
    'transparent_window': 85,
  },
  'wilson': {
    'protective_cover': 88,
    'panel_exterior': 86,
    'skirt_perimeter': 85,
    'adapter': 90,
    'male_plug': 88,
    'second_contactors': 82,
  },
  'iport-launchport': {
    'protective_cover': 85,
    'male_plug': 88,
    'docking_system': 85,
    'docking_station': 88,
    'magnetic_coupling': 92,
  },
  'infinea-tab-m': {
    'protective_cover': 82,
    'male_plug': 80,
    'second_contactors': 85,
  },
  'duracell-mygrid': {
    // 2009 - Power Sleeve with contacts for charging pad
    'protective_cover': 90,
    'second_contactors': 92,  // Four metal contacts on back of sleeve
    'docking_system': 88,
    'docking_station': 88,
    'docking_connector': 85,
  },
  'linea-pro': {
    // 2009 - Sled with dock connector
    'protective_cover': 85,
    'male_plug': 90,  // 30-pin connector inside sled
    'docking_system': 85,
    'docking_station': 88,
  },
  'mophie-juice-pack': {
    // 2011 - Battery case with pogo pin contacts + dock
    'protective_cover': 90,
    'second_contactors': 92,  // Pogo pins on bottom of case
    'docking_system': 90,
    'docking_station': 90,
    'docking_connector': 90,  // Dock has matching pogo pins
  },
  'iport-charge-case': {
    // Nov 2013 - Dana's own product! Case with conductive contacts + dock
    'protective_cover': 95,
    'second_contactors': 95,  // Raised contacts on back of case
    'docking_system': 95,
    'docking_station': 95,
    'docking_connector': 95,  // Dock has matching contacts
    'magnetic_coupling': 90,  // Magnetic alignment
  },
  'honeywell-captuvo': {
    // July 2012 - Enterprise sled with charging cradle
    'protective_cover': 85,
    'male_plug': 88,  // Dock connector inside sled
    'docking_system': 88,
    'docking_station': 90,  // Dedicated charging cradle
  },
}

// Calculate confidence for a specific element based on available prior art
export function calculateElementConfidence(
  elementType: string, 
  priorArtIds: string[]
): { confidence: number; bestRef: string; allRefs: string[] } {
  let bestConfidence = 0
  let bestRef = ''
  const coveringRefs: string[] = []

  for (const priorArtId of priorArtIds) {
    const coverage = PRIOR_ART_ELEMENT_COVERAGE[priorArtId]?.[elementType]
    if (coverage) {
      coveringRefs.push(priorArtId)
      if (coverage > bestConfidence) {
        bestConfidence = coverage
        bestRef = priorArtId
      }
    }
  }

  // Boost confidence slightly if multiple refs cover the same element (corroboration)
  if (coveringRefs.length > 1) {
    bestConfidence = Math.min(98, bestConfidence + (coveringRefs.length - 1) * 2)
  }

  return { confidence: bestConfidence, bestRef, allRefs: coveringRefs }
}

// Calculate overall claim confidence from element confidences
export function calculateClaimConfidence(elementConfidences: number[]): number {
  if (elementConfidences.length === 0) return 0
  
  // Weakest link approach with averaging
  const minConfidence = Math.min(...elementConfidences)
  const avgConfidence = elementConfidences.reduce((a, b) => a + b, 0) / elementConfidences.length
  
  // Weight: 60% weakest element, 40% average (weakest link matters most)
  return Math.round(minConfidence * 0.6 + avgConfidence * 0.4)
}

// Calculate overall patent confidence from claim confidences
export function calculatePatentConfidence(claimConfidences: number[]): number {
  if (claimConfidences.length === 0) return 0
  
  // Average of independent claims (all need to be invalid)
  return Math.round(claimConfidences.reduce((a, b) => a + b, 0) / claimConfidences.length)
}

// Main function: Calculate all scores for a patent
export function scorePatent(patentShortName: string, claimElements: Record<string, string[]>): {
  patentConfidence: number
  claimScores: Record<string, { confidence: number; elements: Record<string, { confidence: number; refs: string[] }> }>
} {
  const priorArtIds = PATENT_PRIOR_ART_MAP[patentShortName] || []
  const claimScores: Record<string, { confidence: number; elements: Record<string, { confidence: number; refs: string[] }> }> = {}
  
  for (const [claimLabel, elements] of Object.entries(claimElements)) {
    const elementScores: Record<string, { confidence: number; refs: string[] }> = {}
    const confidences: number[] = []
    
    for (const elementType of elements) {
      const result = calculateElementConfidence(elementType, priorArtIds)
      elementScores[elementType] = { confidence: result.confidence, refs: result.allRefs }
      if (result.confidence > 0) {
        confidences.push(result.confidence)
      }
    }
    
    claimScores[claimLabel] = {
      confidence: calculateClaimConfidence(confidences),
      elements: elementScores,
    }
  }
  
  const patentConfidence = calculatePatentConfidence(
    Object.values(claimScores).map(c => c.confidence)
  )
  
  return { patentConfidence, claimScores }
}

// Pre-defined claim elements for each patent (what elements each claim covers)
export const PATENT_CLAIM_ELEMENTS: Record<string, Record<string, string[]>> = {
  '140': {
    'Claim 1': ['protective_cover', 'panel_exterior', 'skirt_perimeter', 'male_plug', 'first_contactors', 'second_contactors', 'female_nest'],
    'Claim 7': ['docking_system', 'docking_station', 'docking_connector'],
  },
  '141': {
    'Claim 1': ['protective_cover', 'panel_exterior', 'skirt_perimeter', 'male_plug', 'first_contactors'],
    'Claim 13': ['docking_system', 'docking_connector'],
  },
  '142': {
    'Claim 1': ['protective_cover', 'panel_exterior', 'skirt_perimeter', 'male_plug', 'second_contactors'],
    'Claim 14': ['docking_system', 'docking_station'],
  },
  '275': {
    'Claim 1': ['protective_cover', 'panel_exterior', 'skirt_perimeter', 'interior_cavity', 'male_plug', 'first_contactors', 'second_contactors', 'internal_conductors'],
    'Claim 19': ['docking_system', 'docking_station', 'docking_connector'],
  },
  '279': {
    'Claim 1': ['protective_cover', 'flexible_shell', 'panel_exterior', 'skirt_perimeter', 'male_plug', 'second_contactors'],
    'Claim 9': ['docking_system', 'docking_connector'],
    'Claim 20': ['protective_cover', 'panel_exterior', 'female_nest'],
  },
  '444': {
    'Claim 1': ['protective_cover', 'panel_exterior', 'skirt_perimeter', 'female_nest', 'adapter', 'male_plug', 'first_contactors', 'second_contactors'],
    'Claim 19': ['protective_cover', 'female_nest', 'adapter', 'male_plug', 'first_contactors', 'second_contactors'],
    'Claim 28': ['docking_system', 'docking_connector'],
  },
  '458': {
    'Claim 12': ['protective_cover', 'panel_exterior', 'skirt_perimeter', 'adapter', 'male_plug', 'first_contactors', 'second_contactors'],
    'Claim 20': ['docking_system', 'docking_connector'],
  },
  '535': {
    'Claim 15': ['protective_cover', 'panel_exterior', 'skirt_perimeter', 'adapter', 'male_plug', 'first_contactors', 'second_contactors'],
    'Claim 19': ['docking_system', 'docking_station'],
  },
  '550': {
    'Claim 1': ['protective_cover', 'panel_exterior', 'skirt_perimeter', 'male_plug', 'first_contactors'],
    'Claim 7': ['docking_system', 'docking_station'],
    'Claim 9': ['protective_cover', 'second_contactors'],
    'Claim 13': ['docking_system'],
    'Claim 17': ['protective_cover', 'adapter'],
    'Claim 18': ['protective_cover', 'panel_exterior'],
    'Claim 21': ['docking_system', 'docking_station'],
    'Claim 27': ['docking_system', 'docking_connector'],
  },
  '387': {
    'Claim 1': ['protective_cover', 'flexible_shell', 'panel_exterior', 'skirt_perimeter', 'adapter', 'male_plug', 'second_contactors', 'hard_shell'],
    'Claim 8': ['hard_shell', 'flexible_shell', 'adapter'],
    'Claim 17': ['docking_system', 'docking_station', 'docking_connector'],
  },
  '639': {
    'Claim 1': ['protective_cover', 'flexible_shell', 'panel_exterior', 'skirt_perimeter', 'adapter', 'male_plug', 'second_contactors', 'locator_dam', 'magnetic_coupling'],
    'Claim 5': ['protective_cover', 'nesting_appendage'],
    'Claim 15': ['docking_system', 'docking_station'],
  },
  '026': {
    'Claim 1': ['protective_cover', 'flexible_shell', 'adapter', 'male_plug', 'internal_conductors'],
    'Claim 10': ['protective_cover', 'adapter', 'internal_conductors'],
    'Claim 18': ['docking_system', 'docking_connector'],
  },
  '330': {
    'Claim 1': ['protective_cover', 'flexible_shell', 'transparent_window', 'adapter', 'male_plug'],
    'Claim 12': ['docking_system', 'docking_station'],
  },
  '658': {
    'Claim 1': ['protective_cover', 'panel_exterior', 'interior_cavity', 'adapter', 'male_plug', 'ring_contacts'],
    'Claim 13': ['docking_system', 'docking_connector', 'ring_contacts'],
  },
  '399': {
    'Claim 1': ['protective_cover', 'panel_exterior', 'skirt_perimeter', 'adapter', 'male_plug', 'first_contactors', 'second_contactors'],
    'Claim 14': ['docking_system', 'docking_connector'],
  },
  '515': {
    'Claim 1': ['protective_cover', 'interior_cavity', 'adapter', 'male_plug', 'second_contactors'],
    'Claim 15': ['docking_system', 'docking_connector'],
  },
  '334': {
    'Claim 1': ['protective_cover', 'panel_exterior', 'skirt_perimeter', 'adapter', 'male_plug', 'second_contactors'],
    'Claim 12': ['docking_system', 'docking_connector'],
  },
  '884': {
    'Claim 1': ['protective_cover', 'panel_exterior', 'skirt_perimeter', 'adapter', 'male_plug', 'first_contactors', 'second_contactors'],
    'Claim 13': ['docking_system', 'docking_connector'],
  },
}

// Generate scores for all patents
export function scoreAllPatents(): Record<string, { patentConfidence: number; claimScores: Record<string, { confidence: number }> }> {
  const results: Record<string, { patentConfidence: number; claimScores: Record<string, { confidence: number }> }> = {}
  
  for (const [patentId, claimElements] of Object.entries(PATENT_CLAIM_ELEMENTS)) {
    results[patentId] = scorePatent(patentId, claimElements)
  }
  
  return results
}
