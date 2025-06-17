import { defineStore } from "pinia";
import { Ref, ref } from "vue";
import { getApp, getToken, getUserInfo } from "./shared";
import { Auth } from "../typings/auth";
import DdkjAccount from "../api/modal/ddkj-account";
import Application from "../api/modal/application";
import { Router } from "vue-router";

export const useDdkjToolStore = defineStore("ddkj-tool", () => {
    const token = ref(getToken());
    const userInfo = ref(getUserInfo());
    const app = ref(getApp());

    const layoutModules: Ref<Record<string, () => Promise<unknown>>> = ref({});

    const dynamicViewsModules:Ref<Record<string, () => Promise<unknown>>> = ref({});
    const viewModuleKeys:Ref<Array<string>> = ref([]);

    const router:Ref<Router | undefined> = ref();

    /** Reset auth store */
    async function resetStore() {
        localStorage.clear();
        const authStore = useDdkjToolStore();
        authStore.$reset();
    }

    function loginByToken(loginToken: DdkjAccount) {
        sessionStorage.setItem('ddkjDesignToken', loginToken.token);
        sessionStorage.setItem('ddkjDesignTokenType', loginToken.tokenType);
        token.value = loginToken.token;

        setUserInfo({account: loginToken.account, avatar: loginToken.avatar, name: loginToken.name} as Auth.AccountInfo);
        if (loginToken.app) {
            setApp(loginToken.app);
        }
    }

    function setUserInfo(info: Auth.AccountInfo) {
        userInfo.value = { ...info };
        sessionStorage.setItem("ddkjDesignUserInfo", JSON.stringify(info));
    }

    function setApp(appInfo: Application) {
        app.value = {...appInfo};
        sessionStorage.setItem("ddkjDesignApp", JSON.stringify(appInfo));
    }

    function setLayoutModules(modules: Record<string, () => Promise<unknown>>) {
        layoutModules.value = modules;
    }

    function setDynamicViewsModules(modules: Record<string, () => Promise<unknown>>) {
        dynamicViewsModules.value = modules;
        viewModuleKeys.value = [...Object.keys(modules)];
    }

    function setRouter(appRouter : Router) {
        router.value = appRouter;
    }

    return {
        token,
        userInfo,
        app,
        layoutModules,
        dynamicViewsModules,
        viewModuleKeys,
        router,
        resetStore,
        loginByToken,
        setUserInfo,
        setLayoutModules,
        setDynamicViewsModules,
        setRouter
    };
});