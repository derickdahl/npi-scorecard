// Centralized Prior Art Database
// Each reference is defined once and can be reused across all patents

export interface PriorArtReference {
  id: string
  name: string
  patent_number?: string
  citation: string
  type: 'patent' | 'publication' | 'product' | 'standard'
  filing_date?: string
  relevance: string
  key_teachings: string[]
  figures?: string[]
  claim_elements_covered: string[]
  base_confidence: number
}

export const PRIOR_ART_DB: Record<string, PriorArtReference> = {
  'thiers': {
    id: 'thiers',
    name: 'Thiers',
    patent_number: '9,019,698',
    citation: 'U.S. Patent No. 9,019,698',
    type: 'patent',
    filing_date: '2012-05-21',
    relevance: 'Primary reference - protective case with dock interface assembly, magnetic coupling, alignment features',
    key_teachings: [
      'Case assembly with front cover and rear cover (Fig. 9)',
      'Dock interface assembly with contacts (Abstract)',
      'Internal wires connecting PCB to connector (10:52-57)',
      'Bumpers at corners for shock protection (9:34-40)',
      'Magnetic coupling between case and dock',
      'Alignment feature for docking (claim 1)',
    ],
    figures: ['Fig. 3', 'Fig. 5', 'Fig. 9'],
    claim_elements_covered: [
      'protective case/cover',
      'panel with exterior surface', 
      'skirt surrounding panel',
      'male plug/connector',
      'contactors',
      'female nest',
      'docking system',
      'internal conductors/wires',
    ],
    base_confidence: 92,
  },

  'supran-408': {
    id: 'supran-408',
    name: 'Supran \'408',
    patent_number: '8,553,408',
    citation: 'U.S. Patent No. 8,553,408',
    type: 'patent',
    filing_date: '2011-09-06',
    relevance: 'Protective sleeve with conductive charging, conductive ring contacts, indentations for alignment',
    key_teachings: [
      'Form-fitted sleeve for mobile device (7:33-36)',
      'Conductive ring 42 with indentations 41 (14:30-33)',
      'Sleeve provides protection (9:58-67)',
      'Mating connector 27 for docking',
      'Protrusions 47 on base for alignment',
      'Dam/indentation around contacts',
      'Magnetic coupling mechanism for mounting',
      'Indexing members for discrete rotational orientation',
    ],
    figures: ['Fig. 10', 'Fig. 13', 'Fig. 15'],
    claim_elements_covered: [
      'protective sleeve/cover',
      'conductive ring contacts',
      'alignment indentations',
      'docking system',
      'locator dam',
      'magnetic coupling',
      'nesting appendage',
    ],
    base_confidence: 90,
  },

  'supran-416': {
    id: 'supran-416',
    name: 'Supran \'416',
    patent_number: '9,060,416',
    citation: 'U.S. Patent No. 9,060,416',
    type: 'patent',
    filing_date: '2011-09-06',
    relevance: 'Divisional of \'408 - conductive charging with CENTRAL magnetic mount interface, exposed electrical contacts',
    key_teachings: [
      'Coupling mechanism with magnet for removable coupling (claim 1)',
      'Central magnetic mount - circular mounting with central axis of symmetry (4:24-27)',
      'Exposed electrical contacts for conductive charging (claim 9)',
      'Indexing members/protrusions for discrete rotational alignment (claim 6)',
      'Mounting surface extends along plane parallel to base (claim 1)',
      'Magnet maintains coupling in vertical orientation (claim 4)',
      'Sleeve configured to removably receive mobile device (claim 10)',
    ],
    figures: ['Fig. 1', 'Fig. 2', 'Fig. 3', 'Fig. 10'],
    claim_elements_covered: [
      'magnetic coupling',
      'central magnetic mount interface',
      'exposed electrical contacts',
      'docking connector',
      'alignment/indexing features',
      'protective sleeve',
      'nesting appendage',
      'conductive charging',
    ],
    base_confidence: 93,
  },

  'hoellwarth-850': {
    id: 'hoellwarth-850',
    name: 'Hoellwarth \'850',
    patent_number: '9,939,850',
    citation: 'U.S. Patent No. 9,939,850',
    type: 'patent',
    filing_date: '2015-06-26',
    relevance: 'Primary for later patents - shell, adapter, male plug, contactors in detail',
    key_teachings: [
      'Shell with skirt surrounding panel (Fig. 4-5)',
      'Adapter positioned within shell (Fig. 9)',
      'Connector 44 with multiple contactors (42:60-43:3)',
      'Second contactors exposed on exterior',
      'Adapter fixedly positioned in skirt',
    ],
    figures: ['Fig. 4', 'Fig. 5', 'Fig. 9'],
    claim_elements_covered: [
      'protective shell/cover',
      'panel and skirt',
      'adapter',
      'male plug',
      'first contactors on plug',
      'second contactors on exterior',
      'female nest/cavity',
    ],
    base_confidence: 94,
  },

  'hoellwarth-343': {
    id: 'hoellwarth-343',
    name: 'Hoellwarth \'343',
    patent_number: '9,595,343',
    citation: 'U.S. Patent No. 9,595,343',
    type: 'patent',
    filing_date: '2015-03-13',
    relevance: 'Docking station/base complementary to Hoellwarth \'850',
    key_teachings: [
      'Base station for receiving protected device',
      'Docking connector with mating contacts',
      'Alignment features on base',
    ],
    figures: [],
    claim_elements_covered: [
      'docking station',
      'docking connector',
      'base with tray',
    ],
    base_confidence: 89,
  },

  'kim-781': {
    id: 'kim-781',
    name: 'Kim-781',
    patent_number: 'WO 2014/010781',
    citation: 'WO 2014/010781',
    type: 'publication',
    filing_date: '2013-07-12',
    relevance: 'Charging apparatus with terminal casing, concentric ring electrodes',
    key_teachings: [
      'Terminal casing 100 for mobile device (Abstract, [11])',
      'Charging mount 200 ([31])',
      'Electrode part 110 on backside',
      'Concentric ring electrodes 111-114',
      'Lead wires 119 connecting electrodes',
    ],
    figures: ['Fig. 1', 'Fig. 2', 'Fig. 3'],
    claim_elements_covered: [
      'protective case/casing',
      'charging mount/dock',
      'ring electrodes/contactors',
      'internal conductors',
    ],
    base_confidence: 89,
  },

  'kim-099': {
    id: 'kim-099',
    name: 'Kim \'099',
    patent_number: 'US 2015/0011099',
    citation: 'U.S. Pub. No. 2015/0011099',
    type: 'publication',
    filing_date: '2013-07-03',
    relevance: 'Sliding connector protecting case - flexible case with connector',
    key_teachings: [
      'Protecting case with sliding connector ([0002])',
      'Connector slides to connect to device port ([0009])',
      'Flexible protective case body',
      'Circuit apparatus in case connected via connector',
    ],
    figures: [],
    claim_elements_covered: [
      'protective case',
      'sliding connector',
      'male plug',
      'flexible shell',
    ],
    base_confidence: 88,
  },

  'rayner-494': {
    id: 'rayner-494',
    name: 'Rayner-494',
    patent_number: '9,229,494',
    citation: 'U.S. Patent No. 9,229,494',
    type: 'patent',
    filing_date: '2013-03-15',
    relevance: 'Protective housing with alignment features, contactors, waterproof',
    key_teachings: [
      'Housing for protecting device from shock, liquid, dust (Abstract)',
      'Complementary alignment pins and holes (49:5-7)',
      'Recessed contactors for pairing',
      'Housing separate from device, fitted within',
    ],
    figures: ['Fig. 16A-F'],
    claim_elements_covered: [
      'protective housing/case',
      'alignment features',
      'contactors',
      'spaced front/back faces',
    ],
    base_confidence: 85,
  },

  'wilson': {
    id: 'wilson',
    name: 'Wilson',
    patent_number: '8,867,209',
    citation: 'U.S. Patent No. 8,867,209',
    type: 'patent',
    filing_date: '2012-06-28',
    relevance: 'Protective cover with integrated adapter',
    key_teachings: [
      'Shell with integrated adapter (Fig. 1)',
      'Male plug extending into cavity',
      'Exterior contactors',
    ],
    figures: ['Fig. 1'],
    claim_elements_covered: [
      'protective shell',
      'integrated adapter',
      'male plug',
    ],
    base_confidence: 86,
  },

  'iport-launchport': {
    id: 'iport-launchport',
    name: 'iPort LaunchPort',
    citation: 'iPort LaunchPort Product (Pre-2014)',
    type: 'product',
    relevance: 'Commercial product showing protective case with Lightning plug and magnetic charging',
    key_teachings: [
      'Protective case for iPad',
      'Lightning connector integration',
      'Magnetic mounting to wall/base',
      'Charging through case',
    ],
    figures: [],
    claim_elements_covered: [
      'protective case',
      'male plug (Lightning)',
      'magnetic coupling',
      'charging dock',
    ],
    base_confidence: 83,
  },

  'infinea-tab-m': {
    id: 'infinea-tab-m',
    name: 'Infinea Tab M',
    citation: 'Infinite Peripherals Infinea Tab M',
    type: 'product',
    relevance: 'Commercial iPad case with exposed contactors and connector',
    key_teachings: [
      'Protective case for iPad',
      'Exposed contactors on exterior',
      'Male plug for device connection',
    ],
    figures: [],
    claim_elements_covered: [
      'protective case',
      'exposed contactors',
      'male connector',
    ],
    base_confidence: 80,
  },

  'duracell-mygrid': {
    id: 'duracell-mygrid',
    name: 'Duracell myGrid',
    citation: 'Duracell myGrid Charging System (2009)',
    type: 'product',
    relevance: 'Power Sleeve with conductive contacts for charging pad - case with contacts that interface with dock',
    key_teachings: [
      'Power Sleeve slips over device and acts as protective case',
      'Four small metal contacts on back of sleeve (Gadgeteer review 2009)',
      'Contacts interface with charging pad surface',
      'Conductive charging through case contacts',
      'Multiple device types supported via sleeves',
    ],
    figures: [],
    claim_elements_covered: [
      'protective case',
      'exposed contactors',
      'second contactors on exterior',
      'docking system',
      'conductive charging',
    ],
    base_confidence: 88,
  },

  'linea-pro': {
    id: 'linea-pro',
    name: 'Linea Pro / Apple EasyPay',
    citation: 'Infinite Peripherals Linea Pro (2009)',
    type: 'product',
    relevance: 'Sled-style enclosure with dock connector and charging dock - used in Apple retail',
    key_teachings: [
      'Sled-style protective enclosure for iPhone/iPod (mid-2009)',
      '30-pin dock connector integration',
      'Dedicated charging dock',
      'Male connector inside sled connects to device',
      'Used in Apple retail stores for EasyPay',
    ],
    figures: [],
    claim_elements_covered: [
      'protective case',
      'male plug',
      'docking system',
      'docking station',
    ],
    base_confidence: 85,
  },

  'mophie-juice-pack': {
    id: 'mophie-juice-pack',
    name: 'Mophie Juice Pack + Dock',
    citation: 'Mophie Juice Pack and Charging Dock (2011)',
    type: 'product',
    relevance: 'Battery case with pogo pin contacts that interface with charging dock',
    key_teachings: [
      'Battery case that surrounds and protects device',
      'Pogo pin contacts on bottom of case',
      'Dedicated dock with matching pogo pins',
      'Charges on contact - drop and go',
      'Pass-through USB for device charging',
    ],
    figures: [],
    claim_elements_covered: [
      'protective case',
      'second contactors on exterior',
      'docking system',
      'docking station',
      'docking connector',
    ],
    base_confidence: 87,
  },

  'iport-charge-case': {
    id: 'iport-charge-case',
    name: 'iPort Charge Case and Stand',
    citation: 'iPort Charge Case and Stand (November 2013)',
    type: 'product',
    relevance: 'Dana Innovations product - protective case with conductive contacts that mate with dock contacts',
    key_teachings: [
      'Protective case with raised conductive contacts on back (Nov 2013)',
      'Dock has matching raised contacts that align with case contacts',
      'Magnetic alignment between case and dock',
      'Conductive charging - not inductive (iLounge review)',
      'Charges automatically when case contacts meet dock contacts',
      'Portrait and landscape orientation support',
    ],
    figures: [],
    claim_elements_covered: [
      'protective case',
      'second contactors on exterior',
      'docking system',
      'docking station',
      'docking connector',
      'magnetic coupling',
    ],
    base_confidence: 92,
  },

  'honeywell-captuvo': {
    id: 'honeywell-captuvo',
    name: 'Honeywell Captuvo SL22',
    citation: 'Honeywell Captuvo SL22 Enterprise Sled (July 2012)',
    type: 'product',
    relevance: 'Enterprise sled for iPod/iPhone with dedicated charging cradle/Homebase',
    key_teachings: [
      'Enterprise sled enclosure for iPod Touch (July 2012)',
      'Dedicated charging cradle (Homebase/ChargeBase)',
      'Sled drops into cradle for charging',
      'Dock connector integration inside sled',
      'Used in retail/enterprise environments',
    ],
    figures: [],
    claim_elements_covered: [
      'protective case',
      'male plug',
      'docking system',
      'docking station',
    ],
    base_confidence: 85,
  },

}

