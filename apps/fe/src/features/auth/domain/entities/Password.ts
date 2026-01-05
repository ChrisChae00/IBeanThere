/**
 * Password Validation - Domain Layer
 * 
 * Pure validation logic for passwords, independent of API/framework.
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordRequirements {
  minLength: number;
  requireLetters: boolean;
  requireNumbers: boolean;
}

export const defaultPasswordRequirements: PasswordRequirements = {
  minLength: 8,
  requireLetters: true,
  requireNumbers: true,
};

/**
 * Validates a password against the given requirements
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = defaultPasswordRequirements
): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < requirements.minLength) {
    errors.push('password_too_short');
  }

  if (requirements.requireLetters && !/[a-zA-Z]/.test(password)) {
    errors.push('password_needs_letters');
  }

  if (requirements.requireNumbers && !/\d/.test(password)) {
    errors.push('password_needs_numbers');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if two passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * Calculate password strength (0-100)
 */
export function calculatePasswordStrength(password: string): number {
  let strength = 0;

  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 15;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/\d/.test(password)) strength += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;

  return Math.min(strength, 100);
}
