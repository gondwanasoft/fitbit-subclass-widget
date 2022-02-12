import document from 'document';

export const constructWidgets = (widgetType, construct) => {
  // construct: function taking <use> element object as arg.
  // TODO 9 consider automatically constructing all widgets by default; don't do so if a particular flag is set
  // TODO 9 it's inefficient to search all of document; could there be a better way? manually-callable function to construct, that takes an arg? className in elements that contain widgets?
  const widgets = document.getElementsByTypeName(widgetType);
  widgets.forEach(widget => {
    if (widget.id !== widget.type) {    // old firmware will find the <use> AND the <symbol> for each widget instance
      const classes = widget.class.split(' ');  // array of all class names
      if (classes.indexOf('widget-auto') >= 0) {
        widget.class = widget.class;    // bring forward (ie, trigger) application of CSS styles
        construct(widget);
        // TODO 9 distinguish between 'construct' (add members to el) and 'draw' (lay out visible elements)
      }
    }
  });
}