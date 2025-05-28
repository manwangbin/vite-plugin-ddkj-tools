import { Plugin } from "vite";
import { parse } from "@vue/compiler-sfc";

function loadAppFile(code: string, id: string) {
    const res = parse(code, { sourceMap: false, filename: id, templateParseOptions: { parseMode: 'sfc' } });
    let script = "<script setup lang=\"ts\">";
    script += "\nimport { TDevTools, ddkjWsReject } from 'vite-plugin-ddkj-tools';";
    script += "\nddkjWsReject(import.meta.hot);";
    
    if (res.descriptor.scriptSetup?.content) {
        script += res.descriptor.scriptSetup?.content;
    }
    script += "\nimport 'vite-plugin-ddkj-tools/dist/vite-plugin-ddkj-tools.css';";
    script += "\n</script>";

    let template = "<template>\n";
    template += "  <div class=\"ddkj-vite-tools-main\">\n"
    template += "    <div class=\"ddkj-vite-tools-container\">\n"
    if (res.descriptor.template?.content) {
        template += res.descriptor.template.content;
    }
    template += "    </div>\n";
    template += "    <TDevTools />\n";
    template += "  </div>\n";
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
    return { code: newCode };
}

export default function ddkjDevTools(): Plugin {
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
            }
        },

        // configureServer(server) {
        //     startServer(server);
        // },
        sharedDuringBuild: true,
    }
}