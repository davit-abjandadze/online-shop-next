import styled from "styled-components";

// ვიზუალურად დამალული, მაგრამ საძიებო სისტემებისა და screen reader-ისთვის
// ხილული ელემენტი — გვერდის h1-ისთვის, როცა დიზაინში ხილული სათაური არ არის.
export const VisuallyHiddenH1 = styled("h1")`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;
