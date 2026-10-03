/**
 * Single source of truth for brand, contact details, programs, plans and FAQs.
 * Everything marked SAMPLE is illustrative and must be confirmed by the client.
 */
import manifest from './image-manifest.json'

export const brand = {
  name: 'FIT NATION',
  short: 'FIT NATION',
  tagline: 'Build your next level',
}

/** Client-supplied contact details. Only the email is still a demo placeholder (none was provided). */
export const contact = {
  /** Demo address on the reserved .example domain. Replace when the client supplies one. */
  email: 'demo@fitnation.example',
  emailIsDemo: true,
  phones: [
    { display: '+91 98201 26553', tel: '+919820126553' },
    { display: '+91 88284 61598', tel: '+918828461598' },
  ],
  address: 'Shop No. 4, First Floor, opposite Jyoti Hotel, Triveni Nagar Road, Kurar Village, Malad East, Mumbai',
  area: 'Malad East, Mumbai',
  floorArea: '3,500 sq ft',
  /** Hours as supplied by the client. "12:00 am" is midnight. */
  hours: [{ label: 'Every day', time: '6:00 am – 12:00 am' }],
  hoursNote: 'Closes at midnight',
  /** Add real profiles as { label, href }. Nothing is rendered while empty. */
  social: [] as { label: string; href: string }[],
}
export const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Fit Nation, ${contact.address}`)}`

/** Copyright-free ambient videos (Mixkit Free License). Sources are listed in IMAGE-CREDITS.md. */
export const videos = {
  ropes: { src: '/video/conditioning-ropes.mp4', poster: '/video/conditioning-ropes-poster.webp' },
  press: { src: '/video/overhead-press.mp4', poster: '/video/overhead-press-poster.webp' },
}

export const currency = { locale: 'en-IN', code: 'INR' }
export const formatINR = (n: number) =>
  new Intl.NumberFormat(currency.locale, { style: 'currency', currency: currency.code, maximumFractionDigits: 0 }).format(n)

export const nav = [
  { id: 'club', label: 'The club' },
  { id: 'programs', label: 'Programs' },
  { id: 'space', label: 'The space' },
  { id: 'membership', label: 'Membership' },
  { id: 'faq', label: 'FAQ' },
]

export type ImageKey = keyof typeof manifest
export const images = manifest

export interface Program {
  id: string
  name: string
  kicker: string
  description: string
  image: ImageKey
  imageAlt: string
  details: { label: string; value: string }[]
  focus: string[]
}

export const programs: Program[] = [
  {
    id: 'strength',
    name: 'Strength Training',
    kicker: 'Barbell · Rack · Platform',
    description:
      'Structured barbell and free-weight work built around the big lifts. You get a clear progression, technique coaching on every main movement and the floor space to train properly.',
    image: 'program-strength',
    imageAlt: 'Lifter setting up over a loaded barbell on a rubber gym floor',
    details: [
      { label: 'Format', value: 'Small group, coached' },
      { label: 'Session', value: '60 minutes' },
      { label: 'Level', value: 'Beginner to advanced' },
    ],
    focus: ['Squat, press, pull, hinge', 'Progressive loading plans', 'Technique checks'],
  },
  {
    id: 'conditioning',
    name: 'CrossFit',
    kicker: 'Ropes · Sleds · Intervals',
    description:
      'CrossFit-style training led by certified trainers: interval circuits that build engine and work capacity, using ropes, sleds and bodyweight work. Every session is scaled to the individual, so everyone trains hard at their own level.',
    image: 'program-conditioning',
    imageAlt: 'Athlete working battle ropes outdoors under a concrete structure',
    details: [
      { label: 'Format', value: 'Coach-led classes' },
      { label: 'Session', value: '45 minutes' },
      { label: 'Level', value: 'All levels, scaled' },
    ],
    focus: ['Interval circuits', 'Rope, sled and bodyweight work', 'Scaled intensity'],
  },
  {
    id: 'personal',
    name: 'Personal Training',
    kicker: 'One coach · One plan',
    description:
      'One-to-one coaching with a plan written around your goals, schedule and training history. Ideal if you want accountability, faster technique progress or support around an injury history.',
    image: 'program-personal',
    imageAlt: 'Athlete in black and white holding a barbell across the shoulders',
    details: [
      { label: 'Format', value: 'One to one' },
      { label: 'Session', value: '60 minutes' },
      { label: 'Level', value: 'Any, fully tailored' },
    ],
    focus: ['Assessment and goal setting', 'Individual programming', 'Regular progress reviews'],
  },
  {
    id: 'mobility',
    name: 'Mobility & Recovery',
    kicker: 'Range · Control · Reset',
    description:
      'Guided sessions to improve range of motion and joint control, and to help you recover between harder training days. Slower, deliberate work that makes everything else feel better.',
    image: 'program-mobility',
    imageAlt: 'Group training mobility movements on mats in a bright loft studio',
    details: [
      { label: 'Format', value: 'Guided studio sessions' },
      { label: 'Session', value: '40 minutes' },
      { label: 'Level', value: 'Open to everyone' },
    ],
    focus: ['Hips, spine and shoulders', 'Breathing and control', 'Active recovery'],
  },
]

