// To run tests, run these commands from the project root:
// 1. `npm install`
// 2. `npm test`

/* global describe, it, expect */

var postcss = require("postcss");
var mobileToMultiDisplays = require("..");

describe("mobile-to-multi-displays", function() {
  it("should work on the readme example", function() {
    var input = ".root-class { width: 100%; } .class { position: fixed; width: 100%; } .class2 { width: 100vw; height: 30px; }";
    var output = ".root-class { width: 100%; } .class { position: fixed; width: 100%; } .class2 { width: 100vw; height: 30px; } @media (min-width: 600px) and (min-height: 640px) { .root-class { max-width: 600px !important; } .class { width: 600px; } .class2 { height: 24px; width: 600px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .root-class { max-width: 425px !important; } .class { width: 425px; } .class2 { height: 17px; width: 425px; } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) { .root-class { margin-left: auto !important; margin-right: auto !important; } .class { margin-left: auto !important; margin-right: auto !important; left: 0 !important; right: 0 !important; } }";
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert px to desktop and landscape radio px", function() {
    var input = ".rule { width: 375px; } .l{}";
    var output = ".rule { width: 375px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { width: 300px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { width: 212.5px; } }";
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("should ignore duplicate rules and props", function() {
    var input = ".rule { width: 500px; } .rule { width: 375px; width: 250px; }";
    var output = ".rule { width: 500px; } .rule { width: 375px; width: 250px; } @media (min-width: 600px) and (min-height: 640px) { .rule { width: 200px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { width: 141.667px; } }";
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("should handle < 1 values", function() {
    var input = ".rule { left: -750px; } .l{}";
    var output = ".rule { left: -750px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: -600px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { left: -425px; } }"
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("should handle values without a leading 0", function() {
    var input = ".rule { left: .75px; top: -.75px; right: .px; } .l{}";
    var output = ".rule { left: .75px; top: -.75px; right: .px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: 0.6px; top: -0.6px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { left: 0.425px; top: -0.425px; } }";
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("ignore input media queries", function() {
    var input = "@media (min-width: 600px) and (min-height: 640px) { .root-class { width: 100vw; } .class { width: 66px; }}";
    var output = "@media (min-width: 600px) and (min-height: 640px) { .root-class { width: 100vw; } .class { width: 66px; }}";
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("value parsing", function() {
  it("should not convert values in url()", function() {
    var input = ".rule { background: url(750px.jpg); font-size: 75px; } .l{}";
    var output = ".rule { background: url(750px.jpg); font-size: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { font-size: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { font-size: 42.5px; } }"
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert value outside url()", function() {
    var input = ".rule { background: left 75px / 7.5px 60% repeat-x url(./star750px); } .l{}";
    var output = ".rule { background: left 75px / 7.5px 60% repeat-x url(./star750px); } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { background: left 60px / 6px 60% repeat-x url(./star750px); } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { background: left 42.5px / 4.25px 60% repeat-x url(./star750px); } }"
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert value end with other words except px", function() {
    var input = ".rule { width: calc(100% - 75px); } .l{}";
    var output = ".rule { width: calc(100% - 75px); } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { width: calc(100% - 60px); } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { width: calc(100% - 42.5px); } }";
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert values equal to 1", function() {
    var input = ".rule { border: 1px solid white; left: 1px; top: 75px; } .l{}";
    var output = ".rule { border: 1px solid white; left: 1px; top: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { top: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { top: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert value in content property value", function() {
    var input = ".rule::before { content: '75px'; left: 75px; } .l{}";
    var output = ".rule::before { content: '75px'; left: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule::before { left: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule::before { left: 42.5px; } }";
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert value in quotes of font property", function() {
    var input = ".rule { font: italic 75px '75px', serif; } .l{}";
    var output = ".rule { font: italic 75px '75px', serif; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { font: italic 60px '75px', serif; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { font: italic 42.5px '75px', serif; } }";
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("media queries", function() {
  it("should ignore 1px in media queries", function() {
    var input = ".rule { border: 1px solid white; left: 1px; top: 1px; background: left 1px / 1px 60% repeat-x url(./star750px); } .l{}";
    var output = ".rule { border: 1px solid white; left: 1px; top: 1px; background: left 1px / 1px 60% repeat-x url(./star750px); } .l{}";
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert if no px value", function() {
    var input = ".rule { font-size: 1rem; }";
    var output = ".rule { font-size: 1rem; }";
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });
});

describe("exclude", function() {
  var rules = ".rule { width: 75px; } .l{}";
  var converted = ".rule { width: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { width: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { width: 42.5px; } }";
  it("when using exclude option, the style should not be overwritten.", function() {
    var options = {
      exclude: /\/node_modules\//,
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/node_modules/main.css",
    }).css;
    expect(processed).toBe(rules);
  });

  it("when using exclude option, the style should be overwritten.", function() {
    var options = {
      exclude: /\/node_modules\//,
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/src/main.css",
    }).css;
    expect(processed).toBe(converted);
  });

  it("when using exclude array, the style should not be overwritten.", function() {
    var options = {
      exclude: [/\/node_modules\//],
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/node_modules/main.css",
    }).css;
    expect(processed).toBe(rules);
  });

  it("when using exclude array, the style should be overwritten.", function() {
    var options = {
      exclude: [/\/node_modules\//],
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/src/main.css",
    }).css;
    expect(processed).toBe(converted);
  });
});

describe("include", function() {
  var rules = ".rule { width: 75px; } .l{}";
  var converted = ".rule { width: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { width: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { width: 42.5px; } }";
  it("when using include option, the style should not be overwritten.", function() {
    var options = {
      include: /\/src\//,
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/node_modules/main.css",
    }).css;
    expect(processed).toBe(rules);
  });

  it("when using include option, the style should be overwritten.", function() {
    var options = {
      include: /\/src\//,
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/src/main.css",
    }).css;
    expect(processed).toBe(converted);
  });

  it("when using include array, the style should not be overwritten.", function() {
    var options = {
      include: [/\/src\//],
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/node_modules/main.css",
    }).css;
    expect(processed).toBe(rules);
  });

  it("when using include array, the style should be overwritten.", function() {
    var options = {
      include: [/\/src\//],
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/src/main.css",
    }).css;
    expect(processed).toBe(converted);
  });
});

describe("include and exclude", function() {
  var rules = ".rule { width: 75px; } .l{}";
  var converted = ".rule { width: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { width: 60px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { width: 42.5px; } }";
  it("when using same include and exclude, the style should not be overwritten.", function() {
    var options = {
      include: /\/src\//,
      exclude: /\/src\//,
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/src/main.css",
    }).css;
    expect(processed).toBe(rules);
  });

  it("when using different include and exclude, the style should not be overwritten.", function() {
    var options = {
      include: /\/mobile\//,
      exclude: /\/desktop\//,
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/src/main.css",
    }).css;
    expect(processed).toBe(rules);
  });

  it("when using different include and exclude, the style should be overwritten.", function() {
    var options = {
      include: /\/mobile\//,
      exclude: /\/desktop\//,
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/mobile/main.css",
    }).css;
    expect(processed).toBe(converted);
  });

  it("when using same include and exclude array, the style should not be overwritten.", function() {
    var options = {
      include: [/\/src\//],
      exclude: [/\/src\//],
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/src/main.css",
    }).css;
    expect(processed).toBe(rules);
  });

  it("when using different include and exclude array, the style should not be overwritten.", function() {
    var options = {
      include: [/\/mobile\//],
      exclude: [/\/desktop\//],
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/src/main.css",
    }).css;
    expect(processed).toBe(rules);
  });

  it("when using different include and exclude array, the style should be overwritten.", function() {
    var options = {
      include: [/\/mobile\//],
      exclude: [/\/desktop\//],
    };
    var processed = postcss(mobileToMultiDisplays(options)).process(rules, {
      from: "/mobile/main.css",
    }).css;
    expect(processed).toBe(converted);
  });
});

describe('px-to-viewport', function() {
  var basicCSS = '.rule { font-size: 15px }';
  var basicOptions = {
    viewportWidth: 320,
    disableDesktop: true,
    disableLandscape: true,
    enableMobile: true,
    unitPrecision: 5,
  };
  it('should work on the readme example', function () {
    var input = 'h1 { margin: 0 0 20px; font-size: 32px; line-height: 2; letter-spacing: 1px; }';
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

  it('should not replace units inside mediaQueries by default', function() {
    var expected = '@media (min-width: 500px) { .rule { font-size: 16px } }';
    var processed = postcss(mobileToMultiDisplays(basicOptions)).process('@media (min-width: 500px) { .rule { font-size: 16px } }').css;

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
        enableMobile: true,
        unitPrecision: 5,
      };
      var expected = '.rule { font-size: 3.125vw }';
      var processed = postcss(mobileToMultiDisplays(basicOptions)).process(basicCSS).css;
  
      expect(processed).toBe(expected);
    })
  });

  describe('fontViewportUnit', function() {
    it('should replace only font-size using unit from options', function() {
      var rules = '.rule { margin-top: 15px; font-size: 8px; }';
      var expected = '.rule { margin-top: 4.6875vw; font-size: 2.5vmax; }';
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        mobileConfig: {
          fontViewportUnit: "vmax",
        }
      })).process(rules).css;
  
      expect(processed).toBe(expected);
    });
  });

  describe('selectorBlackList', function () {
    it('should ignore selectors in the selector black list', function () {
      var rules = '.rule { font-size: 15px } .rule2 { font-size: 15px }';
      var expected = '.rule { font-size: 4.6875vw } .rule2 { font-size: 15px }';
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        mobileConfig: {
          selectorBlackList: ['.rule2']
        }
      })).process(rules).css;
  
      expect(processed).toBe(expected);
    });
  
    it('should ignore every selector with `body$`', function () {
      var rules = 'body { font-size: 16px; } .class-body$ { font-size: 16px; } .simple-class { font-size: 16px; }';
      var expected = 'body { font-size: 5vw; } .class-body$ { font-size: 16px; } .simple-class { font-size: 5vw; }';
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        mobileConfig: {
          selectorBlackList: ['body$']
        }
      })).process(rules).css;
  
      expect(processed).toBe(expected);
    });
  
    it('should only ignore exactly `body`', function () {
      var rules = 'body { font-size: 16px; } .class-body { font-size: 16px; } .simple-class { font-size: 16px; }';
      var expected = 'body { font-size: 16px; } .class-body { font-size: 5vw; } .simple-class { font-size: 5vw; }';
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        mobileConfig: {
          selectorBlackList: [/^body$/]
        }
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
        mobileConfig: {
          propList: ['*font*', 'margin*', '!margin-left', '*-right', 'pad']
        }
      })).process(css).css;
  
      expect(processed).toBe(expected);
    });
  
    it('should only replace properties in the prop list with wildcard', function () {
      var css = '.rule { font-size: 16px; margin: 16px; margin-left: 5px; padding: 5px; padding-right: 16px }';
      var expected = '.rule { font-size: 16px; margin: 5vw; margin-left: 5px; padding: 5px; padding-right: 16px }';
      var processed = postcss(mobileToMultiDisplays({
        ...basicOptions,
        mobileConfig: {
          propList: ['*', '!margin-left', '!*padding*', '!font*']
        }
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
    var covered = '.rule { border: 1px solid #000; font-size: 5vw; margin: 1px 3.125vw; }';
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
    var covered = '.rule { border: 1px solid #000; font-size: 5vw; margin: 1px 3.125vw; }';
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
    var covered = '.rule { border: 1px solid #000; font-size: 5vw; margin: 1px 3.125vw; }';
  
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
    var covered = '.rule { border: 1px solid #000; font-size: 5vw; margin: 1px 3.125vw; }';
  
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

});