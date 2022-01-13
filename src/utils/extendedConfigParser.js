/**
 * Creates a class that extends the ConfigParser class from cordova-lib.
 * The goal is to add functionalities, while taking advantage of the parser
 * that is already provided by the library. The class must be created
 * inside a function because we need the Cordova context in order to
 * require the library as a Cordova module.
 * @param context the Cordova context, used to require cordova-lib
 * @returns a class that extends ConfigParser with extra functionalities
 */
 function createClass(context) {
    const ConfigParser = context.requireCordovaModule('cordova-lib').configparser;

    return class ExtendedConfigParser extends ConfigParser {

        constructor(path) {
            super(path);
        }

        getPreferenceNames(platform) {
            let parents = [ this.doc.getroot() ];

            if (platform) {
                const platformParent = this.doc.findall(`./platform[@name="${platform}"]`).pop();
                if (platformParent) {
                    parents.push(platformParent);
                }
            }

            let names = [];
            parents.forEach((parent) => parent.findall('preference').forEach((elem) => {
                const name = elem.attrib.name;

                if (!names.includes(name)) {
                    names.push(name);
                }
            }));

            return names;
        }
    };
}

/**
 * Creates an instance of a class that extends the ConfigParser class
 * from cordova-lib. This class has more functions than the original one.
 * @param context the Cordova context, used to require cordova-lib
 * @param {string?} path the config.xml file, defaults to config.xml
 * @returns {ExtendedConfigParser} that extends ConfigParser with more functions
 */
function createInstance(context, path = 'config.xml') {
    const clazz = createClass(context);
    return new clazz(path);
}

module.exports = {
    createInstance: createInstance
};