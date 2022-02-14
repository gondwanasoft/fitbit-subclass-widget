import { constructWidgets } from '../construct-widgets';

const constructLines = (useEl) => {
  // Create new lines object.
  // useEl: object corresponding to <use> SVG element.
  // API's prototype will be set to useEl so that useEl's members SHOULD BE available if not implemented in API (but Fitbit blocks this).

  // PRIVATE MEMBERS:

  let _createLineContainer = id => {
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

  const _line1Container = _createLineContainer('line1');
  const _line1API = _line1Container.API;    // save this so we don't have to reconstruct the API object every time it's accessed

  const _line2Container = _createLineContainer('line2');
  const _line2API = _line2Container.API;    // save this so we don't have to reconstruct the API object every time it's accessed

  //lines._objectImplementingX = findX(origProto);
  //console.log(`_objectImplementingX=${lines._objectImplementingX}`)

  // PUBLIC MEMBERS:

  //lines._API = Object.create(origProto);  // the _API object will contain the public members and be linked into prototype chain
  const _API = Object.create(useEl);  // _API contains public members and is linked into prototype chain. useEl is prototype so useEl members SHOULD BE callable on _API (but Fitbit blocks this).
  useEl.getWidget = () => _API;   // kludge to provide access to widget's API via the useEl object
  _API.getElement = () => useEl;  // kludge to provide access to useEl's API via the widget object

  Object.defineProperty(_API, 'x', {  // this shows that we can overload x at widget level, and still have access to the prototype (Fitbit) API implementation
    set: function(newValue) {
      useEl.x = newValue;
    }
  });

  Object.defineProperty(_API, 'line1', {
    get: function() {   // we don't return the actual LineElement object so that callers can't access its x1, etc, which would mess things up
      return _line1API;
    },
    enumerable: true
  });

  Object.defineProperty(_API, 'line2', {
    get: function() {   // we don't return the actual LineElement object so that callers can't access its x1, etc, which would mess things up
      return _line2API;
    },
    enumerable: true
  });

  Object.defineProperty(_API, 'strokeWidth', {
    set: function(newValue) {
      _line1Container.lineEl.style.strokeWidth = _line2Container.lineEl.style.strokeWidth = newValue;
    },
    enumerable: true
  });

  //lines._API.IAmALines = true    // TODO 8 This isn't needed; it just shows up in dumpProperties()

  // INITIALISATION:

  // Parse and process SVG config attributes:
  const attributes = useEl.getElementById('config').text.split(';')
  attributes.forEach(attribute => {
    const colonIndex = attribute.indexOf(':')
    const attributeName = attribute.substring(0, colonIndex).trim();
    const attributeValue = attribute.substring(colonIndex+1).trim();

    switch(attributeName) {
      case 'stroke-width':
        _API.strokeWidth = Number(attributeValue);
        break;
      case 'x1':
        _line1Container.lineEl.x1 = _line2Container.lineEl.x1 = Number(attributeValue);
        break;
      case 'y1':
        _line1Container.lineEl.y1 = Number(attributeValue);
        _line2Container.lineEl.y1 = Number(attributeValue) + 10;
        break;
      case 'x2':
        _line1Container.lineEl.x2 = _line2Container.lineEl.x2 = Number(attributeValue);
        break;
      case 'y2':
        _line1Container.lineEl.y2 = Number(attributeValue);
        _line2Container.lineEl.y2 = Number(attributeValue) + 10;
        break;
    }
  });
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

// TODO 9 purge _ from names?