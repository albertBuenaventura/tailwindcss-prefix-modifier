const { execSync } = require('child_process');
const fs = require('fs/promises');
const glob = require('glob');

const execute = async () => {
  const prefix = 'v2-';
  //generate tailwind output.css
  execSync('npx tailwindcss -c tailwind.config.js -o output.css');

  const classes = await tailwindClassesToArray();
  const directories = await getDirectories('src/components');

  directories.forEach((path) => {
    fs.readFile(path, "utf-8").then((content) => {
      const newContent = prefixTailwindClasses(classes, prefix, content);
      fs.writeFile(path, newContent);
    });
  });

  console.log("Completed")
};

const prefixTailwindClasses = (tailwindClasses, prefix, text) => {
  const escapeRegExp = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

  tailwindClasses.forEach((cls) => {
    text = text.replace(
      new RegExp(
        `(["':!\\s])(?!${prefix})(-?${escapeRegExp(cls)})(?=["':!\\s])`,
        'g'
      ),
      `$1${prefix}$2`
    );
  });

  return text;
}
const getDirectories = async function(src) {
  return new Promise((resolve, reject) => {
    glob(src + '/**/*.{js,jsx,ts,tsx}', { nodir: true }, function(err, res) {
      if (err) reject();
      resolve(res);
    })
  });
};

const tailwindClassesToArray = async () => {
  try {
    const css = (
      await fs.readFile('./output.css', { encoding: 'utf8' })
    ).replace(/\.\\!|\.-/g, '.').replace(/\\|:hover/g, '').replace(/md:|sm:|xs:|xxs:|hover:|group-hover:/g, '');
    const matches = css.matchAll(/\.(.*?)\s(?=\.|{)/g);

    return new Set(Array.from(matches, (m) => m[1]));
  } catch (err) {
    console.log(err);
  }
};

execute();

