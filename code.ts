

class Node {
  type: string;
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: Data;

  constructor(type: string, x: number, y: number, x2: number, y2: number, data: Data) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.x2 = x2;
    this.y2 = y2;
    this.data = data;
  }
}

class Data {}

class Rectangle extends Data {
  cornerRadius: number;
  color: Color;

  constructor(cornerRadius: number, color: Color) {
    super();
    this.cornerRadius = cornerRadius;
    this.color = color;
  }
}

class Text extends Data {
  text: string;
  fontSize: number;
  color: Color;

  constructor(text: string, fontSize: number, color: Color) {
    super();
    this.text = text;
    this.fontSize = fontSize;
    this.color = color;
  }
}

class Color {
  r: number;
  g: number;
  b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

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

    const { x, y } = getTransformedCoordinates(node, topmostNode);
    const x2 = x + node.width;
    const y2 = y + node.height;

    console.log("Original coordinates: ", getOriginalCoordinates(node));

    console.log("x: ", node.x, " ", x);
    console.log("y: ", node.y, " ", y);

    const data: Data = getData(node);
    return new Node(node.type, x, y, x2, y2, data);
  });

  const codeLines = generateMcCode(names);
  figma.ui.postMessage({ type: 'display-code', codeLines });

  figma.ui.onmessage = (msg: {type: string}) => {
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
    if (!fills || fills.length === 0 || fills[0].type !== 'SOLID') {
      return new Rectangle(0, new Color(255, 255, 255));
    }

    const firstColor = (fills[0] as SolidPaint).color;
    const r = Math.round(firstColor.r * 255);
    const g = Math.round(firstColor.g * 255);
    const b = Math.round(firstColor.b * 255);
    return new Rectangle(rn.cornerRadius as number, new Color(r, g, b));
  }
  else if (node.type === "TEXT") {
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

function getTransformedCoordinates(node: SceneNode, topmostNode: SceneNode): { x: number, y: number } {

  const { ox, oy } = getOriginalCoordinates(node);

    const x = ox - topmostNode.x;
    const y= oy - topmostNode.y;

    return { x, y };
}

function getOriginalCoordinates(node: SceneNode): { ox: number, oy: number } {
  // Get the node's rotation in radians
  // @ts-ignore
  const rotationRadians = (node.rotation * Math.PI) / 180;

  // Get the width and height of the node
  const width = node.width;
  const height = node.height;

  // Calculate the offset from the rotated top-left corner to the original top-left corner
  const offsetX = (width / 2) * (1 - Math.cos(rotationRadians)) - (height / 2) * Math.sin(rotationRadians);
  const offsetY = (height / 2) * (1 - Math.cos(rotationRadians)) + (width / 2) * Math.sin(rotationRadians);

  // Calculate the original top-left corner coordinates
  const originalX = node.x - offsetX;
  const originalY = node.y - offsetY;

  return { ox: originalX, oy: originalY };
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
      const color = `new Color(${rect.color.r}, ${rect.color.g}, ${rect.color.b}).getRGB()`;
      codeLines.push(`context.fill((int) (${x} * scaleModifier) + xOff, (int) (${y} * scaleModifier) + yOff, (int) (${x2} * scaleModifier) + xOff, (int) (${y2} * scaleModifier) + yOff, ${color});`);
    }
    else if (node.data instanceof Text) {
      const text = node.data as Text;
      const color = `new Color(${text.color.r}, ${text.color.g}, ${text.color.b}).getRGB()`;
      codeLines.push(`context.drawText(MinecraftClient.getInstance().textRenderer, "${text.text}", (int) (${x} * scaleModifier) + xOff, (int) (${y} * scaleModifier) + yOff, ${color}, false);`);
    }
  });

  return codeLines;
}





