export function checkForKeys(keys = [], obj = {}, verbose = false) {
    for (const key of keys) {
        if (!(key in obj)) {
            if (verbose) {
                console.warn(`Missing key: "${key}"`);
            }
            return false;
        }
    }
    return true;
}



export function sanitizeInputs(inputs) {
    let sanitized = {}
  const INPUT_TYPES = {
    PASSWORD: 'password',
    USERNAME: 'username',
    EMAIL: 'email',
  };
  //get user parameters from somewhere to only read neccesary keys 

  let active_keys = ['username', 'password']



  for (const key of active_keys) {
        if (!(key in inputs)) {
      throw new Error(`Missing required field: "${key}"`);
    }
    let val = inputs[key]
    let newValue = null;
    if (typeof val !== 'string' || !val.trim()) {
      throw new Error(`Invalid input: value "${val}" must be a string`);
    }

    switch (key) {
      case INPUT_TYPES.PASSWORD: {
        const cleaned = val.trim();
        if (cleaned.length < 2 || cleaned.length > 128) {
          throw new Error(`Password must be between 1 and 128 characters`);
        }
        newValue = cleaned
        break;
      }

      case INPUT_TYPES.USERNAME: {
        const cleaned = val.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
        if (cleaned.length < 3 || cleaned.length > 64) {
          throw new Error(`Username "${val}" must be 3–64 chars and only contain a-z, 0-9, ., _, -`);
        }
        newValue = cleaned
        break;
      }

      case INPUT_TYPES.EMAIL: {
        const cleaned = val.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleaned)) {
          throw new Error(`Invalid email format: "${val}"`);
        }
        newValue = cleaned
        break;
      }

      default:
        throw new Error(`Unsupported input type "${key}" for value "${inputs[key]}"`);
    }
    sanitized[key] = newValue
  }

  return sanitized;
}
