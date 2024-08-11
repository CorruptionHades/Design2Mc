import { Data, Color, Text, Node, Rectangle, CoordHelper } from "./helper";

if (figma.editorType === 'figma') {
  figma.showUI(__html__);

  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.closePlugin();
    throw new Error("No nodes selected");
  }

  // find topmost node and base the selection on that (it will be the origin point 0,0)
  const topmostNode = selection.reduce((acc, node) => {
    if (node.y < acc.y) {
      return node;
    }
    return acc;
  }, selection[0]);

  const names = selection.map(node => {
    const { x, y } = CoordHelper.getTransformedCoordinates(node, topmostNode);
    const x2 = x + node.width;
    const y2 = y + node.height;

    const data: Data = getData(node);
    return new Node(node.type, x, y, x2, y2, data);
  });

  const codeLines = generateMcCode(names);
  figma.ui.postMessage({ type: 'display-code', codeLines });

  figma.ui.onmessage = (msg: { type: string }) => {
    if (msg.type === 'create-shapes') {
      //
    }

    figma.closePlugin();
  };
}

if (figma.editorType === 'figjam') {
  figma.closePlugin();
}

function getData(node: SceneNode): Data {
  if (node.type === "RECTANGLE") {
    const rn = node as RectangleNode;
    const fills = rn.fills as Paint[];

    console.log(rn.cornerRadius);

    if (!fills || fills.length === 0) {
      return new Rectangle(0, new Color(255, 255, 255));
    }

    const firstFill = fills[0];

    if (firstFill.type === 'IMAGE') {
      const imagePaint = firstFill as ImagePaint;
      const imagePath = imagePaint.imageHash; // You might need to get the actual path or reference in your context
      return new Rectangle(rn.cornerRadius, undefined, imagePath!);
    }

    if (firstFill.type === 'SOLID') {
      const firstColor = (firstFill as SolidPaint).color;
      const r = Math.round(firstColor.r * 255);
      const g = Math.round(firstColor.g * 255);
      const b = Math.round(firstColor.b * 255);
      return new Rectangle(rn.cornerRadius, new Color(r, g, b));
    }

    if (firstFill.type === 'GRADIENT_LINEAR' || firstFill.type === 'GRADIENT_RADIAL' || firstFill.type === 'GRADIENT_ANGULAR' || firstFill.type === 'GRADIENT_DIAMOND') {
      const gradientStops = (firstFill as GradientPaint).gradientStops;
      const col1 = new Color(Math.round(gradientStops[0].color.r * 255), Math.round(gradientStops[0].color.g * 255), Math.round(gradientStops[0].color.b * 255), Math.round(gradientStops[0].color.a * 255));
      const col2 = new Color(Math.round(gradientStops[gradientStops.length - 1].color.r * 255), Math.round(gradientStops[gradientStops.length - 1].color.g * 255), Math.round(gradientStops[gradientStops.length - 1].color.b * 255), Math.round(gradientStops[gradientStops.length - 1].color.a * 255));
      return new Rectangle(rn.cornerRadius, col1, undefined, col2);
    }
  } else if (node.type === "TEXT") {
    const tn = node as TextNode;
    const fills = tn.fills as Paint[];

    if (!fills || fills.length === 0 || fills[0].type !== 'SOLID') {
      return new Text(tn.name, tn.fontSize as number, new Color(0, 0, 0));
    }

    const firstColor = (fills[0] as SolidPaint).color;
    const r = Math.round(firstColor.r * 255);
    const g = Math.round(firstColor.g * 255);
    const b = Math.round(firstColor.b * 255);
    return new Text(tn.name, 10, new Color(r, g, b));
  }

  return new Data();
}

function generateMcCode(nodes: Node[]): string[] {
  const scaleModifier = 1; // Example scale modifier, adjust as needed
  const xOff = 0; // Example x offset, adjust as needed
  const yOff = 0; // Example y offset, adjust as needed

  const codeLines: string[] = [];

  nodes.forEach(node => {
    const x = node.x * scaleModifier + xOff;
    const y = node.y * scaleModifier + yOff;
    const x2 = node.x2 * scaleModifier + xOff;
    const y2 = node.y2 * scaleModifier + yOff;

    if (node.data instanceof Rectangle) {
      const rect = node.data as Rectangle;

      if (rect.imagePath) {
        codeLines.push(`context.drawTexture(Identifier.of("minecraft", "${rect.imagePath}"), (int) (${x} * scaleModifier) + xOff, (int) (${y} * scaleModifier) + yOff, 0, 0, (int) (${x2 - x} * scaleModifier), (int) (${y2 - y} * scaleModifier), (int) (${x2 - x} * scaleModifier), (int) (${y2 - y} * scaleModifier));`);
      }
      else if (rect.color && !rect.gradientColor) {
        const color = `new Color(${rect.color.r}, ${rect.color.g}, ${rect.color.b}).getRGB()`;

        // cehck if corner radius is a number or a PluginAPI["mixed"]
        if (typeof rect.cornerRadius === "number") {
          // drawRect(context, x, y, x2, y2, color);
            const radius = ` (int) (${rect.cornerRadius as number} * scaleModifier) `;
            codeLines.push(`drawRoundedRect(context, (int) (${x} * scaleModifier) + xOff, (int) (${y} * scaleModifier) + yOff, (int) (${x2} * scaleModifier) + xOff, (int) (${y2} * scaleModifier) + yOff, ${radius}, ${color.replace(".getRGB()", "")});`);
        }
        else {
          codeLines.push(`context.fill((int) (${x} * scaleModifier) + xOff, (int) (${y} * scaleModifier) + yOff, (int) (${x2} * scaleModifier) + xOff, (int) (${y2} * scaleModifier) + yOff, ${color});`);
        }
      }
      else if (rect.color && rect.gradientColor) {
        const col1 = rect.color;
        const col2 = rect.gradientColor;
        codeLines.push(`context.fillGradient((int) (${x} * scaleModifier) + xOff, (int) (${y} * scaleModifier) + yOff, (int) (${x2} * scaleModifier) + xOff, (int) (${y2} * scaleModifier) + yOff, new Color(${col1.r}, ${col1.g}, ${col1.b}, ${col1.a}).getRGB(), new Color(${col2.r}, ${col2.g}, ${col2.b}, ${col2.a}).getRGB());`);
      }
    } else if (node.data instanceof Text) {
      const text = node.data as Text;
      const color = `new Color(${text.color.r}, ${text.color.g}, ${text.color.b}).getRGB()`;
      codeLines.push(`context.drawText(tr, "${text.text}", (int) (${x} * scaleModifier) + xOff, (int) (${y} * scaleModifier) + yOff, ${color}, false);`);
    }
  });

  return codeLines;
}
