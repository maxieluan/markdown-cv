import "./styles.css"
import { debounce } from 'lodash';
import PDFDocument from 'pdfkit';
var blobStream = require('blob-stream');
import "./register-files"
import EasyMDE from "easymde";
import {marked} from "marked";

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


var lorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl. Suspendisse rhoncus nisl posuere tortor tempus et dapibus elit porta. Cras leo neque, elementum a rhoncus ut, vestibulum non nibh. Phasellus pretium justo turpis. Etiam vulputate, odio vitae tincidunt ultricies, eros odio dapibus nisi, ut tincidunt lacus arcu eu elit. Aenean velit erat, vehicula eget lacinia ut, dignissim non tellus. Aliquam nec lacus mi, sed vestibulum nunc. Suspendisse potenti. Curabitur vitae sem turpis. Vestibulum sed neque eget dolor dapibus porttitor at sit amet sem. Fusce a turpis lorem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;\nMauris at ante tellus. Vestibulum a metus lectus. Praesent tempor purus a lacus blandit eget gravida ante hendrerit. Cras et eros metus. Sed commodo malesuada eros, vitae interdum augue semper quis. Fusce id magna nunc. Curabitur sollicitudin placerat semper. Cras et mi neque, a dignissim risus. Nulla venenatis porta lacus, vel rhoncus lectus tempor vitae. Duis sagittis venenatis rutrum. Curabitur tempor massa tortor.';

function setupEditor() {
  const renderePDFDebounce = debounce(() => {
    const markdown = easyMDE.value();
    const pdf = generatePdf(markdown);
  }, 500);

  easyMDE.codemirror.on('change', renderePDFDebounce);

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
}

function generatePdf(markdown) {
  var doc = new PDFDocument();
  var stream = doc.pipe(blobStream());

  var iframe = document.getElementById('pdf-preview');

  doc.registerFont('Roboto', 'fonts/Roboto-Regular.ttf')

  doc.info.Title = 'My CV';

  
  const ast = marked.lexer(markdown);
  console.log(ast);

  doc.end();
  stream.on('finish', function () {
    iframe.src = stream.toBlobURL('application/pdf');
  });
}

setupEditor();