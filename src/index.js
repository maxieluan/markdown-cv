import "./styles.css"
import { debounce } from 'lodash';
import PDFDocument, { font } from 'pdfkit';
var blobStream = require('blob-stream');
import "./register-files"
import EasyMDE from "easymde";
import { marked } from "marked";
import { fonts } from "./register-files";
import Picker from "vanilla-picker/csp";

const editor = document.getElementById('markdown-input');
const easyMDE = new EasyMDE({
  element: editor,
  maxHeight: '89vh',
  autosave: {
    enabled: true,
    uniqueId: "markdown-cv",
    delay: 1000,
  },
});

var config = {
  font: 'Times-Roman',
  fonts: {
    regular: "Times-Roman",
    italic: "Times-Italic",
    bold: "Times-Bold",
  },
  fontSize: {
    h1: 24,
    h2: 20,
    h3: 16,
    h4: 14,
    h5: 12,
    h6: 10,
    p: 10,
    list: 10,
    strong: 10,
  },
  paragraphGap: {
    h1: 0,
    h2: 0,
    h3: 0,
    h4: 0,
    h5: 0,
    h6: 0,
    p: 0,
    list: 0,
    strong: 0,
  },
  lineGap: {
    h1: 0,
    h2: 0,
    h3: 0,
    h4: 0,
    h5: 0,
    h6: 0,
    p: 0,
    list: 0,
    strong: 0,
  },
  characterSpacing: 0,
  wordSpacing: 0,
  baseline: 'alphabetic',
  log: true,
  backgroundoffsety: 0,
  themeColor: '#FF0000',
  spaceBeforeHr: 0,
  spaceAfterHr: 0,
  coloredHrLenght: 0,
  coloredHrThickness: 0,
  hrThickness: 0,
  bulletStyle: '•',
}

function cacheConfigToBrowser() {
  localStorage.setItem('config', JSON.stringify(config));
}

function loadConfigFromBrowser() {
  const configFromBrowser = localStorage.getItem('config');
  if (configFromBrowser) {
    config = JSON.parse(configFromBrowser);
  }
}

function setupEditor() {
  const renderePDFDebounce = debounce(() => {
    refresh();
  }, 500);

  easyMDE.codemirror.on('change', renderePDFDebounce);
}

function refresh() {
  cacheConfigToBrowser();

  var markdown = easyMDE.value();
  var parsed = parseMarkdown(markdown, config);
  generatePdf(parsed, config);
}

