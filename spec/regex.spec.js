const {
  preflightReg,
  unitContentMatchReg,
  fixedUnitContentReg,
  varTestReg } = require("../src/regexs");

describe("Regex", function() {
  it("preflightReg", function() {
    var str = "12px"; // width: 12px
    var ok = preflightReg.test(str);
    expect(ok).toBe(true);

    str = "url(12px)"; // background: url(12px)
    ok = preflightReg.test(str);
    expect(ok).toBe(true);

    str = "22.4px/1 vant-icon"; // font: 22.4px/1 vant-icon
    ok = preflightReg.test(str);
    expect(ok).toBe(true);

    str = "22.4"; // line-height: 22.4
    ok = preflightReg.test(str);
    expect(ok).toBe(true);

    str = "0 0"; // margin: 0 0
    ok = preflightReg.test(str);
    expect(ok).toBe(true);
  });

  it("unitContentMatchReg", function() {
    var str = "12px";
    var n = unitContentMatchReg.exec(str)[2];
    expect(n).toBe("12");
    n = unitContentMatchReg.exec(str);
    expect(n).toBe(null);

    str = "#000";
    n = unitContentMatchReg.exec(str)[2];
    expect(n).toBe(undefined);

    unitContentMatchReg.lastIndex = 0;
    str = "url(12px)";
    n = unitContentMatchReg.exec(str)[2];
    expect(n).toBe(undefined);

    unitContentMatchReg.lastIndex = 0;
    str = "var(--test12px)";
    n = unitContentMatchReg.exec(str)[2];
    expect(n).toBe(undefined);

    unitContentMatchReg.lastIndex = 0;
    str = "1.2vw \"Fira Sans\", sans-serif"
    n = unitContentMatchReg.exec(str)[2];
    expect(n).toBe("1.2");
    n = unitContentMatchReg.exec(str)[2];
    expect(n).toBe(undefined);

    unitContentMatchReg.lastIndex = 0;
    str = "url(\\)12px.png)";
    n = unitContentMatchReg.exec(str)[2];
    expect(n).toBe(undefined);


    var reg = /((?:url|var)\((?:[^()])*\)|"(?:\\"|[^"])*"|'(?:\\'|[^'])*')|(?:#(?:[a-zA-Z\d]{3}){1,2})|(-?(?:\d+\.\d+|\d+|\.\d+))(px|vw| |$)/g;
    n = reg.exec(str)[2];
    expect(n).toBe(undefined);

    n = reg.exec(str)[2];
    expect(n).toBe("12");
  });

  it("fixedUnitContentReg", function() {
    var str = "12%";
    var n = fixedUnitContentReg.exec(str)[2];
    expect(n).toBe("12");
    n = fixedUnitContentReg.exec(str);
    expect(n).toBe(null);
  });

  it("varTestReg", function() {
    var str = "var()";
    var ok = varTestReg.test(str);
    expect(ok).toBe(true);

    str = "var(--\\(\\))";
    ok = varTestReg.test(str);
    expect(ok).toBe(true);

    str = "var(var())";
    ok = varTestReg.test(str);
    expect(ok).toBe(true);
    
    str = "var(var()";
    ok = varTestReg.test(str);
    expect(ok).toBe(true);

    str = "url(var\\(\\))";
    ok = varTestReg.test(str);
    expect(ok).toBe(false);
  });
});