export type MembershipId = 'gym' | 'pt'

export interface Membership {
  id: MembershipId
  name: string
  blurb: string
  /** Total price in INR for each term length. Gym prices are the client's; personal training prices are SAMPLE. */
  prices: Record<Duration, number>
  features: string[]
}

/** Term lengths on offer, in months. */
export const durations = [1, 3, 6, 12] as const
export type Duration = (typeof durations)[number]

/** Gym access and personal training are separate options, each sold in the same four terms. */
export const memberships: Membership[] = [
  {
    id: 'gym',
    name: 'Gym membership',
    blurb: 'Full access to the training floor for people who like to train independently.',
    prices: { 1: 1999, 3: 2999, 6: 5999, 12: 6999 },
    features: [
      'Gym floor access during opening hours',
      'Weight training and cardio zones',
      'Induction session on joining',
      'Lockers and shower facilities',
    ],
  },
  {
    id: 'pt',
    name: 'Personal training',
    blurb: 'One-to-one coaching with a plan built around your goals, schedule and training history.',
    // SAMPLE prices: the client has not set personal training fees yet.
    prices: { 1: 7999, 3: 21999, 6: 41999, 12: 74999 },
    features: [
      'Sessions with a dedicated coach',
      'Individual training plan',
      'Regular progress reviews',
      'Flexible session scheduling',
    ],
  },
]

export const durationLabel = (months: number) => (months === 1 ? '1 month' : `${months} months`)

/** Per-month equivalent and the saving against paying the 1-month price every month. */
export const priceFor = (m: Membership, months: Duration) => {
  const total = m.prices[months]
  return { total, perMonth: Math.round(total / months), saving: Math.max(0, m.prices[1] * months - total) }
}

/** Id used to preselect a membership term in the enquiry dialog, e.g. "gym-12". */
export const planId = (m: Membership, months: Duration) => `${m.id}-${months}`
export const planLabel = (id: string) => {
  const [key, months] = id.split('-')
  const m = memberships.find((x) => x.id === key)
  return m ? `${m.name}, ${durationLabel(Number(months))}` : ''
}

export const faqs = [
  {
    q: 'How does membership work?',
    a: 'Choose gym membership for access to the training floor, or personal training for one-to-one coaching, then pick a 1, 3, 6 or 12 month term. Longer terms cost less per month. The team will confirm joining steps and your start date when you enquire.',
  },
  {
    q: 'What happens in a trial session?',
    a: 'A trial is a relaxed first visit. A coach shows you around, talks through your goals and takes you through a short session in the program you are most curious about, so you can see if the club suits you before committing.',
  },
  {
    q: 'I am a beginner. Is this the right place?',
    a: 'Yes. Every program is scaled, and coaches introduce movements step by step. You do not need to be fit before you walk in. Tell us your experience level when you book and we will point you to a good starting program.',
  },
  {
    q: 'Do I need a personal trainer?',
    a: 'No. Personal training is optional. Many members train on the floor on their own or join coached classes. One-to-one coaching is there if you want a plan built around you.',
  },
  {
    q: 'What are the opening hours?',
    a: `We are open ${contact.hours.map((h) => `${h.label.toLowerCase()}, ${h.time}`).join(' and ')} (closing at midnight). Class times vary by program, so ask about the current timetable when you book your trial.`,
  },
]
