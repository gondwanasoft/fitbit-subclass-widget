import { constructWidgets } from '../construct-widgets';

const createLines = (el, origProto) => {
  const lines = {};

  // These members shouldn't be publicly accessible:
  // TODO 3 rename _closure to API?
  // TODO 3.9 purge _ ?
  lines._closure = Object.create(origProto);  // this will contain the public members and be linked into prototype chain

  lines._line1Container = {   // closure: API will be exposed publicly; other members are private
    // TODO 3 redo _line1Container as function closure (like _line2Container)
    lineEl: el.getElementById('line1'),
    API: {  // public members
      pub: () => {
        console.log(`style=${el.style}`)
        //el.style.fill = '#ffff00';
      }
    }
  }

  lines._line2Container = () => { // closure: members not in API will be private
    let lineEl = el.getElementById('line2');
    let API = {   // public members
      pub: () => {
        console.log('line2 pub');
        lineEl.style.fill = 'yellow';
      },
      get style() {return lineEl.style;}  // TODO 3 make style a closure, so some of its members can be kept private
    };
    return API;
  }

  lines.line2 = lines._line2Container();

  //lines._objectImplementingX = findX(origProto);
  //console.log(`_objectImplementingX=${lines._objectImplementingX}`)

  // These members will be publicly accessible, because they're in the closure which is linked into the prototype chain:
  Object.defineProperty(lines._closure, 'z', { // overrides (hides) x previously available in the prototype chain
    get: function() {
      return lines._objectImplementingX;
    }
  });

  Object.defineProperty(lines._closure, 'line1', {
    get: function() {   // we don't return the actual LineElement object so that callers can't access its x1, etc, which would mess things up
      return lines._line1Container.API;
    },
    enumerable: true
  });

  Object.defineProperty(lines._closure, 'line2', {
    get: function() {   // we don't return the actual LineElement object so that callers can't access its x1, etc, which would mess things up
      return lines._line2Container();   // TODO 3 it could be inefficient to execute this every time; is there a cleaner way to get API?
    },
    enumerable: true
  });

  Object.defineProperty(lines._closure, 'strokeWidth', {
    set: function(newValue) {
      lines._line1Container.lineEl.style.strokeWidth = newValue;
      lines.line2.style.strokeWidth = newValue;
    },
    enumerable: true
  });

  //lines._closure.IAmALines = true    // This isn't needed; it just shows up in dumpProperties()

  // Parse and process SVG config attributes:
  const attributes = el.getElementById('config').text.split(';')
  attributes.forEach(attribute => {
    const colonIndex = attribute.indexOf(':')
    const attributeName = attribute.substring(0, colonIndex).trim();
    const attributeValue = attribute.substring(colonIndex+1).trim();

    switch(attributeName) {
      case 'stroke-width':
        lines._closure.strokeWidth = Number(attributeValue);
        break;
      case 'x1':
        lines._line1Container.lineEl.x1 = Number(attributeValue);
        break;
      case 'y1':
        lines._line1Container.lineEl.y1 = Number(attributeValue);
        break;
      case 'x2':
        lines._line1Container.lineEl.x2 = Number(attributeValue);
        break;
      case 'y2':
        lines._line1Container.lineEl.y2 = Number(attributeValue);
        break;
    }
  });

  return lines;
}

const constructLines = el => {
  // Create new lines object and splice its closure into el's prototype chain:
  const origProto = Object.getPrototypeOf(el);
  const lines = createLines(el, origProto);
  Object.setPrototypeOf(el, lines._closure);
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

// TODO 3 test with multiple <use> instances (instances shouldn't interfere with each other)