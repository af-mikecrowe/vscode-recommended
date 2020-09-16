const { resolve, join } = require("path");
const { retrieve } = require("../lib/marketplace");

const fs = require("fs-extra");

const packRoot = resolve(__filename, "../../");
const { name, version, extensionPack, categories, keywords, description } = require(join(packRoot, "package.json"));

const marketplaceUrl = "https://marketplace.visualstudio.com/items?itemName=";

const packageLinks = {};
let packageDetails = [];
const tocLinks = {};
let toc = [];

const buildReadme = async () => {
  const promises = extensionPack.map(async (id) => {
    const { category, header, extension } = await retrieve(id);
    if (!(category in packageLinks)) {
      packageLinks[category] = [];
      tocLinks[category] = [];
    }
    const prefix = header.startsWith("#") ? "#" : `## ${extension.displayName}\n\n`;
    packageLinks[category].push(`${prefix}${header}`);
    tocLinks[category].push(`  - [${extension.displayName}](${marketplaceUrl}${id})`);
  });
  await Promise.all(promises);

  for (let key in packageLinks) {
    packageDetails.push(`# ${key}\n`);
    packageDetails = packageDetails.concat(packageLinks[key]);
    toc.push(`- ${key}`);
    toc = toc.concat(tocLinks[key]);
  }

  /* --- */
  /* README Markdown Content */
  const text = `# ${name} v${version}

${description || "*No description property found in manifest*"}

# Extension Links

${toc.join("\n")}

**Total Extension Count**: ${extensionPack.length}

## Extensions

${packageDetails.join("\n")}

For detailed information, refer to individual extension documentation.

Keywords: *${(keywords || ["visual studio code", "extension"]).join(", ")}*
`;

  fs.writeFileSync(join(packRoot, "README.md"), text);
};

(async () => {
  await buildReadme();
})().catch((err) => {
  console.error(err);
});
