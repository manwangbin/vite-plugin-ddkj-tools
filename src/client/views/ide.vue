<script setup lang="ts">
import { computed, h, reactive } from 'vue';
import { Button, ConfigProvider, Divider, Tooltip, Tree } from 'ant-design-vue';
import DevTools from './dev-tools.vue';
import DdkjService from './ddkj.service';
import { message, theme } from 'ant-design-vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { useDdkjToolStore } from '../store/ddkj.store';
import UserAvatar from './components/user-avatar.vue';
import { FullscreenOutlined, PlusOutlined } from '@ant-design/icons-vue';
import PagesMeu from './components/pages-meu.vue';

interface PageState {
    fullmode: boolean;
    perviewInit: boolean;
    windowWidth: number;
    windowHeight: number;
    pageHeader: number;
    leftWidth: number;
    rightWidth: number;
    wsWidth: number;
    wsHeight: number;
    wsHeader: number;
    wsFotter: number;
    currentPage: string;
}

const pageState: PageState = reactive({
    fullmode: false,
    perviewInit: false,
    windowWidth: 0,
    windowHeight: 0,
    pageHeader: 36,
    leftWidth: 200,
    rightWidth: 300,
    wsHeader: 32,
    wsWidth: 0,
    wsHeight: 0,
    wsFotter: 40,
    currentPage: ''
});

let resizeTimer: any;
const handleResize = () => {
    if (resizeTimer) {
        clearTimeout(resizeTimer);
    }
    resizeTimer = setTimeout(() => {
        if (pageState.windowWidth && pageState.windowWidth > 0 && pageState.windowHeight && pageState.windowHeight > 0) {
            pageState.perviewInit = true;
            resizeTimer = undefined;
        }
    }, 800);
}

const computedWindowsSize = () => {
    pageState.perviewInit = false;
    pageState.windowWidth = document.body.clientWidth;
    pageState.windowHeight = document.body.clientHeight;
    handleResize();
}

window.addEventListener('resize', () => {
    computedWindowsSize();
})
computedWindowsSize();

const workspaceWidth = computed(() => {
    if (pageState.fullmode) {
        return pageState.windowWidth - 10;

    } else {
        return pageState.windowWidth - pageState.leftWidth - pageState.rightWidth - 20;

    }
});
const workspaceHeight = computed(() => {
    if (pageState.fullmode) {
        return pageState.windowHeight - 10;
    } else {
        return pageState.windowHeight - pageState.pageHeader - pageState.wsHeader - pageState.wsFotter;
    }
});
const scale = computed(() => {
    if (pageState.windowWidth && pageState.windowWidth > 0) {
        return workspaceWidth.value / pageState.windowWidth;
    } else {
        return 1;
    }
});
const perviewHeight = computed(() => workspaceHeight.value / scale.value);

const ddkjStore = useDdkjToolStore();
if (ddkjStore.router) {
    ddkjStore.router.afterEach((to: any) => {
        let documentTitle = to.params.title;
        if (!documentTitle) {
            const { title } = to.meta;
            documentTitle = title;
        } else {
            documentTitle = documentTitle as string;
        }

        pageState.currentPage = documentTitle;
    })
}

const service = new DdkjService();
service.ddkjLogin().then((res) => {
    ddkjStore.loginByToken(res);
}).catch(error => message.error(error.msg || "服务器错误！"));


const handleToFull = () => {
    pageState.fullmode = true;
    window.addEventListener('keydown', handleKeydown);
    message.info("按'ESC'键退出全屏模式")
}

const handleToNormal = () => {
    pageState.fullmode = false;
    window.removeEventListener('keydown', handleKeydown);
}

const handleKeydown = (e: any) => {
    if (e.keyCode === 27) {
        handleToNormal();
    }
}


</script>

