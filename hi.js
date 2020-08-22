const { PDFNet } = require("@pdftron/pdfnet-node");
module.exports = () => {
  const main = async () => {
    try {
      await PDFNet.initialize();
      console.log("hi");
      const doc = await PDFNet.PDFDoc.create();
      doc.initSecurityHandler();
      doc.lock();
      const sigHandlerId = await doc.addStdSignatureHandlerFromFile(
        "./middleware/ISAA.pfx",
        "@Kartik01"
      );

      const builder = await PDFNet.ElementBuilder.create(); // ElementBuilder, used to build new element Objects
      // create a new page writer that allows us to add/change page elements
      const writer = await PDFNet.ElementWriter.create(); // ElementWriter, used to write elements to the page
      // define new page dimensions
      const pageRect = await PDFNet.Rect.init(0, 0, 612, 794);
      let page = await doc.pageCreate(pageRect);

      writer.beginOnPage(page, PDFNet.ElementWriter.WriteMode.e_overlay);

      // Adding a JPEG image to output file
      let img = await PDFNet.Image.createFromFile(
        doc,
        "./cert/802327d1-2f22-43c9-a009-ab3fa9d482c4.jpg"
      );
      let matrix = await PDFNet.Matrix2D.create(200, 0, 0, 250, 50, 500);
      const matrix2 = await PDFNet.Matrix2D.createZeroMatrix();
      await matrix2.set(200, 0, 0, 250, 50, 500);
      let element = await builder.createImageFromMatrix(img, matrix2);
      writer.writePlacedElement(element);
      writer.end();
      doc.pagePushBack(page); // add the page to the document
      const sigField = await doc.fieldCreate(
        "ISAA",
        PDFNet.Field.Type.e_signature
      );
      const page1 = await doc.getPage(1);
      const widgetAnnot = await PDFNet.WidgetAnnot.create(
        await doc.getSDFDoc(),
        await PDFNet.Rect.init(0, 0, 0, 0),
        sigField
      );
      page1.annotPushBack(widgetAnnot);
      widgetAnnot.setPage(page1);
      const widgetObj = await widgetAnnot.getSDFObj();
      const sigDict = await sigField.useSignatureHandler(sigHandlerId);

      // Add more information to the signature dictionary.
      const docbuf = await doc.saveMemoryBuffer(
        PDFNet.SDFDoc.SaveOptions.e_linearized
      );
      doc.save("blank.pdf", PDFNet.SDFDoc.SaveOptions.e_linearized);

      console.log("Done. Result saved in addimage.pdf...");
    } catch (err) {
      console.log(err);
    }
  };

  main();
};
