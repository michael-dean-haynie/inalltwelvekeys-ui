/**
 * Calculate the positive modulus residue.
 * Example: -2 of mod 12 would give 10 (not -10)
 * @param dividend the input value being divided
 * @param modulus the number by which the dividend is divided
 */
export function posModRes(dividend: number, modulus: number): number {
  return ((dividend % modulus) + modulus) % modulus;
}

export function shuffleAlgo() {
  return Math.random() - 0.5;
}