// Helper function to get prior art by ID
export function getPriorArt(id: string): PriorArtReference | null {
  return PRIOR_ART_DB[id] || null
}

// Get all prior art references
export function getAllPriorArt(): PriorArtReference[] {
  return Object.values(PRIOR_ART_DB)
}

// Get prior art applicable to a specific claim element
export function getPriorArtForElement(element: string): PriorArtReference[] {
  return Object.values(PRIOR_ART_DB).filter(ref => 
    ref.claim_elements_covered.some(covered => 
      element.toLowerCase().includes(covered.toLowerCase()) ||
      covered.toLowerCase().includes(element.toLowerCase())
    )
  )
}

// Patent-to-prior-art mapping (which prior art applies to which patents)
// supran-416 added for magnetic coupling and conductive charging coverage
// Product prior art: duracell-mygrid (2009), linea-pro (2009), mophie-juice-pack (2011), iport-charge-case (Nov 2013), honeywell-captuvo (July 2012)
export const PATENT_PRIOR_ART_MAP: Record<string, string[]> = {
  // Original 9 with contentions
  '140': ['thiers', 'supran-408', 'supran-416', 'kim-781', 'rayner-494', 'iport-launchport', 'infinea-tab-m', 'duracell-mygrid', 'mophie-juice-pack', 'iport-charge-case', 'honeywell-captuvo'],
  '141': ['thiers', 'supran-408', 'supran-416', 'kim-781', 'rayner-494', 'iport-launchport', 'infinea-tab-m', 'duracell-mygrid', 'mophie-juice-pack', 'iport-charge-case', 'honeywell-captuvo'],
  '142': ['thiers', 'supran-408', 'supran-416', 'kim-781', 'rayner-494', 'iport-launchport', 'infinea-tab-m', 'duracell-mygrid', 'mophie-juice-pack', 'iport-charge-case', 'honeywell-captuvo'],
  '275': ['thiers', 'supran-408', 'supran-416', 'kim-781', 'rayner-494', 'iport-launchport', 'infinea-tab-m', 'duracell-mygrid', 'mophie-juice-pack', 'iport-charge-case', 'honeywell-captuvo'],
  '279': ['kim-099', 'rayner-494', 'thiers', 'supran-408', 'supran-416', 'iport-launchport', 'infinea-tab-m', 'linea-pro', 'mophie-juice-pack', 'iport-charge-case', 'honeywell-captuvo'],
  '444': ['hoellwarth-850', 'hoellwarth-343', 'wilson', 'rayner-494', 'iport-launchport', 'infinea-tab-m', 'supran-408', 'supran-416', 'thiers', 'duracell-mygrid', 'mophie-juice-pack', 'linea-pro', 'iport-charge-case', 'honeywell-captuvo'],
  '458': ['hoellwarth-850', 'thiers', 'supran-408', 'supran-416', 'kim-099', 'rayner-494', 'iport-launchport', 'infinea-tab-m', 'duracell-mygrid', 'mophie-juice-pack', 'iport-charge-case', 'honeywell-captuvo'],
  '535': ['hoellwarth-850', 'wilson', 'thiers', 'supran-408', 'supran-416', 'kim-099', 'rayner-494', 'iport-launchport', 'infinea-tab-m', 'mophie-juice-pack', 'iport-charge-case', 'honeywell-captuvo'],
  '550': ['hoellwarth-850', 'thiers', 'supran-408', 'supran-416', 'kim-099', 'rayner-494', 'hoellwarth-343', 'iport-launchport', 'duracell-mygrid', 'mophie-juice-pack', 'iport-charge-case', 'honeywell-captuvo'],
  // Additional 9 patents
  '387': ['thiers', 'supran-408', 'supran-416', 'kim-781', 'rayner-494', 'iport-launchport', 'duracell-mygrid', 'mophie-juice-pack', 'iport-charge-case', 'honeywell-captuvo'],
  '639': ['thiers', 'supran-408', 'supran-416', 'kim-781', 'iport-launchport', 'duracell-mygrid', 'mophie-juice-pack', 'iport-charge-case', 'honeywell-captuvo'],
  '026': ['thiers', 'supran-408', 'supran-416', 'kim-781', 'iport-launchport', 'linea-pro', 'mophie-juice-pack', 'iport-charge-case', 'honeywell-captuvo'],
  '330': ['thiers', 'supran-408', 'supran-416', 'rayner-494', 'kim-781', 'mophie-juice-pack', 'iport-charge-case', 'honeywell-captuvo'],
  '658': ['supran-408', 'supran-416', 'thiers', 'kim-781', 'iport-launchport', 'duracell-mygrid', 'mophie-juice-pack', 'iport-charge-case', 'honeywell-captuvo'],
  '399': ['hoellwarth-850', 'thiers', 'supran-408', 'supran-416', 'hoellwarth-343', 'duracell-mygrid', 'mophie-juice-pack', 'iport-charge-case', 'honeywell-captuvo'],
  '515': ['hoellwarth-850', 'thiers', 'supran-408', 'supran-416', 'hoellwarth-343', 'duracell-mygrid', 'mophie-juice-pack', 'iport-charge-case', 'honeywell-captuvo'],
  '334': ['hoellwarth-850', 'thiers', 'supran-408', 'supran-416', 'hoellwarth-343', 'duracell-mygrid', 'mophie-juice-pack', 'iport-charge-case', 'honeywell-captuvo'],
  '884': ['hoellwarth-850', 'thiers', 'supran-408', 'supran-416', 'kim-099', 'hoellwarth-343', 'duracell-mygrid', 'mophie-juice-pack', 'iport-charge-case', 'honeywell-captuvo'],
}

// Get prior art references for a specific patent
export function getPriorArtForPatent(patentShortName: string): PriorArtReference[] {
  const priorArtIds = PATENT_PRIOR_ART_MAP[patentShortName] || []
  return priorArtIds.map(id => PRIOR_ART_DB[id]).filter(Boolean)
}
