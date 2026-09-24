// Kateryna Yeromenko's own tattoo portfolio (real finished work on clients).
export const katerynaPortfolio = Array.from({ length: 18 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0');
  return { src: `/images/kateryna/portfolio-${n}.jpeg`, alt: `Робота Катерини Єрьоменко №${i + 1}` };
});
