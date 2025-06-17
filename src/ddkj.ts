import { Plugin } from "vite";
import { parse } from "@vue/compiler-sfc";
import startServer from "./server/server";

function loadAppFile(code: string, id: string) {
    const res = parse(code, { sourceMap: false, filename: id, templateParseOptions: { parseMode: 'sfc' } });
    let script = "<script setup lang=\"ts\">";
    script += "import { TIde, ddkjWsReject, useDdkjToolStore } from 'vite-plugin-ddkj-tools';\n";
    script += "import 'vite-plugin-ddkj-tools/dist/vite-plugin-ddkj-tools.css';\n";
    script += "import { useRouter } from 'vue-router';\n";

    if (res.descriptor.scriptSetup?.content) {
        script += res.descriptor.scriptSetup?.content;
    }

    script += "\nddkjWsReject(import.meta.hot);\n";

    script += "\nconst ddkjInjectRouter = useRouter();\n";
    script += "const ddkjToolStore = useDdkjToolStore();\n";
    script += "ddkjToolStore.setRouter(ddkjInjectRouter);\n";

    script += "\nconst layoutModules = import.meta.glob('./layouts/**/*.{vue,tsx}');\n";
    script += "ddkjToolStore.setLayoutModules(layoutModules);\n";
    
    script += "const dynamicViewsModules = import.meta.glob('./views/**/*.{vue,tsx}');\n";
    script += "ddkjToolStore.setDynamicViewsModules(dynamicViewsModules);\n";
    script += "\n</script>";
    let template = "<template>\n";
    template += " <TIde>\n";
    if (res.descriptor.template?.content) {
        template += res.descriptor.template.content;
    }
    template += " </TIde>\n"
    template += "</template>";

    let styles = '';
    if (res.descriptor.styles) {
        res.descriptor.styles.forEach(style => {
            let styleContent = "\n<style";
            if (style.lang) {
                styleContent += " lang=\"" + style.lang + "\"";
            }
            if (style.scoped) {
                styleContent += " scoped";
            }
            styleContent += ">";

            styleContent += style.content;
            styleContent += "</style>";

            styles += styleContent;
        });
    }

    const newCode = script + "\n" + template + "\n" + styles;
    console.log("app code ", newCode);
    return { code: newCode };
}

function loadMainFile(code: string, id: string) {
    const lines = code.split("\n");
    let newCode = "";
    let lineNum = 0;
    for (; lineNum < lines.length; lineNum++) {
        if (lines[lineNum].startsWith("import")) {
            newCode += lines[lineNum] + '\n';
        } else {
            break;
        }
    }

    newCode += "import { registDdkjByApp } from 'vite-plugin-ddkj-tools'; \n";

    for (; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];
        const createAppIndex = line.indexOf("createApp(App)");
        if (createAppIndex > -1) {
            const appVar = findCreateAppVar(line, createAppIndex);
            const createAppEndIndex = createAppIndex + "createApp(App)".length;
            if (appVar) {
                newCode += line + "\n";
                newCode += "registDdkjByApp(" + appVar + ");" + "\n";

            } else {
                newCode += "const app = createApp(App);\n";
                newCode += "registDdkjByApp(app);\n";
                newCode += line.substring(0, createAppIndex) + " " + "app" + line.substring(createAppEndIndex);

            }

        } else {
            newCode += line + "\n";

        }
    }

    return { code: newCode, id: id };
}

function findCreateAppVar(line: string, endIndex: number) {
    var findEqualTag = false;
    var beginVarChar = false;
    var varName = '';
    for (let i = endIndex; i >= 0; i--) {
        if (line.charAt(i) === ' ' || line.charAt(i) === '  ') {
            if (beginVarChar) {
                break;

            } else {
                continue;

            }
        }

        if (line.charAt(i) === '=') {
            findEqualTag = true;

        } else if (findEqualTag) {
            if (!beginVarChar) {
                beginVarChar = true;
            }

            varName += line.charAt(i);

        }
    }

    if (varName.length > 0) {
        return varName.split('').reverse().join('');

    } else {
        return undefined;

    }
}

export default function ddkjDevTools(appId: number): Plugin {
    return {
        name: 'vite-plugin-ddkj-tools',
        apply: 'serve',
        enforce: "pre",
        transform(code: string, id: string, options) {
            if (options?.ssr) {
                return;
            }

            if (id.endsWith("App.vue")) {
                return loadAppFile(code, id);

            } else if (id.endsWith("main.ts") || id.endsWith("main.js")) {
                return loadMainFile(code, id);

            }
        },

        configureServer(server) {
            startServer(appId, server);
        },

        sharedDuringBuild: true,
    }
}