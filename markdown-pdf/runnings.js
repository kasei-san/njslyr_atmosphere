
exports.header = null;
exports.footer = {
  height   : "2cm",
  contents : function(pageNum, numPages) {
    return '<div style="' +
        "border-top: 1px solid;" +
        'font-family: Osaka, sans-serif;' +
        "margin-top: 1em;" +
        "padding-top: 0.5em;" +
        "font-size: 0.75em;" +
      '">かせいさん@忍殺的アトモスフィア紹介本</div>'
  }
}
