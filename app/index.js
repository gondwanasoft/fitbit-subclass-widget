import document from 'document'
import './widgets/lines'

const myLinesEl = document.getElementById('myLines')
const myLinesWidget = myLinesEl.getWidget()
myLinesWidget.strokeWidth = 10
myLinesWidget.line1.pub()
myLinesWidget.line2.pub()
myLinesWidget.line1.style.fill = 'cyan';
myLinesWidget.line2.style.fill = 'green';
myLinesWidget.x = 168;    // works because widget explicitly implements x (and passes it to useEl)
//myLinesWidget.y = 168;    // crashes because widget doesn't implement y, and Fitbit API can only be called on useEl directly
//myLinesEl.y = 168;    // works, but unfortunate to have to call some things against El and other things against widget
//myLinesWidget.getElement().y = 168;   // works but ugly

//dumpProperties('myLines', myLinesEl, true)

//let objectImplementingX = findX(myLinesEl);
//console.log(`objectImplementingX=${objectImplementingX}`)
//dumpProperties('objectImplementingX', objectImplementingX)

//console.log(`type=${myLinesEl.type}`)   // returns 'lines'
//dumpProperties('myLinesEl', myLinesEl, true);
let z = myLinesEl.z;
//console.log(`z=${z} ${z.hasOwnProperty('x')}`);
//dumpProperties('z', z)

function dumpProperties(name, obj, types) {  // This isn't needed; it's just to show how everything links together
  // name: string to display in output heading
  // obj: object for which properties are to be displayed
  // types: try to determine type of each property: can cause hard crashes with some objects.
  // TODO 9 When used on physical device, lengthy console output can be lost. Fix: use timeout in 'do' loop.
  let proto = obj
  let level = 0
  let type = '?'
  console.log(`Members of ${name}:`)
  do {
    console.log(`  Level ${level++}:`)
    for(const memberName in proto) {
      //if (memberName === 'textContent') continue;
      if (proto.hasOwnProperty(memberName)) {
        // memberName 'text' crashes sim
        if (types)
          try {
            const member = obj[memberName]  // get member from top-level obj rather than proto, as the latter crashes if not a function
            type = typeof member
          } catch(e) {
            //console.log('in catch')
            type = 'INACCESSIBLE'
          }
        console.log(`    ${memberName} (${type})`)
      }
    }
    proto = Object.getPrototypeOf(proto)
    console.log('  ---------------')
  } while (proto)
}

function findX(obj) {
  let proto = obj
  let level = 0
  do {
    for (const memberName in proto) {
      if (proto.hasOwnProperty('x')) return proto;
    }
    proto = Object.getPrototypeOf(proto)
  } while (proto)
}