function setupPanel() {
  loadConfigFromBrowser();

  // populate select with fonts
  const selectFont = document.getElementById('select-font');
  for (const font of Object.keys(fonts)) {
    const option = document.createElement('option');

    if (font === config.font) {
      option.selected = true;
    }

    option.value = font;
    option.text = font;
    selectFont.appendChild(option);
  }

  selectFont.addEventListener('change', (event) => {
    config.fonts.regular = fonts[event.target.value]["kv-pair"].regular;
    config.fonts.italic = fonts[event.target.value]["kv-pair"].italic;
    config.fonts.bold = fonts[event.target.value]["kv-pair"].bold;
    config.font = event.target.value;
    refresh();
  });

  /* #region character spacing */
  const inputCharacterSpacing = document.getElementById('input-character-spacing');
  const characterSpacingValue = document.getElementById('character-spacing-value');

  inputCharacterSpacing.addEventListener('change', (event) => {
    config.characterSpacing = Number(event.target.value);
    characterSpacingValue.innerText = event.target.value;
    refresh();
  });

  // word spacing
  const inputWordSpacing = document.getElementById('input-word-spacing');
  const wordSpacingValue = document.getElementById('word-spacing-value');

  inputWordSpacing.addEventListener('change', (event) => {
    config.wordSpacing = Number(event.target.value);
    wordSpacingValue.innerText = event.target.value;
    refresh();
  });

  // baseline
  const selectBaseline = document.getElementById('select-baseline');
  selectBaseline.addEventListener('change', (event) => {
    config.baseline = event.target.value;
    refresh();
  });

  /* #region font size */
  const inputFontSizeH1 = document.getElementById('input-font-size-h1');
  const fontSizeH1Value = document.getElementById('font-size-h1-value');

  inputFontSizeH1.addEventListener('change', (event) => {
    config.fontSize.h1 = Number(event.target.value);
    fontSizeH1Value.innerText = event.target.value;
    refresh();
  });

  const inputFontSizeH2 = document.getElementById('input-font-size-h2');
  const fontSizeH2Value = document.getElementById('font-size-h2-value');

  inputFontSizeH2.addEventListener('change', (event) => {
    config.fontSize.h2 = Number(event.target.value);
    fontSizeH2Value.innerText = event.target.value;
    refresh();
  });

  const inputFontSizeH3 = document.getElementById('input-font-size-h3');
  const fontSizeH3Value = document.getElementById('font-size-h3-value');

  inputFontSizeH3.addEventListener('change', (event) => {
    config.fontSize.h3 = Number(event.target.value);
    fontSizeH3Value.innerText = event.target.value;
    refresh();
  });

  const inputFontSizeH4 = document.getElementById('input-font-size-h4');
  const fontSizeH4Value = document.getElementById('font-size-h4-value');

  inputFontSizeH4.addEventListener('change', (event) => {
    config.fontSize.h4 = Number(event.target.value);
    fontSizeH4Value.innerText = event.target.value;
    refresh();
  });

  const inputFontSizeH5 = document.getElementById('input-font-size-h5');
  const fontSizeH5Value = document.getElementById('font-size-h5-value');

  inputFontSizeH5.addEventListener('change', (event) => {
    config.fontSize.h5 = Number(event.target.value);
    fontSizeH5Value.innerText = event.target.value;
    refresh();
  });

  const inputFontSizeH6 = document.getElementById('input-font-size-h6');
  const fontSizeH6Value = document.getElementById('font-size-h6-value');

  inputFontSizeH6.addEventListener('change', (event) => {
    config.fontSize.h6 = Number(event.target.value);
    fontSizeH6Value.innerText = event.target.value;
    refresh();
  });

  const inputFontSizeP = document.getElementById('input-font-size-p');
  const fontSizePValue = document.getElementById('font-size-p-value');

  inputFontSizeP.addEventListener('change', (event) => {
    config.fontSize.p = Number(event.target.value);
    fontSizePValue.innerText = event.target.value;
    refresh();
  });

  const inputFontSizeList = document.getElementById('input-font-size-list');
  const fontSizeListValue = document.getElementById('font-size-list-value');

  inputFontSizeList.addEventListener('change', (event) => {
    config.fontSize.list = Number(event.target.value);
    fontSizeListValue.innerText = event.target.value;
    refresh();
  });

  const inputFontSizeStrong = document.getElementById('input-font-size-strong');
  const fontSizeStrongValue = document.getElementById('font-size-strong-value');

  inputFontSizeStrong.addEventListener('change', (event) => {
    config.fontSize.strong = Number(event.target.value);
    fontSizeStrongValue.innerText = event.target.value;
    refresh();
  });

  /* #endregion */

  /* #region line gap */
  const inputLineGapH1 = document.getElementById('input-line-gap-h1');
  const lineGapH1Value = document.getElementById('line-gap-h1-value');

  inputLineGapH1.addEventListener('change', (event) => {
    config.lineGap.h1 = Number(event.target.value);
    lineGapH1Value.innerText = event.target.value;
    refresh();
  });

  const inputLineGapH2 = document.getElementById('input-line-gap-h2');
  const lineGapH2Value = document.getElementById('line-gap-h2-value');

  inputLineGapH2.addEventListener('change', (event) => {
    config.lineGap.h2 = Number(event.target.value);
    lineGapH2Value.innerText = event.target.value;
    refresh();
  });

  const inputLineGapH3 = document.getElementById('input-line-gap-h3');
  const lineGapH3Value = document.getElementById('line-gap-h3-value');

  inputLineGapH3.addEventListener('change', (event) => {
    config.lineGap.h3 = Number(event.target.value);
    lineGapH3Value.innerText = event.target.value;
    refresh();
  });

  const inputLineGapH4 = document.getElementById('input-line-gap-h4');
  const lineGapH4Value = document.getElementById('line-gap-h4-value');

  inputLineGapH4.addEventListener('change', (event) => {
    config.lineGap.h4 = Number(event.target.value);
    lineGapH4Value.innerText = event.target.value;
    refresh();
  });

  const inputLineGapH5 = document.getElementById('input-line-gap-h5');
  const lineGapH5Value = document.getElementById('line-gap-h5-value');

  inputLineGapH5.addEventListener('change', (event) => {
    config.lineGap.h5 = Number(event.target.value);
    lineGapH5Value.innerText = event.target.value;
    refresh();
  });

  const inputLineGapH6 = document.getElementById('input-line-gap-h6');
  const lineGapH6Value = document.getElementById('line-gap-h6-value');

  inputLineGapH6.addEventListener('change', (event) => {
    config.lineGap.h6 = Number(event.target.value);
    lineGapH6Value.innerText = event.target.value;
    refresh();
  });

  const inputLineGapP = document.getElementById('input-line-gap-p');
  const lineGapPValue = document.getElementById('line-gap-p-value');

  inputLineGapP.addEventListener('change', (event) => {
    config.lineGap.p = Number(event.target.value);
    lineGapPValue.innerText = event.target.value;
    refresh();
  });

  const inputLineGapList = document.getElementById('input-line-gap-list');
  const lineGapListValue = document.getElementById('line-gap-list-value');

  inputLineGapList.addEventListener('change', (event) => {
    config.lineGap.list = Number(event.target.value);
    lineGapListValue.innerText = event.target.value;
    refresh();
  });

  const inputLineGapStrong = document.getElementById('input-line-gap-strong');
  const lineGapStrongValue = document.getElementById('line-gap-strong-value');

  inputLineGapStrong.addEventListener('change', (event) => {
    config.lineGap.strong = Number(event.target.value);
    lineGapStrongValue.innerText = event.target.value;
    refresh();
  });

  /* #endregion */

  /* #region p gap */
  const inputPGap = document.getElementById('input-p-gap-h1');
  const pGapValue = document.getElementById('p-gap-h1-value');

  inputPGap.addEventListener('change', (event) => {
    config.paragraphGap.h1 = Number(event.target.value);
    pGapValue.innerText = event.target.value;
    refresh();
  });

  const inputPGapH2 = document.getElementById('input-p-gap-h2');
  const pGapH2Value = document.getElementById('p-gap-h2-value');

  inputPGapH2.addEventListener('change', (event) => {
    config.paragraphGap.h2 = Number(event.target.value);
    pGapH2Value.innerText = event.target.value;
    refresh();
  });

  const inputPGapH3 = document.getElementById('input-p-gap-h3');
  const pGapH3Value = document.getElementById('p-gap-h3-value');

  inputPGapH3.addEventListener('change', (event) => {
    config.paragraphGap.h3 = Number(event.target.value);
    pGapH3Value.innerText = event.target.value;
    refresh();
  });

  const inputPGapH4 = document.getElementById('input-p-gap-h4');
  const pGapH4Value = document.getElementById('p-gap-h4-value');

  inputPGapH4.addEventListener('change', (event) => {
    config.paragraphGap.h4 = Number(event.target.value);
    pGapH4Value.innerText = event.target.value;
    refresh();
  });

  const inputPGapH5 = document.getElementById('input-p-gap-h5');
  const pGapH5Value = document.getElementById('p-gap-h5-value');

  inputPGapH5.addEventListener('change', (event) => {
    config.paragraphGap.h5 = Number(event.target.value);
    pGapH5Value.innerText = event.target.value;
    refresh();
  });

  const inputPGapH6 = document.getElementById('input-p-gap-h6');
  const pGapH6Value = document.getElementById('p-gap-h6-value');

  inputPGapH6.addEventListener('change', (event) => {
    config.paragraphGap.h6 = Number(event.target.value);
    pGapH6Value.innerText = event.target.value;
    refresh();
  });

  const inputPGapP = document.getElementById('input-p-gap-p');
  const pGapPValue = document.getElementById('p-gap-p-value');

  inputPGapP.addEventListener('change', (event) => {
    config.paragraphGap.p = Number(event.target.value);
    pGapPValue.innerText = event.target.value;
    refresh();
  });

  const inputPGapList = document.getElementById('input-p-gap-list');
  const pGapListValue = document.getElementById('p-gap-list-value');

  inputPGapList.addEventListener('change', (event) => {
    config.paragraphGap.list = Number(event.target.value);
    pGapListValue.innerText = event.target.value;
    refresh();
  });

  const inputPGapStrong = document.getElementById('input-p-gap-strong');
  const pGapStrongValue = document.getElementById('p-gap-strong-value');

  inputPGapStrong.addEventListener('change', (event) => {
    config.paragraphGap.strong = Number(event.target.value);
    pGapStrongValue.innerText = event.target.value;
    refresh();
  });


  /* #endregion */

  /* #region color picker */
  var parent = document.querySelector('#color-picker');
  var picker = new Picker(parent);

  picker.onChange = function (color) {
    parent.style.backgroundColor = color.rgbString;
    config.themeColor = color.rgba;

    refresh();
  };
  /* #endregion */

  /* #region offset y */
  const inputOffsetY = document.getElementById('input-background-offset-y');
  const offsetYValue = document.getElementById('background-offset-y-value');

  inputOffsetY.addEventListener('change', (event) => {
    config.backgroundoffsety = Number(event.target.value);
    offsetYValue.innerText = event.target.value;
    refresh();
  });
  /* #endregion */

  /* #region hr */
  const spaceBeforeHr = document.getElementById('input-space-before-hr');
  const spaceBeforeHrValue = document.getElementById('space-before-hr-value');

  spaceBeforeHr.addEventListener('change', (event) => {
    config.spaceBeforeHr = Number(event.target.value);
    spaceBeforeHrValue.innerText = event.target.value;
    refresh();
  });

  const spaceAfterHr = document.getElementById('input-space-after-hr');
  const spaceAfterHrValue = document.getElementById('space-after-hr-value');

  spaceAfterHr.addEventListener('change', (event) => {
    config.spaceAfterHr = Number(event.target.value);
    spaceAfterHrValue.innerText = event.target.value;
    refresh();
  });

  const coloredHrLenght = document.getElementById('input-colored-hr-length');
  const coloredHrLenghtValue = document.getElementById('colored-hr-length-value');

  coloredHrLenght.addEventListener('change', (event) => {
    config.coloredHrLenght = Number(event.target.value);
    coloredHrLenghtValue.innerText = event.target.value;
    refresh();
  });

  const coloredHrThickness = document.getElementById('input-colored-hr-thickness');
  const coloredHrThicknessValue = document.getElementById('colored-hr-thickness-value');

  coloredHrThickness.addEventListener('change', (event) => {
    config.coloredHrThickness = Number(event.target.value);
    coloredHrThicknessValue.innerText = event.target.value;
    refresh();
  });

  const hrThickness = document.getElementById('input-hr-thickness');
  const hrThicknessValue = document.getElementById('hr-thickness-value');

  hrThickness.addEventListener('change', (event) => {
    config.hrThickness = Number(event.target.value);
    hrThicknessValue.innerText = event.target.value;
    refresh();
  });

  /* #endregion */

  /* #region bullet */
  const bulletStyle = document.getElementById('bullet-style');

  bulletStyle.addEventListener('change', (event) => {
    config.bulletStyle = event.target.value;
    refresh();
  });
  /* #endregion */

  // collapsible panel
  const btnTogglePanel = document.getElementById('btn-toggle-panel');
  btnTogglePanel.addEventListener('click', () => {
    const panelContent = document.getElementById('panel-content');
    panelContent.classList.toggle('hidden');
    const panel = document.getElementById('panel');
    panel.classList.toggle('w-3/5');
    panel.classList.toggle('w-0');

    const left = document.querySelector("#btn-toggle-panel > svg.icon-caret-left");
    const right = document.querySelector("#btn-toggle-panel > svg.icon-caret-right");

    left.classList.toggle('hidden');
    right.classList.toggle('hidden');
  });

  pGapValue.innerText = config.paragraphGap.h1;
  characterSpacingValue.innerText = config.characterSpacing;
  wordSpacingValue.innerText = config.wordSpacing;
  fontSizeH1Value.innerText = config.fontSize.h1;
  fontSizeH2Value.innerText = config.fontSize.h2;
  fontSizeH3Value.innerText = config.fontSize.h3;
  fontSizeH4Value.innerText = config.fontSize.h4;
  fontSizeH5Value.innerText = config.fontSize.h5;
  fontSizeH6Value.innerText = config.fontSize.h6;
  fontSizePValue.innerText = config.fontSize.p;
  fontSizeListValue.innerText = config.fontSize.list;
  fontSizeStrongValue.innerText = config.fontSize.strong;
  lineGapH1Value.innerText = config.lineGap.h1;
  lineGapH2Value.innerText = config.lineGap.h2;
  lineGapH3Value.innerText = config.lineGap.h3;
  lineGapH4Value.innerText = config.lineGap.h4;
  lineGapH5Value.innerText = config.lineGap.h5;
  lineGapH6Value.innerText = config.lineGap.h6;
  lineGapPValue.innerText = config.lineGap.p;
  lineGapListValue.innerText = config.lineGap.list;
  lineGapStrongValue.innerText = config.lineGap.strong;
  pGapH2Value.innerText = config.paragraphGap.h2;
  pGapH3Value.innerText = config.paragraphGap.h3;
  pGapH4Value.innerText = config.paragraphGap.h4;
  pGapH5Value.innerText = config.paragraphGap.h5;
  pGapH6Value.innerText = config.paragraphGap.h6;
  pGapPValue.innerText = config.paragraphGap.p;
  pGapListValue.innerText = config.paragraphGap.list;
  pGapStrongValue.innerText = config.paragraphGap.strong;
  offsetYValue.innerText = config.backgroundOffsetY;
  spaceBeforeHrValue.innerText = config.spaceBeforeHr;
  spaceAfterHrValue.innerText = config.spaceAfterHr;
  coloredHrLenghtValue.innerText = config.coloredHrLenght;
  coloredHrThicknessValue.innerText = config.coloredHrThickness;
  hrThicknessValue.innerText = config.hrThickness;

  inputCharacterSpacing.value = config.characterSpacing;
  inputWordSpacing.value = config.wordSpacing;
  inputFontSizeH1.value = config.fontSize.h1;
  inputFontSizeH2.value = config.fontSize.h2;
  inputFontSizeH3.value = config.fontSize.h3;
  inputFontSizeH4.value = config.fontSize.h4;
  inputFontSizeH5.value = config.fontSize.h5;
  inputFontSizeH6.value = config.fontSize.h6;
  inputFontSizeP.value = config.fontSize.p;
  inputFontSizeList.value = config.fontSize.list;
  inputFontSizeStrong.value = config.fontSize.strong;
  inputLineGapH1.value = config.lineGap.h1;
  inputLineGapH2.value = config.lineGap.h2;
  inputLineGapH3.value = config.lineGap.h3;
  inputLineGapH4.value = config.lineGap.h4;
  inputLineGapH5.value = config.lineGap.h5;
  inputLineGapH6.value = config.lineGap.h6;
  inputLineGapP.value = config.lineGap.p;
  inputLineGapList.value = config.lineGap.list;
  inputLineGapStrong.value = config.lineGap.strong;
  inputPGap.value = config.paragraphGap.h1;
  inputPGapH2.value = config.paragraphGap.h2;
  inputPGapH3.value = config.paragraphGap.h3;
  inputPGapH4.value = config.paragraphGap.h4;
  inputPGapH5.value = config.paragraphGap.h5;
  inputPGapH6.value = config.paragraphGap.h6;
  inputPGapP.value = config.paragraphGap.p;
  inputPGapList.value = config.paragraphGap.list;
  inputPGapStrong.value = config.paragraphGap.strong;
  picker.setColor(config.themeColor);
  inputOffsetY.value = config.backgroundOffsetY;
  spaceBeforeHr.value = config.spaceBeforeHr;
  spaceAfterHr.value = config.spaceAfterHr;
  coloredHrLenght.value = config.coloredHrLenght;
  coloredHrThickness.value = config.coloredHrThickness;
  hrThickness.value = config.hrThickness;
  // bulletStyle is a select, set the option that matches the config as selected
  bulletStyle.value = config.bulletStyle;

}

