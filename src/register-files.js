import fs from 'fs'
// use raw-loader explicitly
import Courier from '!!raw-loader!pdfkit/js/data/Courier.afm'
// use raw-loader implicitly (webpack is configured to load *.afm files using raw loader)
import CourierBold from 'pdfkit/js/data/Courier-Bold.afm'
import CourierBoldeOblique from 'pdfkit/js/data/Courier-BoldOblique.afm'
import CourierOblique from 'pdfkit/js/data/Courier-Oblique.afm'
import Helvetica from 'pdfkit/js/data/Helvetica.afm'
import HelveticaBold from 'pdfkit/js/data/Helvetica-Bold.afm'
import HelveticaBoldOblique from 'pdfkit/js/data/Helvetica-BoldOblique.afm'
import HelveticaOblique from 'pdfkit/js/data/Helvetica-Oblique.afm'
import TimesRoman from '!!raw-loader!pdfkit/js/data/Times-Roman.afm'
import TimesItalic from '!!raw-loader!pdfkit/js/data/Times-Italic.afm'
import TimesBold from '!!raw-loader!pdfkit/js/data/Times-Bold.afm'
import TimesBoldItalic from '!!raw-loader!pdfkit/js/data/Times-BoldItalic.afm'

var fonts = {
  "Courier": {
    "kv-pair": {
      "regular": "Courier",
      "bold": "Courier-Bold",
      "italic": "Courier-Oblique",
    },
    "data/Courier.afm": Courier,
    "data/Courier-Bold.afm": CourierBold,
    "data/Courier-BoldOblique.afm": CourierBoldeOblique,
    "data/Courier-Oblique.afm": CourierOblique
  },
  "Helvetica": {
    "kv-pair": {
      "regular": "Helvetica",
      "bold": "Helvetica-Bold",
      "italic": "Helvetica-Oblique",
    },
    "data/Helvetica.afm": Helvetica,
    "data/Helvetica-Bold.afm": HelveticaBold,
    "data/Helvetica-BoldOblique.afm": HelveticaBoldOblique,
    "data/Helvetica-Oblique.afm": HelveticaOblique
  },
  "Times-Roman": {
    "kv-pair": {
      "regular": "Times-Roman",
      "bold": "Times-Bold",
      "italic": "Times-Italic",
    },
    "data/Times-Roman.afm": TimesRoman,
    "data/Times-Italic.afm": TimesItalic,
    "data/Times-Bold.afm": TimesBold,
    "data/Times-BoldItalic.afm": TimesBoldItalic
  },
}


function registerBinaryFiles(ctx) {
  ctx.keys().forEach(key => {
    // extracts "./" from beginning of the key
    fs.writeFileSync(key.substring(2), ctx(key))
  });  
}

function registerAFMFonts(ctx) {
  ctx.keys().forEach(key => {
    const match = key.match(/([^/]*\.afm$)/)
    if (match) {
      // afm files must be stored on data path
      fs.writeFileSync(`data/${match[0]}`, ctx(key).default)
    }
  });
}

// register all files found in assets folder (relative to src)
registerBinaryFiles(require.context('./assets', true))

// register AFM fonts distributed with pdfkit
// is good practice to register only required fonts to avoid the bundle size increase
registerAFMFonts(require.context('pdfkit/js/data', false, /Helvetica.*\.afm$/))

// iterate over all fonts and register them
Object.keys(fonts).forEach(fontName => {
  Object.keys(fonts[fontName]).forEach(fontPath => {
    if (fontPath === "kv-pair") {
      return
    }

    fs.writeFileSync(fontPath, fonts[fontName][fontPath])
  })
})

// export fonts
export { fonts }