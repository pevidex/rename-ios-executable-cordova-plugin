const fs = require("fs");
const path = require("path");
const xcode = require("xcode");
const ExtendedConfigParser = require('./utils/extendedConfigParser');

const PREFERENCE_NAME = "IOSExecutableName";
const BUILD_SETTING_NAME = "EXECUTABLE_NAME";

module.exports = async (context) => {
  const platform = context.opts.cordova.platforms[0];
  if (platform != "ios") {
    return;
  }
  const parser = ExtendedConfigParser.createInstance(context);
  const executableName = parser.getPreference(PREFERENCE_NAME, platform);
  if(!executableName) {
    return;
  }
  console.log("Renaming iOS executable to "+executableName);
  const xcodeProjPath = searchRecursiveFromPath(
    "platforms/ios",
    ".xcodeproj",
    false
  );
  const projectPath = xcodeProjPath + "/project.pbxproj";
  console.log("Found", projectPath);

  const proj = xcode.project(projectPath);
  proj.parseSync();

  const pbxXCConfigurationList = proj.pbxXCConfigurationList();
  let hash;
  for (let key in pbxXCConfigurationList) {
    if (
      key.includes("_comment") &&
      pbxXCConfigurationList[key].includes("PBXNativeTarget")
    ) {
      hash = key.replace("_comment", "");
      break;
    }
  }

  const buildConfigurations = pbxXCConfigurationList[hash].buildConfigurations;
  const pbxXCBuildConfigurationSection = proj.pbxXCBuildConfigurationSection();
  buildConfigurations.forEach((buildConfiguration) => {
    pbxXCBuildConfigurationSection[buildConfiguration.value].buildSettings[
      BUILD_SETTING_NAME
    ] = `"${executableName}"`;
  });

  fs.writeFileSync(proj.filepath, proj.writeSync(), "utf8", function (err) {
    if (err) {
      return;
    }
    console.log("finished writing xcodeproj");
  });
};
/**
 * Recursively search for file with the tiven filter starting on startPath
 */
function searchRecursiveFromPath(startPath, filter, rec, multiple) {
  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return;
  }

  var files = fs.readdirSync(startPath);
  var resultFiles = [];
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory() && rec) {
      fromDir(filename, filter); //recurse
    }

    if (filename.indexOf(filter) >= 0) {
      if (multiple) {
        resultFiles.push(filename);
      } else {
        return filename;
      }
    }
  }
  if (multiple) {
    return resultFiles;
  }
}
