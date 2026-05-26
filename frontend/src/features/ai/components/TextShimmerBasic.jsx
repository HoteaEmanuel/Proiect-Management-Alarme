import { TextShimmer } from "@components/TextShimmer";

export function TextShimmerBasic({ text }) {
  return (
    <TextShimmer className="font-mono text-sm" duration={1}>
      {text}
    </TextShimmer>
  );
}
