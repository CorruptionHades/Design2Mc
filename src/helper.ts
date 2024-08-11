export class CoordHelper {
     static getTransformedCoordinates(node: SceneNode, topmostNode: SceneNode): { x: number, y: number } {
        const { ox, oy } = this.getOriginalCoordinates(node);

        const x = ox - topmostNode.x;
        const y = oy - topmostNode.y;

        return { x, y };
    }

    static getOriginalCoordinates(node: SceneNode): { ox: number, oy: number } {
        // @ts-ignore
        const rotationRadians = (node.rotation * Math.PI) / 180;
        const width = node.width;
        const height = node.height;

        const offsetX = (width / 2) * (1 - Math.cos(rotationRadians)) - (height / 2) * Math.sin(rotationRadians);
        const offsetY = (height / 2) * (1 - Math.cos(rotationRadians)) + (width / 2) * Math.sin(rotationRadians);

        const originalX = node.x - offsetX;
        const originalY = node.y - offsetY;

        return { ox: originalX, oy: originalY };
    }
}

export class Node {
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

export class Data {}

export class Rectangle extends Data {
    cornerRadius: number;
    color?: Color;
    imagePath?: string;
    gradientColor?: Color;

    constructor(cornerRadius: number, color?: Color, imagePath?: string, gradientColor?: Color) {
        super();
        this.cornerRadius = cornerRadius;
        this.color = color;
        this.imagePath = imagePath;
        this.gradientColor = gradientColor;
    }
}

export class Text extends Data {
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

export class Color {
    r: number;
    g: number;
    b: number;
    a?: number;

    constructor(r: number, g: number, b: number, a?: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}