export function downloadBlob(
  filename: string,
  content: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Renders an <svg> onto an offscreen canvas at 2x scale (for a crisp, not
// blurry, PNG) and downloads that, since a raster image opens more
// predictably than an SVG in places like a slide deck or a Word doc.
export function downloadSvgAsPng(
  node: SVGSVGElement,
  filename: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const viewBox = node.viewBox.baseVal;
    const width = viewBox.width || 700;
    const height = viewBox.height || 340;
    const scale = 2;

    const clone = node.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));
    const markup = new XMLSerializer().serializeToString(clone);

    const svgBlob = new Blob([markup], {
      type: "image/svg+xml;charset=utf-8;",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(image, 0, 0, width, height);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            const pngUrl = URL.createObjectURL(pngBlob);
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(pngUrl);
          }
          resolve();
        }, "image/png");
      } else {
        resolve();
      }
      URL.revokeObjectURL(svgUrl);
    };
    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error("Could not render the chart as an image."));
    };
    image.src = svgUrl;
  });
}
