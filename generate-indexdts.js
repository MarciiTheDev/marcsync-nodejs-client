const fs = require("fs");

const files = []

fs.readdirSync("dist").filter( f => f.endsWith(".d.ts") ).forEach( f => {
    files.push(`export * from "./${f}"`)
});

fs.writeFileSync("dist/index.d.ts", files.join("\n"))