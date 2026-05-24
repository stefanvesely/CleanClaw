export type PlanVariantKind = 'low-token-fix' | 'full-fix';

export interface PlanVariant {
  kind: PlanVariantKind;
  label: string;
  intent: string;
  tokenProfile: 'low' | 'high';
  tradeoffs: string[];
  recommendedWhen: string[];
}

export function defaultPlanVariants(): PlanVariant[] {
  return [
    {
      kind: 'low-token-fix',
      label: 'Low-token fix',
      intent: 'Make the smallest useful change that addresses the approved why.',
      tokenProfile: 'low',
      tradeoffs: [
        'Lower token and review cost.',
        'Smaller scope and faster validation.',
        'May leave adjacent cleanup or deeper design issues for a later plan.',
      ],
      recommendedWhen: [
        'The issue is narrow.',
        'The user wants a fast, contained repair.',
        'The approved why does not require broader redesign.',
      ],
    },
    {
      kind: 'full-fix',
      label: 'Full fix',
      intent: 'Address the approved why more completely, including related files and cleanup when justified.',
      tokenProfile: 'high',
      tradeoffs: [
        'Higher token and review cost.',
        'Broader scope and more validation.',
        'Better when the issue crosses module boundaries or repeated symptoms point to a deeper cause.',
      ],
      recommendedWhen: [
        'The issue is systemic.',
        'The user wants the durable repair now.',
        'The approved why justifies broader investigation and validation.',
      ],
    },
  ];
}

export function getPlanVariant(kind: PlanVariantKind): PlanVariant {
  const variant = defaultPlanVariants().find(candidate => candidate.kind === kind);
  if (!variant) {
    throw new Error(`Unknown plan variant: ${kind}`);
  }

  return variant;
}

export function formatPlanVariantChoices(variants: PlanVariant[] = defaultPlanVariants()): string {
  return variants.map((variant, index) => [
    `${index + 1}. ${variant.label}`,
    `   Intent: ${variant.intent}`,
    `   Token profile: ${variant.tokenProfile}`,
    '   Tradeoffs:',
    ...variant.tradeoffs.map(tradeoff => `   - ${tradeoff}`),
  ].join('\n')).join('\n\n');
}
