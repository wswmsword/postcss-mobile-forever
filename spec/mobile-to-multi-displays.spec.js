// To run tests, run these commands from the project root:
// 1. `npm install`
// 2. `npm test`

/* global describe, it, expect */

var postcss = require("postcss");
var mobileToMultiDisplays = require("..");

describe("mobile-to-multi-displays", function() {
  it("should work on the readme example", function() {
    var input = ".root-class { width: 100%; } .class { position: fixed; width: 100%; } .class2 { width: 100vw; height: 30px; }";
    var output = ".root-class { width: 100%; } .class { position: fixed; width: 100%; } .class2 { width: 100vw; height: 30px; } @media (min-width: 600px) and (min-height: 640px) { .root-class { max-width: 600px !important; } .class { width: 600px; } .class2 { height: 24.000px; width: 600px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .root-class { max-width: 425px !important; } .class { width: 425px; } .class2 { height: 17.000px; width: 425px; } } @media (min-width: 600px), (orientation: landscape) and (max-width: 600px) { .root-class { margin-left: auto !important; margin-right: auto !important; } .class { margin-left: auto !important; margin-right: auto !important; left: 0 !important; right: 0 !important; } }";
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert px to desktop and landscape radio px", function() {
    var input = ".rule { width: 375px; } .l{}";
    var output = ".rule { width: 375px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { width: 300.000px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { width: 212.500px; } }";
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("should ignore duplicate rules and props", function() {
    var input = ".rule { width: 500px; } .rule { width: 375px; width: 250px; }";
    var output = ".rule { width: 500px; } .rule { width: 375px; width: 250px; } @media (min-width: 600px) and (min-height: 640px) { .rule { width: 200.000px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { width: 141.667px; } }";
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("should handle < 1 values", function() {
    var input = ".rule { left: -750px; } .l{}";
    var output = ".rule { left: -750px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: -600.000px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { left: -425.000px; } }"
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("should handle values without a leading 0", function() {
    var input = ".rule { left: .750px; top: -.750px; right: .px; } .l{}";
    var output = ".rule { left: .750px; top: -.750px; right: .px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { left: 0.600px; top: -0.600px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { left: 0.425px; top: -0.425px; } }";
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
    var output = ".rule { background: url(750px.jpg); font-size: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { font-size: 60.000px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { font-size: 42.500px; } }"
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("should convert value outside url()", function() {
    var input = ".rule { background: left 75px / 7.5px 60% repeat-x url(./star750px); } .l{}";
    var output = ".rule { background: left 75px / 7.5px 60% repeat-x url(./star750px); } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { background: left 60.000px / 6.000px 60% repeat-x url(./star750px); } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { background: left 42.500px / 4.250px 60% repeat-x url(./star750px); } }"
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert value end with other words except px", function() {
    var input = ".rule { width: calc(100% - 75px); } .l{}";
    var output = ".rule { width: calc(100% - 75px); } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { width: calc(100% - 60.000px); } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { width: calc(100% - 42.500px); } }";
    var processed = postcss(mobileToMultiDisplays()).process(input).css;
    expect(processed).toBe(output);
  });

  it("should not convert values equal to 1", function() {
    var input = ".rule { border: 1px solid white; left: 1px; top: 75px; } .l{}";
    var output = ".rule { border: 1px solid white; left: 1px; top: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { top: 60.000px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { top: 42.500px; } }";
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
  var converted = ".rule { width: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { width: 60.000px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { width: 42.500px; } }";
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
  var converted = ".rule { width: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { width: 60.000px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { width: 42.500px; } }";
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
  var converted = ".rule { width: 75px; } .l{} @media (min-width: 600px) and (min-height: 640px) { .rule { width: 60.000px; } } @media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (orientation: landscape) { .rule { width: 42.500px; } }";
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