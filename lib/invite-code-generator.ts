
export function generateInviteCode(): string {
  // Characters to use (excluding ambiguous characters like 0/O, 1/I, etc.)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  
  // Generate first part (3 characters)
  let part1 = '';
  for (let i = 0; i < 3; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Generate second part (3 characters)
  let part2 = '';
  for (let i = 0; i < 3; i++) {
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Combine with hyphen
  return `${part1}-${part2}`;
}

/**
 * Validates an invitation code format
 * @param code The code to validate
 */
export function isValidInviteCode(code: string): boolean {
  // Check format: XXX-XXX (where X is alphanumeric)
  const pattern = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/;
  return pattern.test(code);
}