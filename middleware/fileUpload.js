module.exports = function (req, res, next) {
  let contentBuffer = Buffer.from([]);
  let totalBytesInBuffer = 0;
  req.on("data", (chunk) => {
    console.log(chunk);
    var tmp = new Uint8Array(contentBuffer.byteLength + chunk.byteLength);
    tmp.set(new Uint8Array(contentBuffer), 0);
    tmp.set(new Uint8Array(chunk), contentBuffer.byteLength);
    contentBuffer = tmp.buffer;
    //contentBuffer.push(chunk);
    totalBytesInBuffer += chunk.length;
    console.log(contentBuffer);
    // Look to see if the file size is too large.
  });
  req.on("end", () => {
    console.log(req);
    req.contentBuffer = Buffer.from(contentBuffer);
    next();
  });
};