function parseMarkdown(markdown, config) {
  const ast = marked.lexer(markdown);

  // array of lines
  var lines = [];

  for (const node of ast) {
    var moveUp = false;

    switch (node.type) {
      case 'heading':
        var line = {
          type: "h" + node.depth,
          text: [],
          size: config.fontSize["h" + node.depth],
        }

        if (node.tokens && node.tokens.length > 0) {
          for (const token of node.tokens) {
            if (token.type == 'text') {
              // add line to lines
              line.text.push({
                text: token.raw,
                font: config.fonts.regular,
              });

            } else if (token.type == 'strong') {
              line.text.push({
                text: token.text,
                font: config.fonts.bold,
              });
            } else if (token.type == 'em') {
              line.text.push({
                text: token.text,
                font: config.fonts.italic,
              });
            } else {
              line.text.push({
                text: token.raw,
                font: config.fonts.regular,
              });
            }
          }
        }

        lines.push(line);

        break;
      case 'paragraph':
        var line = {
          type: "p",
          text: [],
          size: config.fontSize.p,
        }

        if (node.tokens && node.tokens.length > 0) {
          for (const token of node.tokens) {
            if (token.type == 'text') {
              var t = token.text.replace(/\n$/, '').trim();
              t = t.replace(/^\n/, '');

              if (t == "-&gt;") {
                // if token is the first tokenof node.tokens
                if (node.tokens.indexOf(token) == 0) {
                  moveUp = true;
                } else {
                  // previous tokens make a line
                  // the rest tokens make a line and add to trailing of previous line
                  lines.push(line)
                  line = {
                    type: "p",
                    text: [],
                    size: config.fontSize.p,
                  }
                  moveUp = true;
                }
              } else {
                line.text.push({
                  text: token.raw,
                  font: config.fonts.regular
                })
              }
            } else if (token.type == 'strong') {
              line.text.push({
                text: token.text,
                font: config.fonts.bold
              })
              line.strong = true;
              line.size = config.fontSize.strong;
            } else if (token.type == 'em') {
              line.text.push({
                text: token.text,
                font: config.fonts.italic
              })
            } else if (token.type == 'codespan') {
              line.text.push({
                text: token.text,
                font: config.fonts.regular,
                code: true,
              })

            }
            else {
              line.text.push({
                text: token.raw,
                font: config.fonts.regular
              })
            }
          }
        }

        if (moveUp) {
          lines[lines.length - 1].trailing = line;
          moveUp = false;
        } else {
          lines.push(line);
        }

        break;
      case 'list':
        var list = {
          type: node.ordered == true ? "ol" : "ul",
          items: [],
        }

        for (const item of node.items) {
          var i = {
            text: [],
            size: config.fontSize.p,
          }

          for (const token of item.tokens) {
            for (const t of token.tokens) {
              if (t.type == 'text') {
                i.text.push({
                  text: t.raw,
                  font: config.fonts.regular
                })
              } else if (t.type == 'strong') {
                i.text.push({
                  text: t.text,
                  font: config.fonts.bold
                })
              } else if (t.type == 'em') {
                i.text.push({
                  text: t.text,
                  font: config.fonts.italic
                })
              } else {
                i.text.push({
                  text: t.raw,
                  font: config.fonts.regular
                })
              }
            }
          }

          list.items.push(i);
        }

        lines.push(list);

        break;
      case 'html':
        // strip html text of trailing \n and surrounding whitespace
        const text = node.text.replace(/\n$/, '').trim();
        if (text == "<!-- pagebreak -->")
          lines.push({ type: "pagebreak" });
        break
      case 'hr':
        lines.push({ type: "hr" });
        break;
  
      default:
        break;
    }
  }

  if (config.log == true) {
    console.log(ast);
    console.log(lines);
  }

  return lines;
}

