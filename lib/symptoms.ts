// Simple local knowledge base + triage logic (offline)
// NOTE: This is for information only, not a diagnosis.

export type Sex = "male" | "female" | "other";
export type Severity = "mild" | "moderate" | "severe";

export const SYMPTOMS = [
  "Fever",
  "Cough",
  "Sore throat",
  "Runny/blocked nose",
  "Headache",
  "Chest pain",
  "Shortness of breath",
  "Abdominal pain",
  "Nausea/Vomiting",
  "Diarrhoea",
  "Back pain",
  "Joint pain",
  "Skin rash",
  "Dizziness",
  "Fainting",
  "Blood in stool",
  "Blood in urine",
  "Severe bleeding",
];

export const RED_FLAGS = [
  "Severe chest pain",
  "Severe difficulty breathing",
  "Uncontrolled bleeding",
  "Fainting or confusion",
  "Severe dehydration (very dry mouth, no urine)",
  "Severe abdominal pain with guarding",
  "Stiff neck with fever",
];

function includesAny(hay: string[], needles: string[]) {
  return needles.some((n) => hay.includes(n));
}

export type CheckInput = {
  age: number;
  sex: Sex;
  symptoms: string[]; // selected from SYMPTOMS
  durationDays: number; // rough estimate
  severity: Severity;
  redFlags: string[]; // selected from RED_FLAGS
};

export type CheckResult = {
  urgency: "emergency" | "urgent" | "non-urgent" | "self-care";
  headline: string;
  reasons: string[];
  likelyCauses: string[];
  selfCare: string[];
  nextSteps: string[];
  disclaimer: string;
};

export function checkSymptoms(i: CheckInput): CheckResult {
  const reasons: string[] = [];
  const causes: string[] = [];
  const selfCare: string[] = [];
  const nextSteps: string[] = [];

  // 1) Immediate emergency rules
  if (i.redFlags.length > 0) {
    reasons.push("Red-flag symptoms present");
    nextSteps.push(
      "Seek emergency care immediately (call local emergency services)."
    );
    return {
      urgency: "emergency",
      headline: "Emergency care needed now",
      reasons,
      likelyCauses: inferCauses(i),
      selfCare: [],
      nextSteps,
      disclaimer: DISCLAIMER,
    };
  }

  // Chest pain + shortness of breath combo
  if (
    includesAny(i.symptoms, ["Chest pain"]) &&
    includesAny(i.symptoms, ["Shortness of breath"])
  ) {
    reasons.push("Chest pain with shortness of breath");
    nextSteps.push("Go to the nearest emergency department.");
    return {
      urgency: "emergency",
      headline: "Emergency care needed now",
      reasons,
      likelyCauses: ["Heart or lung problem (e.g., angina, asthma attack, PE)"],
      selfCare: [],
      nextSteps,
      disclaimer: DISCLAIMER,
    };
  }

  // 2) Urgent rules
  if (
    i.severity === "severe" ||
    (i.age < 2 && includesAny(i.symptoms, ["Fever"])) ||
    (i.durationDays >= 7 &&
      includesAny(i.symptoms, [
        "Cough",
        "Fever",
        "Headache",
        "Abdominal pain",
      ])) ||
    includesAny(i.symptoms, ["Blood in stool", "Blood in urine"])
  ) {
    reasons.push(
      i.severity === "severe"
        ? "Severe intensity"
        : "Age/duration/findings suggest urgent review"
    );
    nextSteps.push(
      "Arrange urgent review with a clinician (same day if possible)."
    );
    return {
      urgency: "urgent",
      headline: "See a clinician urgently",
      reasons,
      likelyCauses: inferCauses(i),
      selfCare: commonSelfCare(i),
      nextSteps,
      disclaimer: DISCLAIMER,
    };
  }

  // 3) Non-urgent vs self-care
  // If short duration and mild/moderate common viral pattern -> self-care
  const viralish = includesAny(i.symptoms, [
    "Fever",
    "Cough",
    "Sore throat",
    "Runny/blocked nose",
    "Headache",
  ]);
  if (
    i.durationDays <= 3 &&
    (i.severity === "mild" || i.severity === "moderate") &&
    viralish
  ) {
    reasons.push("Short duration and mild/moderate common viral symptoms");
    return {
      urgency: "self-care",
      headline: "Self-care likely sufficient",
      reasons,
      likelyCauses: ["Common cold or viral illness"],
      selfCare: commonSelfCare(i),
      nextSteps: [
        "If symptoms worsen or persist > 5–7 days, book a clinician review.",
      ],
      disclaimer: DISCLAIMER,
    };
  }

  // Otherwise: non-urgent
  reasons.push("No red flags; symptoms can be reviewed routinely");
  return {
    urgency: "non-urgent",
    headline: "Book a routine appointment",
    reasons,
    likelyCauses: inferCauses(i),
    selfCare: commonSelfCare(i),
    nextSteps: [
      "Book a routine appointment within 1–2 weeks.",
      "Seek urgent care if any red flags develop.",
    ],
    disclaimer: DISCLAIMER,
  };
}

function inferCauses(i: CheckInput): string[] {
  const list: string[] = [];
  if (
    includesAny(i.symptoms, [
      "Fever",
      "Cough",
      "Sore throat",
      "Runny/blocked nose",
    ])
  )
    list.push("Viral respiratory infection (e.g., cold/flu)");
  if (includesAny(i.symptoms, ["Headache"]))
    list.push("Tension headache or migraine");
  if (
    includesAny(i.symptoms, ["Abdominal pain", "Nausea/Vomiting", "Diarrhoea"])
  )
    list.push("Gastroenteritis or indigestion");
  if (includesAny(i.symptoms, ["Back pain", "Joint pain"]))
    list.push("Musculoskeletal pain or strain");
  if (includesAny(i.symptoms, ["Skin rash"]))
    list.push("Dermatitis or allergic reaction");
  if (includesAny(i.symptoms, ["Chest pain"]))
    list.push("Muscle strain, heartburn; consider cardiac if risk factors");
  if (includesAny(i.symptoms, ["Shortness of breath"]))
    list.push("Asthma/bronchitis; consider cardiac if with chest pain");
  return list.length ? list : ["General illness – needs clinical context"];
}

function commonSelfCare(i: CheckInput): string[] {
  const tips: string[] = [
    "Hydration: drink water regularly.",
    "Rest and monitor symptoms.",
    "Paracetamol for fever/pain per label (avoid duplication).",
  ];
  if (includesAny(i.symptoms, ["Cough", "Sore throat", "Runny/blocked nose"]))
    tips.push("Warm fluids, honey/lemon, saline nasal rinse can help.");
  if (includesAny(i.symptoms, ["Diarrhoea"]))
    tips.push("Oral rehydration salts if loose stools.");
  if (includesAny(i.symptoms, ["Skin rash"]))
    tips.push("Avoid triggers; gentle emollient; antihistamine if itchy.");
  return tips;
}

const DISCLAIMER =
  "This tool is for information only and not a medical diagnosis. If in doubt or symptoms worsen, seek professional care. In emergencies, contact local emergency services.";
