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
 * Traverses the value recursively and converts it into a structured object
 * that encodes its type, value, and unique IDs for circular references.
 *
 * @param {*} value - The value to serialize.
 * @returns {object} - A structured object representing the serialized value.
 */
function serializeHelper(value) {
  // Handle null and undefined explicitly.
  if (value === null) return { type: "null" };
  if (value === undefined) return { type: "undefined" };

  const type = typeof value;

  // Handle primitive types: number, string, boolean.
  if (type === 'number') return { type: "number", value: value.toString() };
  if (type === 'string') return { type: "string", value: value };
  if (type === 'boolean') return { type: "boolean", value: value.toString() };

  // Handle functions.
  if (type === 'function') {
    return {
      // Check if the function is native (has "[native code]" in its string).
      type: value.toString().includes('[native code]') ? "nativefunction" : "function",
      value: value.toString()
    };
  }

  // Handle objects (includes arrays, dates, errors, and plain objects).
  if (type === 'object') {
    // If this object has already been seen, return a reference.
    if (circularReferences.has(value)) {
      return { type: "reference", id: circularReferences.get(value) };
    }
    // Assign a new unique id for this object.
    const currentId = `id${++idCounter}`;
    circularReferences.set(value, currentId);

    // Special handling for Date objects.
    if (value instanceof Date) {
      return { type: "date", value: value.toISOString() };
    }
    // Special handling for Error objects.
    // Capture standard properties (name, message) and any custom properties.
    if (value instanceof Error) {
      return {
        type: "error",
        value: {
          name: value.name,
          message: value.message,
          // Spread any enumerable own properties.
          ...Object.fromEntries(Object.entries(value))
        }
      };
    }
    // Handling for arrays.
    if (Array.isArray(value)) {
      return {
        type: "array",
        value: value.map(serializeHelper)
      };
    }

    // Generic object handling: serialize each own property.
    const obj = {};
    for (const key in value) {
      if (Object.hasOwnProperty.call(value, key)) {
        const serializedValue = serializeHelper(value[key]);
        obj[key] = JSON.stringify(serializedValue);
      }
    }
    return { type: "object", value: obj };
  }

  // If the type is not supported, throw an error.
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
 * Traverses the structured data and rebuilds the original value recursively.
 *
 * @param {object} data - The structured serialized object.
 * @param {Map} objectMap - A map for tracking objects by id to handle circular references.
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
    
    // Reconstruct non-native functions via eval.
    case "function":
      try {
        return eval(`(${data.value})`);
      } catch {
        return () => { throw Error("Deserialization failed") };
      }
    
    // For native functions, return the raw string value.
    // (In a more robust implementation, you might map this back to the actual function.)
    case "nativefunction":
      return data.value;
    
    // Reconstruct Date objects.
    case "date":
      return new Date(data.value);
    
    // Reconstruct Error objects, including custom properties.
    case "error": {
      const error = new Error(data.value.message);
      // Assign all serialized properties to the new Error object.
      Object.assign(error, data.value);
      return error;
    }
    
    // Reconstruct arrays by mapping each element.
    case "array":
      return data.value.map(item => deserializeHelper(item, objectMap));
    
    // Reconstruct generic objects.
    case "object": {
      const obj = {};
      // For each property, the value was stringified, so parse it back before deserialization.
      for (const [key, valueStr] of Object.entries(data.value)) {
        const parsedValue = JSON.parse(valueStr);
        obj[key] = deserializeHelper(parsedValue, objectMap);
      }
      return obj;
    }
    
    // Resolve circular references by retrieving the referenced object.
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
