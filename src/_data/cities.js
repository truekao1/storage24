import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "data",
  "cities"
);

export default function () {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const data = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
      data._file = name;
      if (!data.citySlug) {
        data.citySlug = String(data.city || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
      }
      return data;
    })
    .sort((a, b) =>
      `${a.city}, ${a.state}`.localeCompare(`${b.city}, ${b.state}`)
    );
}
