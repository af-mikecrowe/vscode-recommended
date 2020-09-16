var axios = require("axios");

const retrieve = async (extId) => {
  const data = JSON.stringify({
    assetTypes: null,
    filters: [{ criteria: [{ filterType: 7, value: extId }], direction: 2, pageSize: 100, pageNumber: 1, sortBy: 0, sortOrder: 0, pagingToken: null }],
    flags: 103,
  });

  let response = await axios({
    method: "post",
    url: "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery",
    headers: {
      Accept: "application/json;api-version=6.1-preview.1;excludeUrls=true",
      "Content-Type": "application/json",
    },
    data: data,
  });
  const { results } = response.data;
  const { extensions } = results[0];
  const extension = extensions.shift();
  const { versions, categories } = extension;
  const category = categories[0];
  const version = versions.shift();
  const { files } = version;
  const list = files.filter((o) => o.assetType == "Microsoft.VisualStudio.Services.Content.Details");
  const obj = list[0];

  response = await axios({
    method: "get",
    url: obj.source,
    headers: {
      Accept: "application/octet-stream;api-version=6.1-preview.1;excludeUrls=true",
    },
  });
  const parts = response.data.split(/\n#/);
  const header = parts[0];
  return { category, header, extension };
};
module.exports = {
  retrieve,
};
