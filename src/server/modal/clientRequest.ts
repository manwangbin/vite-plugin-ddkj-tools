import { ResponseType } from "axios";

export default interface ClientRequest {

    id: string;

    url: string;

    method: string;

    params: any;

    data: any;
    
    headers: any;

    responseType: ResponseType;
}