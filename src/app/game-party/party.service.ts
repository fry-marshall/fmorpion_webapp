import { Injectable } from "@angular/core";
import { HttpService } from "../../../library_v2/src/app/services/http.service";

@Injectable({
    providedIn: 'root'
})
export class PartyService{

    constructor(private httpService: HttpService){}

    getParties(){
        return this.httpService.get('parties/me')
    }

    createParty(){
        return this.httpService.post(`parties`, {});
    }

    joinParty(code: string){
        return this.httpService.put(`parties/join?code=${code}`, {});
    }
    
}