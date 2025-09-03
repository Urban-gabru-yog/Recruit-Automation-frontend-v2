// utils/phoneValidator.js - Frontend phone normalization utility

/**
 * Normalize phone number by extracting just the digits
 * This helps detect duplicate numbers regardless of country code or formatting
 * @param {string} phone - Phone number to normalize
 * @returns {string} - Normalized phone number (digits only, without country code if Indian number)
 */
export function normalizePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // If empty after cleaning, return empty
  if (!digitsOnly) {
    return '';
  }

  // Handle Indian phone numbers - extract the 10-digit mobile number
  // Indian mobile numbers are 10 digits and start with 6-9
  if (digitsOnly.length >= 10) {
    // Check for Indian country code patterns
    if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
      // +91XXXXXXXXXX format - extract last 10 digits
      const mobileNumber = digitsOnly.slice(2);
      if (mobileNumber.length === 10 && /^[6-9]/.test(mobileNumber)) {
        return mobileNumber;
      }
    } else if (digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly)) {
      // Direct 10-digit Indian mobile number
      return digitsOnly;
    } else if (digitsOnly.length > 10) {
      // Try to extract last 10 digits if they form a valid Indian mobile number
      const last10 = digitsOnly.slice(-10);
      if (/^[6-9]/.test(last10)) {
        return last10;
      }
    }
  }

  // For non-Indian or unclear patterns, return the full digits
  // This ensures we still catch duplicates even for international numbers
  return digitsOnly;
}

/**
 * Basic phone number validation
 * @param {string} phone - Phone number to validate
 * @returns {object} - Validation result
 */
export function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      error: 'Phone number is required',
      normalized: ''
    };
  }

  const trimmed = phone.trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Phone number is required',
      normalized: ''
    };
  }

  // ✅ Strict validation - must contain only digits, +, -, spaces, and parentheses
  const validCharsRegex = /^[+\-\s\d()]+$/;
  if (!validCharsRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Phone number can only contain digits, +, -, spaces, and parentheses',
      normalized: ''
    };
  }

  const digitsOnly = phone.replace(/\D/g, '');
  
  // ✅ Must have at least some digits
  if (!digitsOnly || digitsOnly.length === 0) {
    return {
      isValid: false,
      error: 'Phone number must contain digits',
      normalized: ''
    };
  }

  // ✅ Strict length validation
  if (digitsOnly.length < 10) {
    return {
      isValid: false,
      error: 'Phone number must be at least 10 digits',
      normalized: digitsOnly
    };
  }

  if (digitsOnly.length > 15) {
    return {
      isValid: false,
      error: 'Phone number cannot exceed 15 digits',
      normalized: digitsOnly
    };
  }

  // ✅ For Indian numbers, validate the pattern
  if (digitsOnly.length === 10) {
    // Must start with 6, 7, 8, or 9 for Indian mobile numbers
    if (!/^[6-9]/.test(digitsOnly)) {
      return {
        isValid: false,
        error: 'Invalid Indian mobile number (must start with 6, 7, 8, or 9)',
        normalized: digitsOnly
      };
    }
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    // +91 format - check if the mobile number part is valid
    const mobileNumber = digitsOnly.slice(2);
    if (!/^[6-9]/.test(mobileNumber)) {
      return {
        isValid: false,
        error: 'Invalid Indian mobile number (must start with 6, 7, 8, or 9)',
        normalized: digitsOnly
      };
    }
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    // 0XXXXXXXXXX format (with leading zero)
    const mobileNumber = digitsOnly.slice(1);
    if (!/^[6-9]/.test(mobileNumber)) {
      return {
        isValid: false,
        error: 'Invalid Indian mobile number (must start with 6, 7, 8, or 9)',
        normalized: digitsOnly
      };
    }
  } else if (digitsOnly.length === 13 && digitsOnly.startsWith('910')) {
    // 910XXXXXXXXXX format
    const mobileNumber = digitsOnly.slice(3);
    if (!/^[6-9]/.test(mobileNumber)) {
      return {
        isValid: false,
        error: 'Invalid Indian mobile number (must start with 6, 7, 8, or 9)',
        normalized: digitsOnly
      };
    }
  }

  const normalized = normalizePhoneNumber(phone);
  
  return {
    isValid: true,
    error: null,
    normalized: normalized
  };
}
