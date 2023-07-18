const fs = require("fs");

const files = []

fs.readdirSync("dist").filter( f => f.endsWith(".js") ).forEach( f => {
    files.push(`export * from "./${f.split(".")[0]}"`)
});

fs.writeFileSync("dist/index.d.ts", files.join("\n"))