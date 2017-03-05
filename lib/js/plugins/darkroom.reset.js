;(function(window, document, Darkroom, fabric) {
  'use strict';

  Darkroom.plugins['reset'] = Darkroom.Plugin.extend({
    initialize: function InitDarkroomHistoryPlugin() {
      this._initButtons();

      this.backHistoryStack = [];

      this._snapshotImage();

      this.darkroom.addEventListener('image:change', this._onImageChange.bind(this));
      this.darkroom.addEventListener('image:new', this._onImageNew.bind(this));
    },

    reset: function() {
      if (this.backHistoryStack.length === 0) {
        this.darkroom.dispatchEvent('image:new');
        return;
      }

      this.currentImage = this.backHistoryStack.pop();
      this._applyImage(this.currentImage);
      this._updateButtons();

      // Dispatch an event, so listeners will know the
      // currently viewed image has been changed.
      this.darkroom.dispatchEvent('history:navigate');
      this.reset();
    },

    _initButtons: function() {
      var buttonGroup = this.darkroom.toolbar.createButtonGroup();

      this.resetButton = buttonGroup.createButton({
        image: 'reload',
        disabled: true
      });

      this.resetButton.addEventListener('click', this.reset.bind(this));

      return this;
    },

    _updateButtons: function() {
      this.resetButton.disable((this.backHistoryStack.length === 0))
    },

    _snapshotImage: function() {
      var image = new Image();
      image.src = this.darkroom.snapshotImage();

      this.currentImage = image;
    },

    _onImageChange: function() {
      this.backHistoryStack.push(this.currentImage);
      this._snapshotImage();
      this._updateButtons();
    },

    _onImageNew: function() {
      this.backHistoryStack.length    = 0;

      this._updateButtons();
      this._snapshotImage();
    },

    // Apply image to the canvas
    _applyImage: function(image) {
      var canvas = this.darkroom.canvas;

      var imgInstance = new fabric.Image(image, {
        // options to make the image static
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        lockUniScaling: true,
        hasControls: false,
        hasBorders: false
      });

      // Update canvas size
      canvas.setWidth(image.width);
      canvas.setHeight(image.height);

      // Add image
      this.darkroom.image.remove();
      this.darkroom.image = imgInstance;
      canvas.add(imgInstance);
    }
  });
})(window, document, Darkroom, fabric);
