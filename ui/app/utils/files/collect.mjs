import { readFileSync, writeFileSync } from "node:fs";

const pkgRaw = readFileSync(
  new URL("./package.json", import.meta.url),
  "utf-8"
);
const pkg = JSON.parse(pkgRaw);
const dependencies = pkg.dependencies;
const targetDep = Object.keys(dependencies)[0];

const pkgLockRaw = readFileSync(
  new URL("./package-lock.json", import.meta.url),
  "utf-8"
);
const pkgLock = JSON.parse(pkgLockRaw);
const packages = pkgLock.packages;
const nodes = new Map();
const edges = new Set();

const contributors = [
  "torvalds",
  "gaearon",
  "tj",
  "yyx990803",
  "sindresorhus",
  "addyosmani",
  "paulirish",
  "getify",
  "developit",
  "kentcdodds",
  "wesbos",
  "ahejlsberg",
  "mrdoob",
  "defunkt",
  "mojombo",
  "wycats",
  "dhh",
  "jeresig",
  "brendaneich",
  "fat",
  "matz",
  "antirez",
  "fabpot",
  "unclebob",
  "martinfowler",
];

// function getRandomContributors(count = Math.floor(Math.random() * 3) + 2) {
//   const shuffled = [...contributors].sort(() => 0.5 - Math.random());
//   return shuffled.slice(0, count);
// }

function collect(entry, level = 0, visited = new Set()) {
  if (visited.has(entry)) {
    return;
  }
  visited.add(entry);

  nodes.set(entry, Math.min(level, nodes.get(entry) ?? Infinity));

  const pkg = packages[`node_modules/${entry}`];
  let dependencies = pkg?.dependencies;
  // if (dependencies) {
  //   const randomContributors = getRandomContributors();

  //   dependencies = {
  //     ...dependencies,
  //     ...Object.fromEntries(
  //       randomContributors.map((user) => [`@PMC-${user}`, "1.0.0"])
  //     ),
  //   };
  // }
  if (dependencies) {
    for (const dependency in dependencies) {
      edges.add({ from: entry, to: dependency });
      collect(dependency, level + 1, new Set(visited));
    }
  }
}

collect(targetDep);

const nodesArray = Array.from(nodes).map(([node, level]) => ({
  id: node,
  label: node,
  level,
}));

const edgesArray = Array.from(edges).map((edge, index) => ({
  id: index + 1,
  from: edge.from,
  to: edge.to,
}));

const maxLevel = Math.max(...nodesArray.map((node) => node.level));

const visData = {
  nodes: nodesArray,
  edges: edgesArray,
  maxLevel,
};

writeFileSync(
  new URL("./visData.json", import.meta.url),
  JSON.stringify(visData, null, 2),
  "utf-8"
);
