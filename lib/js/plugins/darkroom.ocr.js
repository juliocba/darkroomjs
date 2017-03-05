;(function(Darkroom, fabric, document) {


  var ALL_LANGUAGES = [
    {'jpn': 'Japanese'},
    {'eng': 'English'},
    {'chi_sim': 'Chinese'}
  ]; //more available, see https://github.com/naptha/tessdata/tree/gh-pages/3.02

  function getImplementation(_this) {

    var state = null;

    var helpers = {

      initializeOcr: function() {

        var options = _this.options;
      }
    };

    var eventListeners = {

      accept: function() {

        var ocr = _this.ocr,
          darkroom  = _this.darkroom,
          canvas    = _this.darkroom.canvas,
          image     = _this.darkroom.image;

        Darkroom.util.makeStatic(ocr);

        fabric.Image.fromURL(canvas.toDataURL(), function(newImage) {

          ocr.remove();
          canvas.add(newImage);
          image.remove();

          darkroom.image = newImage;

          Darkroom.util.makeStatic(newImage);

          darkroom.dispatchEvent('image:change');
          states.notActive();
        });

      },

      reject: function() { eventListeners.deActivate(); },

      activate: function() { states.active(); },

      deActivate: function() {

        states.notActive();
      }
    };

    var states = {

      notActive: function() {

        var buttons = _this.buttons,
          inputs  = _this.inputs;

        _this.ocr = null;

        buttons.ocr.active(false);

        buttons.accept.hide(true);
        buttons.reject.hide(true);

        Darkroom.util.forEachValue(inputs, Darkroom.util.hideElement);

        buttons.ocr.element.removeEventListener('click', eventListeners.deActivate);
        buttons.ocr.addEventListener('click', eventListeners.activate);
      },

      active: function() {

        var buttons = _this.buttons,
          options = _this.options,
          canvas  = _this.darkroom.canvas,
          inputs  = _this.inputs;

        buttons.ocr.active(true);

        buttons.accept.hide(false);
        buttons.reject.hide(false);

        helpers.initializeOcr();

        Darkroom.util.forEachValue(inputs, Darkroom.util.showElement);

        inputs.language.value    = options.language;

        buttons.ocr.element.removeEventListener('click', eventListeners.activate);
        buttons.ocr.addEventListener('click', eventListeners.deActivate);
      }
    };

    return {
      eventListeners: eventListeners,
      states:         states
    };
  }

  Darkroom.plugins['ocr'] = Darkroom.Plugin.extend({
    defaults: {
      language: 'jpn',
      callback: function() {}
    },
    initialize: function() {

      var buttonGroup = this.darkroom.toolbar.createButtonGroup(),
        options     = this.options;

      var buttons = this.buttons = {},
        inputs  = this.inputs  = {};

      buttons.ocr = buttonGroup.createButton({image: 'ocr'});
      buttons.accept    = buttonGroup.createButton({image: 'accept', type: 'success', hide:  true});
      buttons.reject    = buttonGroup.createButton({image: 'cancel', type: 'danger', hide: true});

      inputs.language = Darkroom.util.createElement('select', {title: 'Language'});

      ALL_LANGUAGES.forEach(function(language) {

        var key = Object.keys(language)[0];
        var optionElement = document.createElement('option');
        optionElement.innerHTML = language[key];
        optionElement.setAttribute('value', key);
        inputs.language.appendChild(optionElement);
      });

      var implementation = getImplementation(this);

      buttons.accept.addEventListener('click', options.callback.bind('', inputs.language));
      buttons.reject.addEventListener('click', implementation.eventListeners.reject);

      buttonGroup.element.appendChild(inputs.language);

      implementation.states.notActive();
    }
  });
})(Darkroom, fabric, document);