<template>
    <ConfigProvider :locale="zhCN" :theme="{
        algorithm: theme.darkAlgorithm,
        token: { colorPrimary: '#3B8EEA' },
    }">
        <div class="ddkj-ide">
            <header v-if="!pageState.fullmode">
                <div class="title-bar">什码开发</div>
                <div class="toptool"></div>
                <div class="account-bar">
                    <Tooltip title="全屏" v-show="!pageState.fullmode">
                        <Button shape="circle" size="small" :icon="h(FullscreenOutlined)" @click="handleToFull" />
                    </Tooltip>
                    <Divider type="vertical" />
                    <UserAvatar />
                </div>
            </header>

            <main>
                <div class="left-blocks" v-show="!pageState.fullmode">
                    <div class="menu-bar">
                        <span>页面</span>
                        <div class="menu-tools">
                            <Button size="small" :icon="h(PlusOutlined)" />
                        </div>
                    </div>
                    <PagesMeu class="menu-tree" />
                </div>

                <div class="body" :class="{ 'body-full': pageState.fullmode }">
                    <div class="work-header" v-show="!pageState.fullmode">{{ pageState.currentPage || "页面标题" }}</div>

                    <div ref="workspace" class="work-space">
                        <div class="perview">
                            <slot></slot>
                        </div>
                    </div>

                    <div class="dev-tools" v-show="!pageState.fullmode">
                        <DevTools />
                    </div>
                </div>
                <div class="right-blocks" v-show="!pageState.fullmode"></div>
            </main>
        </div>
    </ConfigProvider>
</template>

<style lang="less">
.ddkj-ide {
    .ant-btn {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 4px;
    }

    .left-blocks {
        .ant-tree {
            margin: 5px;
            font-size: 12px !important;
        }
    }
}
</style>

<style lang="less" scoped>
.ddkj-ide {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    position: relative;
    color: #fff;
    font-size: 12px;
    background: @ddkj-background;

    header {
        --header-height: v-bind(pageState.pageHeader + 'px') width: 100%;
        height: @ide-header-height;
        border-bottom: 1px solid @ddkj-border-color;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        padding: 0px 10px;
        font-size: 13px;

        .title-bar {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            gap: 4px;
            width: auto;
            color: @ddkj-primary;

            img {
                width: 24px;
                height: 24px;
            }
        }

        .toptool {
            flex: 1;
        }

        .account-bar {
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
            align-items: center;
            gap: 8px;
        }
    }

    main {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        width: 100%;
        height: calc(100vh - @ide-header-height);
        background-image: linear-gradient(to right, #11151e, #201219);

        .left-blocks {
            --leftWidth: v-bind(pageState.leftWidth + 'px');
            width: var(--leftWidth);
            height: 100%;
            border-right: 1px solid #3d3f4166;

            .menu-bar {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                padding: 4px 10px;
                border-bottom: 1px solid #3d3f4166;

                .menu-tools {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-end;
                    align-items: center;

                    button {
                        width: 20px;
                        height: 20px;
                        font-size: 10px;
                    }
                }

                .menu-tree {
                    width: 100%;
                    height: 100%;
                }
            }
        }

        .body {
            flex: 1;
            height: 100%;
            padding: 0px 10px 0px 10px;

            .work-header {
                --ws-header: v-bind(pageState.wsHeader + 'px');
                width: 100%;
                height: var(--ws-header);
                line-height: var(--ws-header);
                color: #fff;
                font-size: 12px;
            }

            .work-space {
                --wswidth: v-bind(workspaceWidth + 'px');
                --wsheight: v-bind(workspaceHeight + 'px');
                width: var(--wswidth);
                height: var(--wsheight);

                &::-webkit-scrollbar {
                    width: 0px;
                }

                .perview {
                    --scale: v-bind(scale);
                    --per-width: v-bind(pageState.windowWidth + 'px');
                    --per-height: v-bind(perviewHeight + 'px');

                    width: var(--per-width);
                    height: var(--per-height);
                    transform: scale(var(--scale));
                    transform-origin: left top;

                    box-shadow: 0px 0px 10px 0px #eacd76ee;
                    border-radius: 6px;
                    background: #fff;
                    color: #000;
                }
            }

            .dev-tools {
                --ws-fotter: v-bind(pageState.wsFotter + 'px');
                width: 100%;
                height: var(--ws-fotter);
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: flex-end;
            }
        }

        .body-full {
            padding: 5px;
        }

        .right-blocks {
            --rightWidth: v-bind(pageState.rightWidth + 'px');
            width: var(--rightWidth);
            height: 100%;
        }

    }
}
</style>