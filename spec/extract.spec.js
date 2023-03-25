// To run tests, run these commands from the project root:
// 1. `npm install`
// 2. `npm test`

/* global describe, it, expect */

var postcss = require("postcss");
var mobileToMultiDisplays = require("..");
var path = require("path");
var sep = path.sep;

describe("extract", function() {
  it("should handle extracted output", function() {
    var input = "#app { width: 100%; } .nav { position: fixed; width: 100%; height: 72px; left: 0; top: 0; }";
    postcss(mobileToMultiDisplays({
      experimental: {
        extract: true,
      }
    })).process(input, {
      from: path.join(__dirname, "a.css"),
    }).then(res => {
      var css = res.css;
      var targetExtractedDir = __dirname.replace("spec", `.temp${sep}spec`);
      var output = `@import url(${targetExtractedDir}${sep}mobile.a.css); @import url(${targetExtractedDir}${sep}desktop.a.css) (min-width: 600px) and (min-height: 640px); @import url(${targetExtractedDir}${sep}landscape.a.css) (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape); #app { } .nav { }`;
      expect(css).toBe(output);
    });
  });

  it("should handle extracted desktop output", function() {
    var input = "#app { width: 100%; } .nav { position: fixed; width: 100%; height: 72px; left: 0; top: 0; }";
    postcss(mobileToMultiDisplays({
      disableLandscape: true,
      experimental: {
        extract: true,
      }
    })).process(input, {
      from: path.join(__dirname, "a.css"),
    }).then(res => {
      var css = res.css;
      var targetExtractedDir = __dirname.replace("spec", `.temp${sep}spec`);
      var output = `@import url(${targetExtractedDir}${sep}mobile.a.css); @import url(${targetExtractedDir}${sep}desktop.a.css) (min-width: 600px) and (min-height: 640px); #app { } .nav { }`;
      expect(css).toBe(output);
    });
  });

  it("should handle extracted landscape output", function() {
    var input = "#app { width: 100%; } .nav { position: fixed; width: 100%; height: 72px; left: 0; top: 0; }";
    postcss(mobileToMultiDisplays({
      disableDesktop: true,
      experimental: {
        extract: true,
      }
    })).process(input, {
      from: path.join(__dirname, "a.css"),
    }).then(res => {
      var css = res.css;
      var targetExtractedDir = __dirname.replace("spec", `.temp${sep}spec`);
      var output = `@import url(${targetExtractedDir}${sep}mobile.a.css); @import url(${targetExtractedDir}${sep}landscape.a.css) (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape); #app { } .nav { }`;
      expect(css).toBe(output);
    });
  });
});