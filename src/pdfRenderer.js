const marked = require('marked');
const PDFDocument = require('pdfkit');
const blobStream = require('blob-stream');
const fs = require('fs');
const path = require('path');

function renderNode(node) {

}

function parseMarkdown(markdown, config) {  
    const ast = marked.lexer(markdown);

    // write ast to file
    // fs.writeFileSync(path.join(__dirname, 'ast.json'), JSON.stringify(ast));

    // array of lines
    var lines = [];

    for (const node of ast) {
        var moveUp = false;

        switch (node.type) {
            case 'heading':
                var line = {
                    type: "h" + node.depth,
                    text: [],
                    size: 20,
                }

                if (node.tokens && node.tokens.length > 0) {
                    for (const token of node.tokens) {
                        if (token.type == 'text') {
                            // add line to lines
                            line.text.push({
                                text: token.text,
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
                                text: token.text,
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
                    size: 12,
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
                                        size: 12,
                                    }
                                    moveUp = true;
                                }
                            } else {
                                line.text.push({
                                    text: token.text,
                                    font: config.fonts.regular
                                })
                            }
                        } else if (token.type == 'strong') {
                            line.text.push({
                                text: token.text,
                                font: config.fonts.bold
                            })
                        } else if (token.type == 'em') {
                            line.text.push({
                                text: token.text,
                                font: config.fonts.italic
                            })
                        } else {
                            line.text.push({
                                text: token.text,
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
                for (const item of node.items) {
                    var line = {
                        type: node.ordered == true ? "ol" : "ul",
                        text: [],
                        size: 12,
                    }

                    for (const token of item.tokens) {
                        if (token.type == 'text') {
                            line.text.push({
                                text: token.text,
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
                                text: token.text,
                                font: config.fonts.regular,
                            });
                        }
                    }

                    lines.push(line);
                }
                break;
            case 'html':
                // strip html text of trailing \n and surrounding whitespace
                const text = node.text.replace(/\n$/, '').trim();
                if (text == "<!-- pagebreak -->")
                    lines.push({ type: "pagebreak" });
                break
            default:
                break;
        }
    }
  
    return lines;
}

function renderPDF(lines, config) {
    var doc = new PDFDocument();
    var stream = doc.pipe(fs.createWriteStream('output.pdf'));

    for (const line of lines) {
        if (line.type == "pagebreak") {
            doc.addPage();
            continue;
        } else if (line.type.startsWith("h")) {
            for (const t of line.text) {
                // if token is not the last token of line.text
                if (line.text.indexOf(t) < line.text.length - 1) {
                    doc.font(t.font).fontSize(line.size).text(t.text, { continued: true, baseline: 'alphabetic' });
                } else {
                    if (line.trailing) {
                        doc.font(t.font).fontSize(line.size).text(t.text, { continued: true, baseline: 'alphabetic' });
                    } else {
                        doc.font(t.font).fontSize(line.size).text(t.text, { baseline: 'alphabetic'});
                    }
                }   
            }
        } else if (line.type == "p") {
            for (const t of line.text) {
                // if token is not the first token of line.text
                if (line.text.indexOf(t) < line.text.length - 1) {
                    doc.font(t.font).fontSize(line.size).text(t.text, { continued: true, baseline: 'alphabetic' });
                } else {
                    if (line.trailing) {
                        doc.font(t.font).fontSize(line.size).text(t.text, { continued: true, baseline: 'alphabetic' });
                    } else {
                        doc.font(t.font).fontSize(line.size).text(t.text, { baseline: 'alphabetic'});
                    }
                }
            }
        } else if (line.type == "ul") {
            for (const t of line.text) {
                if (line.text.indexOf(t) < line.text.length - 1) {
                    doc.font(t.font).fontSize(line.size).text(t.text, { continued: true, bullet: '•', baseline: 'alphabetic' });
                } else {
                    doc.font(t.font).fontSize(line.size).text(t.text, { bullet: '•', baseline: 'alphabetic' });
                }
            }
        } else if (line.type == "ol") {
            for (const t of line.text) {
                if (line.text.indexOf(t) < line.text.length - 1) {
                    doc.font(t.font).fontSize(line.size).text(t.text, { continued: true, bullet: '1.', baseline: 'alphabetic' });
                } else {
                    doc.font(t.font).fontSize(line.size).text(t.text, { bullet: '1.', baseline: 'alphabetic' });
                }
            }
        }

        if (line.trailing) {
            for (const t of line.trailing.text) {
                if (line.trailing.text.indexOf(t) < line.trailing.text.length - 1) {
                    doc.font(t.font).fontSize(line.trailing.size).text(t.text, { continued: true, baseline: 'alphabetic' });
                } else {
                    doc.font(t.font).fontSize(line.trailing.size).text(t.text, { baseline: 'alphabetic' });
                }
            }
        }
    }

    doc.end();
}


const markdown = `# **Kate Miller**
An engineering manager building and leading engineering teams at Apple Inc

## Work Experience

### Apple Inc
->_Copenhagen_

**Engineering Manager** 
->_Jan 2019 to Present_

- Increased engineering staff's operating efficiency by providing structure, operating procedures, engineering tools, guidelines, and handbooks.
- Contributed to company-wide engineering initiatives
- Supported the engineering and product teams to achieve a high level of technical quality, reliability, and ease-of-use.

**Backend Engineer, Financial Data**
->_April 2018 to December 2018_
 
- Built large-scale (petabyte-size) financial data platform/solution/pipelines using Big Data technologies
- Worked cross-functionally with many teams: Engineering, Treasury, Finance, Accounting, etc.
- Worked on systems critical to future operation, with impact over billions of dollars of payments volume.
- Developed a deep understanding of modern payments and financial technology across many countries.

### Stripe
->_San Francisco, CA_

**Full Stack Engineer**
-> _September 2016 to March 2018_

- Responsible for developing, maintaining internal web applications
- Collaborated with technical and business staff in design, development, testing and implementation
- Set up, managed and monitored systems to ensure business continuity

### Bloomberg
->_New York, NY_

**Software Engineer Intern**
->_June 2016 to August 2016_

- Worked on Bloomberg's platform to enhance the user experience
- Proactively participated in the team's weekly meetings and conducted reports on the project's progress

<!-- pagebreak -->

## Skills

Technical: \`Python\` \`Go\` \`Microservices Architecture\`

Management: \`Kanban Methodology\` \`Scrum\`

## Education

### Carnegie Mellon University
->_2014-2016_

**Masters of Computer Science**, _Pittsburgh, Pennsylvania_

### The State University of NY
->_2010 - 2014_

**Bachelor of Engineering**,  _Oswego, New York_

---

||: Email: **<katemiller@gmail.com>** || Phone: **+123 456 789** || Website: **[katemiller.com](katemiller.com)** :||

`
const config = {
    fonts: {
        regular: "Times-Roman",
        italic: "Times-Italic",
        bold: "Times-Bold",
    }
}

try {
    var lines = parseMarkdown(markdown, config);

    fs.writeFileSync(path.join(__dirname, 'lines.json'), JSON.stringify(lines));

    renderPDF(lines, config);
} catch (err) {
    console.error(err);
}