import { constructWidgets } from '../construct-widgets';

const createLines = (useEl, origProto) => {
  // Returns lines: an object containing the widget's private and public (API) members.
  // API's prototype will be set to origProto so that useEl's members will be available if not implemented in API.
  const lines = {};

  // PRIVATE MEMBERS:

  // TODO 3.9 purge _ ?
  // TODO 3.3 ensure widget object is separate to useEl, but has useEl as proto

  let createLineContainer = id => {
    // id: string: id of <line> element
    let _lineEl = useEl.getElementById(id);

    return {  // this object gets assigned to lines._lineNContainer
      get lineEl() {return _lineEl;},             // only for internal use; don't expose publicly
      get API() {   // public members
        return {
          pub: () => {console.log(`${id} pub`);},  // TODO 3.9 del pub
          get style() {   // c/- BarbWire; we only expose style.fill just to demonstrate restrictive API: calling code should be unable to access other style properties
            return {
              get fill() {return _lineEl.style.fill},
              set fill(color) {_lineEl.style.fill = color}
            }
          }
        }
      }
    }
  }

  lines._line1Container = createLineContainer('line1');
  lines._line1API = lines._line1Container.API;    // save this so we don't have to reconstruct the API object every time it's accessed

  lines._line2Container = createLineContainer('line2');
  lines._line2API = lines._line2Container.API;    // save this so we don't have to reconstruct the API object every time it's accessed

  //lines._objectImplementingX = findX(origProto);
  //console.log(`_objectImplementingX=${lines._objectImplementingX}`)

  // PUBLIC MEMBERS:

  lines._API = Object.create(origProto);  // the _API object will contain the public members and be linked into prototype chain

  Object.defineProperty(lines._API, 'z', { // overrides (hides) x previously available in the prototype chain
    get: function() {
      return lines._objectImplementingX;
    }
  });

  Object.defineProperty(lines._API, 'line1', {
    get: function() {   // we don't return the actual LineElement object so that callers can't access its x1, etc, which would mess things up
      return lines._line1API;
    },
    enumerable: true
  });

  Object.defineProperty(lines._API, 'line2', {
    get: function() {   // we don't return the actual LineElement object so that callers can't access its x1, etc, which would mess things up
      return lines._line2API;
    },
    enumerable: true
  });

  Object.defineProperty(lines._API, 'strokeWidth', {
    set: function(newValue) {
      lines._line1Container.lineEl.style.strokeWidth = lines._line2Container.lineEl.style.strokeWidth = newValue;
    },
    enumerable: true
  });

  lines._API.IAmALines = true    // TODO 4 This isn't needed; it just shows up in dumpProperties()

  // INITIALISATION:

  // Parse and process SVG config attributes:
  const attributes = useEl.getElementById('config').text.split(';')
  attributes.forEach(attribute => {
    const colonIndex = attribute.indexOf(':')
    const attributeName = attribute.substring(0, colonIndex).trim();
    const attributeValue = attribute.substring(colonIndex+1).trim();

    switch(attributeName) {
      case 'stroke-width':
        lines._API.strokeWidth = Number(attributeValue);
        break;
      case 'x1':
        lines._line1Container.lineEl.x1 = Number(attributeValue);
        lines._line2Container.lineEl.x1 = Number(attributeValue);
        break;
      case 'y1':
        lines._line1Container.lineEl.y1 = Number(attributeValue);
        lines._line2Container.lineEl.y1 = Number(attributeValue) + 10;
        break;
      case 'x2':
        lines._line1Container.lineEl.x2 = lines._line2Container.lineEl.x2 = Number(attributeValue);
        break;
      case 'y2':
        lines._line1Container.lineEl.y2 = Number(attributeValue);
        lines._line2Container.lineEl.y2 = Number(attributeValue) + 10;
        break;
    }
  });

  return lines;
}

const constructLines = useEl => {
  // useEl: object corresponding to <use> SVG element.
  // Create new lines object and splice its closure into el's prototype chain:
  const origProto = Object.getPrototypeOf(useEl);
  const lines = createLines(useEl, origProto);
  Object.setPrototypeOf(useEl, lines._API);
}

constructWidgets('lines', constructLines);

function findX(obj) {
  let proto = obj
  let level = 0
  do {
    for (const memberName in proto) {
      //console.log('in for()')
      if (proto.hasOwnProperty('x')) return proto;
    }
    proto = Object.getPrototypeOf(proto)
  } while (proto)
}