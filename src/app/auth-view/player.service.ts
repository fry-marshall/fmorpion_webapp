import { Injectable } from "@angular/core";
import { HttpService } from "../../../library_v2/src/app/services/http.service";
import { AuthDto } from "./auth.dto";

@Injectable({
    providedIn: 'root'
})
export class PlayerService{

    constructor(private httpService: HttpService){}

    signin(authDto: AuthDto){
        return this.httpService.post('players/signin', authDto)
    }

    signup(authDto: AuthDto){
        return this.httpService.post('players/signup', authDto)
    }

    getPlayer(){
        return this.httpService.get('players/me')
    }
    
}