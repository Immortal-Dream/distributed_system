/*
    Checklist:

    1. Serialize strings
    2. Serialize numbers
    3. Serialize booleans
    4. Serialize (non-circular) Objects
    5. Serialize (non-circular) Arrays
    6. Serialize undefined and null
    7. Serialize Date, Error objects
    8. Serialize (non-native) functions
    9. Serialize circular objects and arrays
    10. Serialize native functions
*/
let idCounter = 0;
let circularReferences = new WeakMap();

function serialize(value) {
  circularReferences = new WeakMap();
  idCounter = 0;
  const result = serializeHelper(value);
  return JSON.stringify(result);
}

/**
 * Helper function for serialize().
 * Recursively traverses the value and builds a structured object
 * that includes type tags, values, and (if applicable) unique ids.
 *
 * @param {*} value - The value to serialize.
 * @returns {object} - A structured representation of the value.
 */
function serializeHelper(value) {
  // Handle null and undefined explicitly.
  if (value === null) return { type: "null" };
  if (value === undefined) return { type: "undefined" };

  const type = typeof value;

  // Handle primitive types.
  if (type === 'number') return { type: "number", value: value.toString() };
  if (type === 'string') return { type: "string", value: value };
  if (type === 'boolean') return { type: "boolean", value: value.toString() };

  // Handle functions.
  if (type === 'function') {
    return {
      // Distinguish native functions from non-native ones.
      type: value.toString().includes('[native code]') ? "nativefunction" : "function",
      value: value.toString()
    };
  }

  // Handle objects (this covers arrays, Date, Error, plain objects, etc.)
  if (type === 'object') {
    // If seen this object has been seen before, return a reference.
    if (circularReferences.has(value)) {
      return { type: "reference", id: circularReferences.get(value) };
    }
    // Assign a new unique id to this object.
    const currentId = `id${++idCounter}`;
    circularReferences.set(value, currentId);

    // Special handling for Date objects.
    if (value instanceof Date) {
      return { type: "date", id: currentId, value: value.toISOString() };
    }

    // Special handling for Error objects.
    if (value instanceof Error) {
      return {
        type: "error",
        id: currentId,
        value: {
          name: value.name,
          message: value.message,
          // Capture additional enumerable properties.
          ...Object.fromEntries(Object.entries(value))
        }
      };
    }

    // Handling for arrays.
    if (Array.isArray(value)) {
      return {
        type: "array",
        id: currentId,
        value: value.map(serializeHelper)
      };
    }

    // Generic object handling: serialize each own property.
    const obj = {};
    for (const key in value) {
      if (Object.hasOwnProperty.call(value, key)) {
        const serializedValue = serializeHelper(value[key]);
        // stringify each property’s serialized representation.
        obj[key] = JSON.stringify(serializedValue);
      }
    }
    return { type: "object", id: currentId, value: obj };
  }

  throw new Error(`Unsupported type: ${type}`);
}

function deserialize(serializedString) {
  let parsed;
  try {
    parsed = JSON.parse(serializedString);
  } catch (e) {
    throw new SyntaxError("Invalid JSON format");
  }

  const objectMap = new Map();
  return deserializeHelper(parsed, objectMap);
}
/**
 * Helper function for deserialize().
 * Rebuilds the original value from the structured serialized object.
 *
 * @param {object} data - The structured serialized representation.
 * @param {Map} objectMap - A map to store objects by id for resolving references.
 * @returns {*} - The deserialized value.
 */
function deserializeHelper(data, objectMap) {
  if (!data || typeof data !== 'object' || !data.type) {
    throw new Error("Invalid serialized structure");
  }

  switch (data.type) {
    case "null":
      return null;
    case "undefined":
      return undefined;
    case "number":
      return Number(data.value);
    case "string":
      return data.value;
    case "boolean":
      return data.value === "true";
    
    // Reconstruct functions using eval (note: use caution with eval).
    case "function":
      try {
        return eval(`(${data.value})`);
      } catch {
        return () => { throw Error("Deserialization failed") };
      }
    
    // just simply return the stored string representation.
    case "nativefunction":
      return data.value;
    
    // Reconstruct Date objects.
    case "date": {
      const date = new Date(data.value);
      if (data.id) objectMap.set(data.id, date);
      return date;
    }
    
    // Reconstruct Error objects.
    case "error": {
      const error = new Error(data.value.message);
      // Apply all properties from the serialized error.
      Object.assign(error, data.value);
      if (data.id) objectMap.set(data.id, error);
      return error;
    }
    
    // Reconstruct arrays.
    case "array": {
      const arr = [];
      if (data.id) objectMap.set(data.id, arr);
      // Map each serialized element back to its value.
      arr.push(...data.value.map(item => deserializeHelper(item, objectMap)));
      return arr;
    }
    
    // Reconstruct generic objects.
    case "object": {
      const obj = {};
      if (data.id) objectMap.set(data.id, obj);
      // Each property was stringified; parse it back before deserializing.
      for (const [key, valueStr] of Object.entries(data.value)) {
        const parsedValue = JSON.parse(valueStr);
        obj[key] = deserializeHelper(parsedValue, objectMap);
      }
      return obj;
    }
    
    // Resolve a reference using the stored object id.
    case "reference": {
      const ref = objectMap.get(data.id);
      if (!ref) throw new Error("Unresolved reference");
      return ref;
    }
    
    default:
      throw new Error(`Unknown type: ${data.type}`);
  }
}

module.exports = {
  serialize: serialize,
  deserialize: deserialize,
};
