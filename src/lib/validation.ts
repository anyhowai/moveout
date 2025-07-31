// Form validation utilities
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  customValidator?: (value: string) => boolean
}

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Phone validation regex (US format)
const PHONE_REGEX = /^(\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/

// Item form validation rules
export const itemFormRules = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100
  },
  description: {
    maxLength: 1000
  },
  address: {
    required: true,
    maxLength: 200
  },
  'contactInfo.name': {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  'contactInfo.email': {
    pattern: EMAIL_REGEX
  },
  'contactInfo.phone': {
    pattern: PHONE_REGEX
  }
}

// Validate a single field
export function validateField(
  fieldName: string, 
  value: string, 
  rules: ValidationRule
): ValidationError | null {
  // Required field check
  if (rules.required && (!value || value.trim().length === 0)) {
    return {
      field: fieldName,
      message: `${getFieldLabel(fieldName)} is required`
    }
  }

  // Skip other validations if field is empty and not required
  if (!value || value.trim().length === 0) {
    return null
  }

  const trimmedValue = value.trim()

  // Min length check
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return {
      field: fieldName,
      message: `${getFieldLabel(fieldName)} must be at least ${rules.minLength} characters`
    }
  }

  // Max length check
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return {
      field: fieldName,
      message: `${getFieldLabel(fieldName)} must be no more than ${rules.maxLength} characters`
    }
  }

  // Pattern check
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return {
      field: fieldName,
      message: getPatternErrorMessage(fieldName)
    }
  }

  // Custom validator
  if (rules.customValidator && !rules.customValidator(trimmedValue)) {
    return {
      field: fieldName,
      message: `${getFieldLabel(fieldName)} is not valid`
    }
  }

  return null
}

// Validate entire form
export function validateForm(
  formData: Record<string, any>, 
  rules: Record<string, ValidationRule>
): ValidationResult {
  const errors: ValidationError[] = []

  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const value = getNestedValue(formData, fieldName)
    const error = validateField(fieldName, value || '', fieldRules)
    
    if (error) {
      errors.push(error)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Image file validation
export function validateImageFile(file: File): ValidationError | null {
  // File type validation
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      field: 'image',
      message: 'Please upload a valid image file (JPG, PNG, or WebP)'
    }
  }

  // File size validation (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    return {
      field: 'image',
      message: 'Image file must be smaller than 5MB'
    }
  }

  return null
}

// Helper functions
function getFieldLabel(fieldName: string): string {
  const labels: Record<string, string> = {
    title: 'Title',
    description: 'Description',
    address: 'Address',
    'contactInfo.name': 'Your name',
    'contactInfo.email': 'Email',
    'contactInfo.phone': 'Phone number'
  }
  
  return labels[fieldName] || fieldName
}

function getPatternErrorMessage(fieldName: string): string {
  const messages: Record<string, string> = {
    'contactInfo.email': 'Please enter a valid email address',
    'contactInfo.phone': 'Please enter a valid phone number (e.g., (415) 555-1234)'
  }
  
  return messages[fieldName] || `${getFieldLabel(fieldName)} format is invalid`
}

function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}