function generatePdf(lines, config) {
  var doc = new PDFDocument();
  var stream = doc.pipe(blobStream());

  var iframe = document.getElementById('pdf-preview');

  var style = {
    characterSpacing: config.characterSpacing,
    wordSpacing: config.wordSpacing,
    baseline: config.baseline,
  }

  for (const line of lines) {
    if (line.type == "pagebreak") {
      doc.addPage();
      continue;
    } else if (line.type == "hr") {
      console.log(config)

      var rgba = config.themeColor
      // convert rgb to hex and opacity to alpha
      var hex = "#" + ((1 << 24) + (rgba[0] << 16) + (rgba[1] << 8) + rgba[2]).toString(16).slice(1);
      var alpha = rgba[3];

      var y = doc.y + config.spaceBeforeHr;
      var x = doc.x;
      console.log(hex, alpha)
      doc.moveTo(x, y)
        .lineWidth(config.coloredHrThickness)
        .lineTo(x + config.coloredHrLenght, y).strokeColor(hex, alpha).stroke()
      doc.moveTo(x + config.coloredHrLenght, y)
        .lineWidth(config.hrThickness)
        .lineTo(doc.page.width - doc.page.margins.left, y).strokeColor("black", 1).stroke();
      doc.moveDown(config.spaceAfterHr);
    } else if (line.type.startsWith("h")) {
      var paragraphGap = config.paragraphGap[line.type];
      var lineGap = config.lineGap[line.type];

      for (const t of line.text) {
        // if token is not the last token of line.text
        var localStyle = { ...style };
        if (line.text.indexOf(t) < line.text.length - 1) {
          localStyle = { ...style, continued: true, paragraphGap: paragraphGap, lineGap: lineGap };
        } else {
          if (line.trailing) {
            localStyle = { ...style, continued: true, paragraphGap: paragraphGap, lineGap: lineGap };
          } else {
            localStyle = { ...style, paragraphGap: paragraphGap, lineGap: lineGap };
          }
        }

        doc.font(t.font).fontSize(line.size).text(t.text, localStyle);
      }
    } else if (line.type == "p") {
      if (line.strong == true) {
        paragraphGap = config.paragraphGap.strong;
        lineGap = config.lineGap.strong;
      } else {
        var paragraphGap = config.paragraphGap[line.type];
        var lineGap = config.lineGap[line.type];
      }

      var cursor = 0;

      for (const t of line.text) {
        var localStyle = { ...style };

        if (t.code == true) {
          var x = cursor + doc.x;
          var y = doc.y - config.backgroundoffsety;
          var w = doc.widthOfString(t.text, { font: t.font, size: line.size });
          var h = doc.currentLineHeight(true);

          var rgba = config.themeColor
          // convert rgb to hex and opacity to alpha
          var hex = "#" + ((1 << 24) + (rgba[0] << 16) + (rgba[1] << 8) + rgba[2]).toString(16).slice(1);
          var alpha = rgba[3];

          doc.rect(x, y, w, h).opacity(alpha).fill(hex);
          doc.fill("black").opacity(1);
        }

        if (line.text.indexOf(t) < line.text.length - 1) {
          localStyle = { ...style, continued: true, paragraphGap: paragraphGap, lineGap: lineGap };
        } else {
          if (line.trailing) {
            localStyle = { ...style, continued: true, paragraphGap: paragraphGap, lineGap: lineGap };
          } else {
            localStyle = { ...style, paragraphGap: paragraphGap, lineGap: lineGap };
          }
        }

        // check if t.text matches a (?:__|[*#])|\[(.*?)\]\((.*?)\)
        // if yes, then add a link
        var link = t.text.match(/(?:__|[*#])|\[(.*?)\]\((.*?)\)/);
        if (link) {
          console.log(link)
          if (link[1] && link[2]) {
            doc.font(t.font).fontSize(line.size).text(link[1], {...localStyle, link: link[2]});
          }
        } else {
          doc.font(t.font).fontSize(line.size).text(t.text, localStyle);
        }

        cursor += doc.widthOfString(t.text, { font: t.font, size: line.size });
      }
    } else if (line.type == "ul") {
      var paragraphGap = config.paragraphGap.list;
      var lineGap = config.lineGap.list;
      for (const item of line.items) {
        // write bullet point
        var rgba = config.themeColor
        // convert rgb to hex and opacity to alpha
        var hex = "#" + ((1 << 24) + (rgba[0] << 16) + (rgba[1] << 8) + rgba[2]).toString(16).slice(1);
        var alpha = rgba[3];
        doc.fillColor(hex).text(config.bulletStyle, { ...style, continued: true })
        doc.fillColor("black").text(" ", { ...style, continued: true })

        for (const t of item.text) {
          if (item.text.indexOf(t) < item.text.length - 1) {
            doc.font(t.font).fontSize(item.size).text(t.text, { ...style, continued: true, paragraphGap: paragraphGap, lineGap: lineGap });
          } else {
            doc.font(t.font).fontSize(item.size).text(t.text, { ...style, paragraphGap: paragraphGap, lineGap: lineGap });
          }
        }
      }
    } else if (line.type == "ol") {
      var paragraphGap = config.paragraphGap.list;
      var lineGap = config.lineGap.list;
      for (const item of line.items) {
        // write list index
        var rgba = config.themeColor
        // convert rgb to hex and opacity to alpha
        var hex = "#" + ((1 << 24) + (rgba[0] << 16) + (rgba[1] << 8) + rgba[2]).toString(16).slice(1);
        var alpha = rgba[3];
        doc.fillColor(hex).text(item.index + ".", { ...style, continued: true })
        doc.fillColor("black").text(" ", { ...style, continued: true })

        for (const t of item.text) {
          if (item.text.indexOf(t) < item.text.length - 1) {
            doc.font(t.font).fontSize(item.size).text(t.text, { ...style, continued: true, paragraphGap: paragraphGap, lineGap: lineGap });
          } else {
            doc.font(t.font).fontSize(item.size).text(t.text, { ...style, paragraphGap: paragraphGap, lineGap: lineGap });
          }
        }
      }
    }

    if (line.trailing) {
      if (line.strong == true) {
        paragraphGap = config.paragraphGap.strong;
        lineGap = config.lineGap.strong;
      } else {
        var paragraphGap = config.paragraphGap[line.type];
        var lineGap = config.lineGap[line.type];
      }
      for (const t of line.trailing.text) {
        if (line.trailing.text.indexOf(t) < line.trailing.text.length - 1) {
          doc.font(t.font).fontSize(line.trailing.size).text(t.text, { ...style, continued: true, align: 'right', paragraphGap: paragraphGap, lineGap: lineGap });
        } else {
          doc.font(t.font).fontSize(line.trailing.size).text(t.text, { ...style, align: 'right', paragraphGap: paragraphGap, lineGap: lineGap });
        }
      }
    }
  }

  doc.end();
  stream.on('finish', function () {
    iframe.src = stream.toBlobURL('application/pdf');
  });
}

setupPanel();
setupEditor();
refresh();