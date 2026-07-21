import {UserSituation} from "../user-situation";


export class User {
    private _passwordHash: string;
    id: number;
    name: string;
    phone: string;
    email: string;
    situation: UserSituation;
}