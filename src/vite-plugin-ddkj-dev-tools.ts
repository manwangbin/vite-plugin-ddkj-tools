import { Plugin } from "vite";
import { parse} from "@vue/compiler-sfc";

function parseAppFile(id: string, code: string):string {
    const res = parse(code, {sourceMap: false, filename: id, templateParseOptions: {parseMode: 'sfc'}});
    let script = "<script setup lang=\"ts\">\nimport { DevTools } from 'vite-plugin-ddkj-tools';";
    if (res.descriptor.scriptSetup?.content) {
        script += res.descriptor.scriptSetup?.content;
    }
    script += "\n</script>"

    let template = "<template>\n";
    if (res.descriptor.template?.content) {
        template += res.descriptor.template.content;
    }
    template += "  <DevTools />\n";
    template += "</template>";

    let styles = '';
    if (res.descriptor.styles) {
        res.descriptor.styles.forEach(style => {
            let styleContent = "<style";
            if (style.lang) {
                styleContent += " lang=\"" + style.lang + "\"";
            }
            if (style.scoped) {
                styleContent += " scoped";
            }
            styleContent += ">";

            styleContent += style.content;
            styleContent += "</style>\n";

            styles += styleContent;
        });
    }

    const newCode = script + "\n" + template + "\n" + styles;    
    return newCode;
}

export default function ddkjDevTools(): Plugin {
    return {
        name: 'vite-plugin-ddkj-dev-tools',
        apply: 'serve',
        transform(code: string, id: string, options: any) {
            if (options?.ssr) {
                return;
            }

            if (id.endsWith("App.vue")) {
                return parseAppFile(id, code);
            }

            return code;
        }
    }
}