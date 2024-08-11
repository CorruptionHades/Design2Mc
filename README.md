# Design2Mc

Below are the steps to get your plugin running. You can also find instructions at:

  https://www.figma.com/plugin-docs/plugin-quickstart-guide/

This plugin template uses Typescript and NPM, two standard tools in creating JavaScript applications.

First, download Node.js which comes with NPM. This will allow you to install TypeScript and other
libraries. You can find the download link here:

  https://nodejs.org/en/download/

Next, install TypeScript using the command:

  npm install -g typescript

Finally, in the directory of your plugin, get the latest type definitions for the plugin API by running:

  npm install --save-dev @figma/plugin-typings

If you are familiar with JavaScript, TypeScript will look very familiar. In fact, valid JavaScript code
is already valid Typescript code.

TypeScript adds type annotations to variables. This allows code editors such as Visual Studio Code
to provide information about the Figma API while you are writing code, as well as help catch bugs
you previously didn't notice.

For more information, visit https://www.typescriptlang.org/

Using TypeScript requires a compiler to convert TypeScript (code.ts) into JavaScript (code.js)
for the browser to run.

We recommend writing TypeScript code using Visual Studio code:

1. Download Visual Studio Code if you haven't already: https://code.visualstudio.com/.
2. Open this directory in Visual Studio Code.
3. Compile TypeScript to JavaScript: Run the "Terminal > Run Build Task..." menu item,
    then select "npm: watch". You will have to do this again every time
    you reopen Visual Studio Code.

That's it! Visual Studio Code will regenerate the JavaScript file every time you save.

In Intelij IDEA use ``npm run watch`` in the Terminal to compile in watch mode. 

---

## Usage

Use the Figma Plugin Context Action to generate the Minecraft code for your selection.

Showcase:
https://www.youtube.com/watch?v=lpteXKdE4bI

Here's an example Screen which will work with the generated code:

```java
MinecraftClient.getInstance().setScreen(new Screen(Text.of("My Screen")) {

    private final double scaleModifier = 0.2D;
    private final int xOff = 100, yOff = 30;

    @Override
    public void render(DrawContext context, int $$1, int $$2, float $$3) {
        super.render(context, $$1, $$2, $$3);
        // Generated code here:
       }
});
```

### Info
Currently, the plugin is very WIP and only a few components are supported. It also only works in Figma, not FigJam.