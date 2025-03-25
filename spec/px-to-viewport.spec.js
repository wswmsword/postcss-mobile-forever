// To run tests, run these commands from the project root:
// 1. `npm install`
// 2. `npm test`

/* global describe, it, expect */

var postcss = require("postcss");
var mobileToMultiDisplays = require("..");

describe('px-to-viewport', function() {
  var basicCSS = '.rule { font-size: 15px }';
  var basicOptions = {
    viewportWidth: 320,
    disableDesktop: true,
    disableLandscape: true,
    unitPrecision: 5,
  };
  it('should work on the readme example', function () {
    var input = 'h1 { margin: 0 0 20px; font-size: 32px; line-height: 2; letter-spacing: 1px; /* mobile-ignore */ }';
    var output = 'h1 { margin: 0 0 6.25vw; font-size: 10vw; line-height: 2; letter-spacing: 1px; }';
    var processed = postcss(mobileToMultiDisplays(basicOptions)).process(input).css;

    expect(processed).toBe(output);
  });

  it('should replace the px unit with vw', function () {
    var processed = postcss(mobileToMultiDisplays(basicOptions)).process(basicCSS).css;
    var expected = '.rule { font-size: 4.6875vw }';

    expect(processed).toBe(expected);
  });

  it('should handle < 1 values and values without a leading 0', function () {
    var rules = '.rule { margin: 0.5rem .5px -0.2px -.2em }';
    var expected = '.rule { margin: 0.5rem 0.15625vw -0.0625vw -.2em }';
    var processed = postcss(mobileToMultiDisplays(basicOptions)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it('should remain unitless if 0', function () {
    var expected = '.rule { font-size: 0px; font-size: 0; }';
    var processed = postcss(mobileToMultiDisplays(basicOptions)).process(expected).css;

    expect(processed).toBe(expected);
  });

  // it('should not add properties that already exist', function () {
  //   var expected = '.rule { font-size: 16px; font-size: 5vw; }';
  //   var processed = postcss(mobileToMultiDisplays(basicOptions)).process(expected).css;

  //   expect(processed).toBe(expected);
  // });

  it('should not replace units inside mediaQueries in mq-mode', function() {
    var expected = '@media (min-width: 500px) { .rule { font-size: 16px } }';
    var processed = postcss(mobileToMultiDisplays({
      viewportWidth: 320,
      enableMediaQuery: true,
      unitPrecision: 5,
    })).process('@media (min-width: 500px) { .rule { font-size: 16px } }').css;

    expect(processed).toBe(expected);
  })

  describe('value parsing', function() {
    it('should not replace values in double quotes or single quotes', function () {
      var rules = '.rule { content: \'16px\'; font-family: "16px"; font-size: 16px; }';
      var expected = '.rule { content: \'16px\'; font-family: "16px"; font-size: 5vw; }';
      var processed = postcss(mobileToMultiDisplays(basicOptions)).process(rules).css;
  
      expect(processed).toBe(expected);
    });
  
    it('should not replace values in `url()`', function () {
      var rules = '.rule { background: url(16px.jpg); font-size: 16px; }';
      var expected = '.rule { background: url(16px.jpg); font-size: 5vw; }';
      var processed = postcss(mobileToMultiDisplays(basicOptions)).process(rules).css;
  
      expect(processed).toBe(expected);
    });
  
    it('should not replace values with an uppercase P or X', function () {
      var rules = '.rule { margin: 12px calc(100% - 14PX); height: calc(100% - 20px); font-size: 12Px; line-height: 16px; }';
      var expected = '.rule { margin: 3.75vw calc(100% - 14PX); height: calc(100% - 6.25vw); font-size: 12Px; line-height: 5vw; }';
      var processed = postcss(mobileToMultiDisplays(basicOptions)).process(rules).css;
  
      expect(processed).toBe(expected);
    });
  });


  describe('viewportWidth', function() {
    it('should should replace using 320px by default', function() {
      var expected = '.rule { font-size: 4.6875vw }';
      var processed = postcss(mobileToMultiDisplays(basicOptions)).process(basicCSS).css;
  
      expect(processed).toBe(expected);
    });
  
    it('should replace using viewportWidth from options', function() {
      var basicOptions = {
        viewportWidth: 480,
        disableDesktop: true,
        disableLandscape: true,
        unitPrecision: 5,
      };
      var expected = '.rule { font-size: 3.125vw }';
      var processed = postcss(mobileToMultiDisplays(basicOptions)).process(basicCSS).css;
  
      expect(processed).toBe(expected);
    })
  });

  describe('selectorBlackList', function () {
    it('should ignore selectors in the selector black list', function () {
      var rules = '.rule { font-size: 15px } .rule2 { font-size: 15px }';
      var expected = '.rule { font-size: 4.6875vw } .rule2 { font-size: 15px }';
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        selectorBlackList: ['.rule2'],
      })).process(rules).css;
  
      expect(processed).toBe(expected);
    });
  
    it('should ignore every selector with `.class-body$`', function () {
      var rules = 'body { font-size: 16px; } .class-body$ { font-size: 16px; } .simple-class { font-size: 16px; }';
      var expected = 'body { font-size: 5vw; } .class-body$ { font-size: 16px; } .simple-class { font-size: 5vw; }';
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        selectorBlackList: ['.class-body$'],
      })).process(rules).css;
  
      expect(processed).toBe(expected);
    });
  
    it('should only ignore exactly `body`', function () {
      var rules = 'body { font-size: 16px; } .class-body { font-size: 16px; } .simple-class { font-size: 16px; }';
      var expected = 'body { font-size: 16px; } .class-body { font-size: 5vw; } .simple-class { font-size: 5vw; }';
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        selectorBlackList: [/^body$/],
      })).process(rules).css;
  
      expect(processed).toBe(expected);
    });
  });

  describe('unitPrecision', function () {
    it('should replace using a decimal of 2 places', function () {
      var expected = '.rule { font-size: 4.69vw }';
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        unitPrecision: 2
      })).process(basicCSS).css;
  
      expect(processed).toBe(expected);
    });
  });

  describe('propList', function () {
    it('should only replace properties in the prop list', function () {
      var css = '.rule { font-size: 16px; margin: 16px; margin-left: 5px; padding: 5px; padding-right: 16px }';
      var expected = '.rule { font-size: 5vw; margin: 5vw; margin-left: 5px; padding: 5px; padding-right: 5vw }';
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        propList: ['*font*', 'margin*', '!margin-left', '*-right', 'pad']
      })).process(css).css;
  
      expect(processed).toBe(expected);
    });
  
    it('should only replace properties in the prop list with wildcard', function () {
      var css = '.rule { font-size: 16px; margin: 16px; margin-left: 5px; padding: 5px; padding-right: 16px }';
      var expected = '.rule { font-size: 16px; margin: 5vw; margin-left: 5px; padding: 5px; padding-right: 16px }';
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        propList: ['*', '!margin-left', '!*padding*', '!font*']
      })).process(css).css;
  
      expect(processed).toBe(expected);
    });
  
    it('should replace all properties when prop list is not given', function () {
      var rules = '.rule { margin: 16px; font-size: 15px }';
      var expected = '.rule { margin: 5vw; font-size: 4.6875vw }';
      var processed = postcss(mobileToMultiDisplays(basicOptions)).process(rules).css;
  
      expect(processed).toBe(expected);
    });
  });

  describe('exclude', function () {
    var rules = '.rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }';
    var covered = '.rule { border: 0.3125vw solid #000; font-size: 5vw; margin: 0.3125vw 3.125vw; }';
    it('when using regex at the time, the style should not be overwritten.', function () {
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        exclude: /\/node_modules\//
      })).process(rules, {
        from: '/node_modules/main.css'
      }).css;
  
      expect(processed).toBe(rules);
    });
  
    it('when using regex at the time, the style should be overwritten.', function () {
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        exclude: /\/node_modules\//
      })).process(rules, {
        from: '/example/main.css'
      }).css;
  
      expect(processed).toBe(covered);
    });
  
    it('when using array at the time, the style should not be overwritten.', function () {
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        exclude: [/\/node_modules\//, /\/exclude\//]
      })).process(rules, {
        from: '/exclude/main.css'
      }).css;
  
      expect(processed).toBe(rules);
    });
  
    it('when using array at the time, the style should be overwritten.', function () {
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        exclude: [/\/node_modules\//, /\/exclude\//]
      })).process(rules, {
        from: '/example/main.css'
      }).css;
  
      expect(processed).toBe(covered);
    });
  });
  
  describe('include', function () {
    var rules = '.rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }';
    var covered = '.rule { border: 0.3125vw solid #000; font-size: 5vw; margin: 0.3125vw 3.125vw; }';
    it('when using regex at the time, the style should not be overwritten.', function () {
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        include: /\/mobile\//
      })).process(rules, {
        from: '/pc/main.css'
      }).css;
  
      expect(processed).toBe(rules);
    });
  
    it('when using regex at the time, the style should be overwritten.', function () {
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        include: /\/mobile\//,
      })).process(rules, {
        from: '/mobile/main.css'
      }).css;
  
      expect(processed).toBe(covered);
    });
  
    it('when using array at the time, the style should not be overwritten.', function () {
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        include: [/\/flexible\//, /\/mobile\//]
      })).process(rules, {
        from: '/pc/main.css'
      }).css;
  
      expect(processed).toBe(rules);
    });
  
    it('when using array at the time, the style should be overwritten.', function () {
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        include: [/\/flexible\//, /\/mobile\//]
      })).process(rules, {
        from: '/flexible/main.css'
      }).css;
  
      expect(processed).toBe(covered);
    });
  });
  
  describe('include-and-exclude', function () {
    var rules = '.rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }';
    var covered = '.rule { border: 0.3125vw solid #000; font-size: 5vw; margin: 0.3125vw 3.125vw; }';
  
    it('when using regex at the time, the style should not be overwritten.', function () {
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        include: /\/mobile\//,
        exclude: /\/not-transform\//
      })).process(rules, {
        from: '/mobile/not-transform/main.css'
      }).css;
  
      expect(processed).toBe(rules);
    });
  
    it('when using regex at the time, the style should be overwritten.', function () {
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        include: /\/mobile\//,
        exclude: /\/not-transform\//
      })).process(rules, {
        from: '/mobile/style/main.css'
      }).css;
  
      expect(processed).toBe(covered);
    });
  
    it('when using array at the time, the style should not be overwritten.', function () {
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        include: [/\/flexible\//, /\/mobile\//],
        exclude: [/\/not-transform\//, /pc/]
      })).process(rules, {
        from: '/flexible/not-transform/main.css'
      }).css;
  
      expect(processed).toBe(rules);
    });
  
    it('when using regex at the time, the style should be overwritten.', function () {
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        include: [/\/flexible\//, /\/mobile\//],
        exclude: [/\/not-transform\//, /pc/]
      })).process(rules, {
        from: '/mobile/style/main.css'
      }).css;
  
      expect(processed).toBe(covered);
    });
  });
  
  describe('regex', function () {
    var rules = '.rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }';
    var covered = '.rule { border: 0.3125vw solid #000; font-size: 5vw; margin: 0.3125vw 3.125vw; }';
  
    it('when using regex at the time, the style should not be overwritten.', function () {
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        exclude: /pc/
      })).process(rules, {
        from: '/pc-project/main.css'
      }).css;
  
      expect(processed).toBe(rules);
    });
  
    it('when using regex at the time, the style should be overwritten.', function () {
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        exclude: /\/pc\//
      })).process(rules, {
        from: '/pc-project/main.css'
      }).css;
  
      expect(processed).toBe(covered);
    });
  
    it('when using regex at the time, the style should not be overwritten.', function () {
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        include: /\/pc\//
      })).process(rules, {
        from: '/pc-project/main.css'
      }).css;
  
      expect(processed).toBe(rules);
    });
  
    it('when using regex at the time, the style should be overwritten.', function () {
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        include: /pc/
      })).process(rules, {
        from: '/pc-project/main.css'
      }).css;
  
      expect(processed).toBe(covered);
    });
  });

  describe('/* mobile-ignore */ & /* mobile-ignore-next */', function() {
    it('should ignore right-commented', function() {
      var css = '.rule { font-size: 15px; /* simple comment */ width: 100px; /* mobile-ignore */ height: 50px; }';
      var expected = '.rule { font-size: 4.6875vw; /* simple comment */ width: 100px; height: 15.625vw; }';
  
      var processed = postcss(mobileToMultiDisplays(basicOptions)).process(css).css;
  
      expect(processed).toBe(expected);
    });
  
    it('should ignore right-commented in multiline-css', function() {
      var css = '.rule {\n  font-size: 15px;\n  width: 100px; /*mobile-ignore*/\n  height: 50px;\n}';
      var expected = '.rule {\n  font-size: 4.6875vw;\n  width: 100px;\n  height: 15.625vw;\n}';
  
      var processed = postcss(mobileToMultiDisplays(basicOptions)).process(css).css;
  
      expect(processed).toBe(expected);
    });
  
    it('should ignore before-commented in multiline-css', function() {
      var css = '.rule {\n  font-size: 15px;\n  /*mobile-ignore-next*/\n  width: 100px;\n  /*mobile-ignore*/\n  height: 50px;\n}';
      var expected = '.rule {\n  font-size: 4.6875vw;\n  width: 100px;\n  /*mobile-ignore*/\n  height: 15.625vw;\n}';
  
      var processed = postcss(mobileToMultiDisplays(basicOptions)).process(css).css;
  
      expect(processed).toBe(expected);
    });
  });

  describe('viewportUnit', function() {
    it('should replace using unit from options', function() {
      var rules = '.rule { margin-top: 15px }';
      var expected = '.rule { margin-top: 4.6875vh }';
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        mobileUnit: "vh"
      })).process(rules).css;
  
      expect(processed).toBe(expected);
    });
  });
});