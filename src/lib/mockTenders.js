// Placeholder data shaped like listings scraped from government / public
// institute tender pages (e.g. GeM, CPPP eProcurement, PSU portals).
// Replace with the output of the scraper once it's built.
export const tenders = [
  {
    id: 'GEM/2026/B/9481203',
    title: 'Supply & Installation of Solar Streetlights — Phase II',
    organization: 'Bhubaneswar Municipal Corporation',
    category: 'Infrastructure & Energy',
    sourcePortal: 'GeM',
    location: 'Bhubaneswar, Odisha',
    estimatedValue: '₹1.85 Cr',
    published: '2026-08-02',
    closing: '2026-09-05',
    status: 'Open',
    emd: '₹92,500',
    eligibility: [
      'Class-I/II MSME or Startup India registered vendor',
      'Minimum 3 years in solar infrastructure supply',
      'Average annual turnover ≥ ₹50 lakh (last 3 FY)',
    ],
    documents: [
      'GST Registration Certificate',
      'PAN Card',
      'EMD / Bid Security Declaration',
      'Technical Compliance Sheet',
      'Past Performance Certificates',
    ],
    description:
      'Procurement, supply, and on-site installation of 600 solar-powered LED streetlights across Zones 4–7, including a 5-year maintenance contract.',
  },
  {
    id: 'CPPP/OD/RLY/2026/00457',
    title: 'Annual Maintenance Contract — Signal & Telecom Equipment',
    organization: 'South Eastern Railway',
    category: 'Railways & Transport',
    sourcePortal: 'CPPP eProcurement',
    location: 'Kolkata, West Bengal',
    estimatedValue: '₹3.2 Cr',
    published: '2026-07-28',
    closing: '2026-08-30',
    status: 'Closing Soon',
    emd: '₹1,60,000',
    eligibility: [
      'Empanelled railway signalling contractor (Class A/B)',
      'Valid safety certification (RDSO approved)',
      'No blacklisting in last 5 years',
    ],
    documents: [
      'RDSO Approval Letter',
      'GST Registration Certificate',
      'Experience Certificates (last 3 AMC contracts)',
      'Bank Solvency Certificate',
    ],
    description:
      'Comprehensive AMC covering preventive and breakdown maintenance of signalling and telecom systems across 14 stations on the Kolkata division.',
  },
  {
    id: 'NIT/AIIMS/2026/EQ/331',
    title: 'Procurement of ICU Ventilators and Monitoring Systems',
    organization: 'AIIMS Bhubaneswar',
    category: 'Healthcare Equipment',
    sourcePortal: 'Institute e-Tender Portal',
    location: 'Bhubaneswar, Odisha',
    estimatedValue: '₹4.6 Cr',
    published: '2026-08-10',
    closing: '2026-09-20',
    status: 'Open',
    emd: '₹2,30,000',
    eligibility: [
      'CDSCO / FDA approved manufacturer or authorised dealer',
      'ISO 13485 certified',
      'Minimum 2 similar supply orders to govt hospitals',
    ],
    documents: [
      'Manufacturing / Import License',
      'ISO 13485 Certificate',
      'Product Compliance Datasheet',
      'Authorization Letter (if dealer)',
      'EMD Instrument',
    ],
    description:
      'Supply of 40 ICU ventilators, 60 multi-parameter monitors, and installation with a 3-year comprehensive warranty and staff training.',
  },
  {
    id: 'GEM/2026/S/7720194',
    title: 'Campus-wide Wi-Fi Network Upgrade',
    organization: 'KIIT Deemed University',
    category: 'IT & Networking',
    sourcePortal: 'GeM',
    location: 'Bhubaneswar, Odisha',
    estimatedValue: '₹78 lakh',
    published: '2026-07-15',
    closing: '2026-08-18',
    status: 'Closing Soon',
    emd: '₹39,000',
    eligibility: [
      'OEM authorised system integrator',
      'CCTV / structured cabling experience preferred',
      'Turnover ≥ ₹1 Cr (last FY)',
    ],
    documents: [
      'OEM Authorization Certificate',
      'GST Registration Certificate',
      'Network Design Proposal',
      'EMD Instrument',
    ],
    description:
      'Design, supply, and deployment of a campus-wide Wi-Fi 6 network covering 12 academic blocks and 6 hostels, with a 2-year AMC.',
  },
  {
    id: 'PWD/OD/2026/ROAD/1129',
    title: 'Widening & Resurfacing of NH-16 Service Road',
    organization: 'Odisha Public Works Department',
    category: 'Civil & Roadworks',
    sourcePortal: 'CPPP eProcurement',
    location: 'Khordha, Odisha',
    estimatedValue: '₹6.4 Cr',
    published: '2026-06-20',
    closing: '2026-07-25',
    status: 'Closed',
    emd: '₹3,20,000',
    eligibility: [
      'Class-A registered civil contractor with PWD',
      'Minimum 5 completed road projects ≥ ₹2 Cr each',
    ],
    documents: [
      'PWD Contractor Registration',
      'Machinery Ownership Proof',
      'Completion Certificates',
      'EMD Instrument',
    ],
    description:
      'Widening of a 4.2 km service road stretch to two lanes with bituminous resurfacing and drainage work.',
  },
]

export const categories = [...new Set(tenders.map((t) => t.category))]
export const statuses = ['Open', 'Closing Soon', 'Closed']
