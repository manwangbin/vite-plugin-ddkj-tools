import { Auth } from "@/client/typings/auth";
import Application from "./application";

export default interface DdkjAccount extends Auth.LoginToken {

    account: string;

    avatar: string;

    name: string;

    app: Application;
}